import React, { useState } from 'react'

function ExerciseLibrary({ exercises, onAddExercise }) {
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMuscle, setFilterMuscle] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterEquipment, setFilterEquipment] = useState('')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const muscles = [...new Set(exercises.map(ex => ex.primary_muscle))].sort()
  const categories = [...new Set(exercises.map(ex => ex.category).filter(Boolean))].sort()
  const equipment = [...new Set(exercises.map(ex => ex.equipment).filter(Boolean))].sort()

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMuscle = !filterMuscle || exercise.primary_muscle === filterMuscle
    const matchesCategory = !filterCategory || exercise.category === filterCategory
    const matchesEquipment = !filterEquipment || exercise.equipment === filterEquipment
    return matchesSearch && matchesMuscle && matchesCategory && matchesEquipment
  })

  const handleAddExercise = (exercise) => {
    onAddExercise(exercise, selectedDay)
  }

  return (
    <div>
      <h2>Exercise Library</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <select 
          value={selectedDay} 
          onChange={(e) => setSelectedDay(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginBottom: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        >
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginBottom: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        />
        
        <select
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem',
            marginBottom: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        >
          <option value="">All Muscles</option>
          {muscles.map(muscle => (
            <option key={muscle} value={muscle}>{muscle}</option>
          ))}
        </select>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem',
            marginBottom: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select
          value={filterEquipment}
          onChange={(e) => setFilterEquipment(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        >
          <option value="">All Equipment</option>
          {equipment.map(equipment => (
            <option key={equipment} value={equipment}>{equipment}</option>
          ))}
        </select>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="exercise-item">
            <div className="exercise-info">
              <div className="exercise-name">{exercise.name}</div>
              <div className="exercise-muscle">{exercise.primary_muscle}</div>
              {exercise.secondary_muscles && (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {exercise.secondary_muscles}
                </div>
              )}
              {exercise.category && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                  {exercise.category} • {exercise.equipment || 'No equipment'}
                </div>
              )}
              {exercise.difficulty_level && (
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '2px' }}>
                  {exercise.difficulty_level.charAt(0).toUpperCase() + exercise.difficulty_level.slice(1)}
                </div>
              )}
            </div>
            <button 
              className="add-button"
              onClick={() => handleAddExercise(exercise)}
            >
              Add to {selectedDay}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExerciseLibrary
