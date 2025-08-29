import React from 'react'

function WeekBoard({ plan, onRemoveExercise, onUpdateExercise }) {
  return (
    <div className="week-board">
      {plan.days.map(day => (
        <div key={day.name} className="day-column">
          <div className="day-header">
            <h3 className="day-name">{day.name}</h3>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {day.exercises.length} exercises
            </span>
          </div>
          
          {day.exercises.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              padding: '2rem',
              fontStyle: 'italic'
            }}>
              No exercises added yet
            </div>
          ) : (
            day.exercises.map((exercise, index) => (
              <div key={index} className="day-exercise">
                <div className="exercise-info">
                  <div className="exercise-name">{exercise.name}</div>
                  <div className="exercise-muscle">{exercise.primary_muscle}</div>
                </div>
                
                <div className="exercise-controls">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={exercise.sets}
                      onChange={(e) => onUpdateExercise(day.name, index, 'sets', e.target.value)}
                      className="exercise-controls"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Reps</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={exercise.reps}
                      onChange={(e) => onUpdateExercise(day.name, index, 'reps', e.target.value)}
                      className="exercise-controls"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>RIR</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={exercise.rir}
                      onChange={(e) => onUpdateExercise(day.name, index, 'rir', e.target.value)}
                      className="exercise-controls"
                    />
                  </div>
                  
                  <button
                    className="remove-button"
                    onClick={() => onRemoveExercise(day.name, index)}
                    title="Remove exercise"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  )
}

export default WeekBoard
