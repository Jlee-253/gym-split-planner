
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

async function testDatabase() {
  try {
    console.log('Testing database setup...');
    
  
    const { rows: countRows } = await pool.query('SELECT COUNT(*) as count FROM exercises');
    console.log(`✓ Total exercises: ${countRows[0].count}`);
    
    
    const { rows: sampleRows } = await pool.query(`
      SELECT name, primary_muscle, category, equipment, difficulty_level 
      FROM exercises 
      ORDER BY RANDOM() 
      LIMIT 5
    `);
    
    console.log('\n✓ Sample exercises:');
    sampleRows.forEach(exercise => {
      console.log(`  - ${exercise.name} (${exercise.primary_muscle}, ${exercise.category}, ${exercise.equipment || 'No equipment'}, ${exercise.difficulty_level})`);
    });
    

    const { rows: categoryRows } = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM exercises 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n✓ Exercise categories:');
    categoryRows.forEach(cat => {
      console.log(`  - ${cat.category}: ${cat.count} exercises`);
    });
    
   
    const { rows: equipmentRows } = await pool.query(`
      SELECT equipment, COUNT(*) as count 
      FROM exercises 
      WHERE equipment IS NOT NULL 
      GROUP BY equipment 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log('\n✓ Top equipment types:');
    equipmentRows.forEach(equip => {
      console.log(`  - ${equip.equipment}: ${equip.count} exercises`);
    });
    
    console.log('\n✓ Database test completed successfully!');
    
  } catch (err) {
    console.error('Database test failed:', err);
  } finally {
    await pool.end();
  }
}

testDatabase();
