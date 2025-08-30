# Gym Split Planner
This project was developed locally and uploaded as a complete portfolio piece
A full-stack web application for creating and managing workout plans with volume analysis and sharing capabilities.

## Features

- **Exercise Library**: Browse and search exercises by muscle group
- **Week Board**: Create workout plans with customizable sets, reps, and RIR
- **Volume Analysis**: Real-time volume tracking with color-coded recommendations
- **Plan Management**: Save, load, and share workout plans
- **Public Sharing**: Generate shareable links for workout plans
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: React.js, Vite
- **Database**: PostgreSQL with proper schema design
- **API**: RESTful API with full CRUD operations

## Project Structure

```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database configuration:
   ```
   PGUSER=your_username
   PGPASSWORD=your_password
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=gym_split_planner
   PORT=3000
   ```

4. Set up the database:
   ```bash
   npm run setup
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The React app will be available at `http://localhost:5173`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/exercises` - Get all exercises
- `POST /api/plans` - Create a new workout plan
- `GET /api/plans/:id` - Get a specific plan
- `PUT /api/plans/:id` - Update a plan
- `POST /api/plans/:id/public` - Create public share link
- `GET /api/public/:slug` - Get public plan by slug

## Database Schema

The application uses four main tables:

- **exercises**: Exercise library with muscle groups and default values
- **plans**: Workout plans with metadata
- **days**: Days within a plan
- **day_exercises**: Junction table linking exercises to days with sets/reps/rir



