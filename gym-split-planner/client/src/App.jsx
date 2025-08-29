import React, { useState, useEffect } from 'react'
import ExerciseLibrary from './components/ExerciseLibrary'
import WeekBoard from './components/WeekBoard'
import VolumePanel from './components/VolumePanel'

const API_BASE = 'http://localhost:3000/api'

function App() {
  const [exercises, setExercises] = useState([])
  const [plan, setPlan] = useState({
    name: 'My Workout Plan',
    days: [
      { name: 'Monday', exercises: [] },
      { name: 'Tuesday', exercises: [] },
      { name: 'Wednesday', exercises: [] },
      { name: 'Thursday', exercises: [] },
      { name: 'Friday', exercises: [] },
      { name: 'Saturday', exercises: [] },
      { name: 'Sunday', exercises: [] }
    ]
  })
  const [planId, setPlanId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load exercises from API
  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_BASE}/exercises`)
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const addExerciseToDay = (exercise, dayName) => {
    setPlan(prevPlan => ({
      ...prevPlan,
      days: prevPlan.days.map(day => {
        if (day.name === dayName) {
          return {
            ...day,
            exercises: [...day.exercises, {
              ...exercise,
              sets: exercise.default_sets,
              reps: exercise.default_reps,
              rir: exercise.default_rir
            }]
          }
        }
        return day
      })
    }))
  }

  const removeExerciseFromDay = (dayName, exerciseIndex) => {
    setPlan(prevPlan => ({
      ...prevPlan,
      days: prevPlan.days.map(day => {
        if (day.name === dayName) {
          return {
            ...day,
            exercises: day.exercises.filter((_, index) => index !== exerciseIndex)
          }
        }
        return day
      })
    }))
  }

  const updateExercise = (dayName, exerciseIndex, field, value) => {
    setPlan(prevPlan => ({
      ...prevPlan,
      days: prevPlan.days.map(day => {
        if (day.name === dayName) {
          return {
            ...day,
            exercises: day.exercises.map((exercise, index) => {
              if (index === exerciseIndex) {
                return { ...exercise, [field]: parseInt(value) || 0 }
              }
              return exercise
            })
          }
        }
        return day
      })
    }))
  }

  const savePlan = async () => {
    try {
      const response = await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan)
      })
      const data = await response.json()
      setPlanId(data.id)
      alert('Plan saved successfully!')
    } catch (error) {
      console.error('Failed to save plan:', error)
      alert('Failed to save plan')
    }
  }

  const loadPlan = async () => {
    const planIdInput = prompt('Enter plan ID:')
    if (!planIdInput) return

    try {
      const response = await fetch(`${API_BASE}/plans/${planIdInput}`)
      if (!response.ok) {
        throw new Error('Plan not found')
      }
      const data = await response.json()
      setPlan(data)
      setPlanId(data.id)
      alert('Plan loaded successfully!')
    } catch (error) {
      console.error('Failed to load plan:', error)
      alert('Failed to load plan')
    }
  }

  const sharePlan = async () => {
    if (!planId) {
      alert('Please save the plan first')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/plans/${planId}/public`, {
        method: 'POST'
      })
      const data = await response.json()
      const shareUrl = `${window.location.origin}/share/${data.slug}`
      navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Failed to create share link:', error)
      alert('Failed to create share link')
    }
  }

  if (loading) {
    return <div className="app">Loading...</div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Gym Split Planner</h1>
      </header>
      
      <main className="main-content">
        <div className="panel">
          <ExerciseLibrary 
            exercises={exercises} 
            onAddExercise={addExerciseToDay}
          />
        </div>
        
        <div className="week-board">
          <WeekBoard 
            plan={plan}
            onRemoveExercise={removeExerciseFromDay}
            onUpdateExercise={updateExercise}
          />
        </div>
        
        <div className="panel">
          <VolumePanel plan={plan} />
          <div className="controls">
            <button className="control-button save-button" onClick={savePlan}>
              Save Plan
            </button>
            <button className="control-button load-button" onClick={loadPlan}>
              Load Plan
            </button>
            <button className="control-button share-button" onClick={sharePlan}>
              Share
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
