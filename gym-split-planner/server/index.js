
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(morgan('dev'));
app.use(express.json());


const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});


app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));


app.get('/api/exercises', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, primary_muscle, secondary_muscles,
              default_sets, default_reps, default_rir,
              force_type, difficulty_level, mechanic_type, 
              equipment, category, instructions, image_paths, exercise_id
       FROM exercises ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});


app.post('/api/plans', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { name, days } = req.body;
    
    // Create plan
    const planResult = await client.query(
      'INSERT INTO plans (name) VALUES ($1) RETURNING id',
      [name]
    );
    const planId = planResult.rows[0].id;
    
    // Create days
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayResult = await client.query(
        'INSERT INTO days (plan_id, day_name, day_order) VALUES ($1, $2, $3) RETURNING id',
        [planId, day.name, i + 1]
      );
      const dayId = dayResult.rows[0].id;
      
      // Add exercises to day
      for (let j = 0; j < day.exercises.length; j++) {
        const exercise = day.exercises[j];
        await client.query(
          `INSERT INTO day_exercises 
           (day_id, exercise_id, sets, reps, rir, exercise_order) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [dayId, exercise.id, exercise.sets, exercise.reps, exercise.rir, j + 1]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ id: planId });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create plan' });
  } finally {
    client.release();
  }
});

// Get a plan by ID
app.get('/api/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get plan details
    const planResult = await pool.query(
      'SELECT id, name, created_at, updated_at FROM plans WHERE id = $1',
      [id]
    );
    
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const plan = planResult.rows[0];
    
    // Get days with exercises
    const daysResult = await pool.query(
      `SELECT d.id, d.day_name, d.day_order,
              de.sets, de.reps, de.rir, de.exercise_order,
              e.id as exercise_id, e.name, e.primary_muscle, e.secondary_muscles
       FROM days d
       LEFT JOIN day_exercises de ON d.id = de.day_id
       LEFT JOIN exercises e ON de.exercise_id = e.id
       WHERE d.plan_id = $1
       ORDER BY d.day_order, de.exercise_order`,
      [id]
    );
    
    // Group exercises by day
    const days = [];
    let currentDay = null;
    
    daysResult.rows.forEach(row => {
      if (!currentDay || currentDay.name !== row.day_name) {
        currentDay = {
          id: row.id,
          name: row.day_name,
          order: row.day_order,
          exercises: []
        };
        days.push(currentDay);
      }
      
      if (row.exercise_id) {
        currentDay.exercises.push({
          id: row.exercise_id,
          name: row.name,
          primary_muscle: row.primary_muscle,
          secondary_muscles: row.secondary_muscles,
          sets: row.sets,
          reps: row.reps,
          rir: row.rir,
          order: row.exercise_order
        });
      }
    });
    
    res.json({ ...plan, days });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get plan' });
  }
});

// Update a plan
app.put('/api/plans/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { name, days } = req.body;
    
    // Update plan name
    await client.query(
      'UPDATE plans SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [name, id]
    );
    
    // Delete existing days (cascades to day_exercises)
    await client.query('DELETE FROM days WHERE plan_id = $1', [id]);
    
    // Recreate days
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayResult = await client.query(
        'INSERT INTO days (plan_id, day_name, day_order) VALUES ($1, $2, $3) RETURNING id',
        [id, day.name, i + 1]
      );
      const dayId = dayResult.rows[0].id;
      
      // Add exercises to day
      for (let j = 0; j < day.exercises.length; j++) {
        const exercise = day.exercises[j];
        await client.query(
          `INSERT INTO day_exercises 
           (day_id, exercise_id, sets, reps, rir, exercise_order) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [dayId, exercise.id, exercise.sets, exercise.reps, exercise.rir, j + 1]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update plan' });
  } finally {
    client.release();
  }
});

// Create public share for a plan
app.post('/api/plans/:id/public', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate a unique slug
    const slug = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Check if plan exists
    const planExists = await pool.query('SELECT id FROM plans WHERE id = $1', [id]);
    if (planExists.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Create public share
    await pool.query(
      'INSERT INTO public_shares (plan_id, slug) VALUES ($1, $2)',
      [id, slug]
    );
    
    res.json({ slug });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create public share' });
  }
});

// Get public plan by slug
app.get('/api/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Get plan ID from slug
    const shareResult = await pool.query(
      'SELECT plan_id FROM public_shares WHERE slug = $1',
      [slug]
    );
    
    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Share not found' });
    }
    
    const planId = shareResult.rows[0].plan_id;
    
    
    const planResult = await pool.query(
      'SELECT id, name, created_at, updated_at FROM plans WHERE id = $1',
      [planId]
    );
    
    const plan = planResult.rows[0];
    
    
    const daysResult = await pool.query(
      `SELECT d.id, d.day_name, d.day_order,
              de.sets, de.reps, de.rir, de.exercise_order,
              e.id as exercise_id, e.name, e.primary_muscle, e.secondary_muscles
       FROM days d
       LEFT JOIN day_exercises de ON d.id = de.day_id
       LEFT JOIN exercises e ON de.exercise_id = e.id
       WHERE d.plan_id = $1
       ORDER BY d.day_order, de.exercise_order`,
      [planId]
    );
    
    // Group exercises by day
    const days = [];
    let currentDay = null;
    
    daysResult.rows.forEach(row => {
      if (!currentDay || currentDay.name !== row.day_name) {
        currentDay = {
          id: row.id,
          name: row.day_name,
          order: row.day_order,
          exercises: []
        };
        days.push(currentDay);
      }
      
      if (row.exercise_id) {
        currentDay.exercises.push({
          id: row.exercise_id,
          name: row.name,
          primary_muscle: row.primary_muscle,
          secondary_muscles: row.secondary_muscles,
          sets: row.sets,
          reps: row.reps,
          rir: row.rir,
          order: row.exercise_order
        });
      }
    });
    
    res.json({ ...plan, days });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get public plan' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
