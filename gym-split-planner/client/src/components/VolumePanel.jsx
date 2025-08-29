import React from 'react'

function VolumePanel({ plan }) {
  // Calculate volume metrics
  const calculateVolume = () => {
    const muscleVolume = {}
    const muscleFrequency = {}
    const hardSets = []
    
    plan.days.forEach(day => {
      day.exercises.forEach(exercise => {
        // Calculate volume for primary muscle
        if (!muscleVolume[exercise.primary_muscle]) {
          muscleVolume[exercise.primary_muscle] = 0
          muscleFrequency[exercise.primary_muscle] = 0
        }
        
        muscleVolume[exercise.primary_muscle] += exercise.sets
        muscleFrequency[exercise.primary_muscle] += 1
        
        // Check for hard sets (RIR ≤ 1)
        if (exercise.rir <= 1) {
          hardSets.push({
            day: day.name,
            exercise: exercise.name,
            sets: exercise.sets,
            rir: exercise.rir
          })
        }
      })
    })
    
    return { muscleVolume, muscleFrequency, hardSets }
  }
  
  const { muscleVolume, muscleFrequency, hardSets } = calculateVolume()
  
  const getVolumeColor = (volume) => {
    if (volume >= 4) return 'green'
    return 'blue'
  }
  
  const getVolumeText = (volume) => {
    if (volume >= 4) return 'Adequate'
    return 'Low Volume'
  }
  
  const getFrequencyColor = (frequency) => {
    if (frequency >= 3) return 'green'
    if (frequency >= 2) return 'yellow'
    return 'red'
  }
  
  const getFrequencyText = (frequency) => {
    if (frequency >= 3) return 'Optimal'
    if (frequency >= 2) return 'Minimum'
    return 'Insufficient'
  }
  
  const totalSets = Object.values(muscleVolume).reduce((sum, volume) => sum + volume, 0)
  const totalExercises = plan.days.reduce((sum, day) => sum + day.exercises.length, 0)
  
  return (
    <div className="volume-panel">
      <h2>Volume Analysis</h2>
      
      <div className="volume-section">
        <h3>Weekly Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Total Sets:</span>
          <span style={{ fontWeight: '600' }}>{totalSets}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Total Exercises:</span>
          <span style={{ fontWeight: '600' }}>{totalExercises}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Workout Days:</span>
          <span style={{ fontWeight: '600' }}>
            {plan.days.filter(day => day.exercises.length > 0).length}
          </span>
        </div>
      </div>
      
      <div className="volume-section">
        <h3>Muscle Group Analysis</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: '600' }}>Muscle Group</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Sets</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Frequency</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(muscleVolume).map(([muscle, volume]) => {
                const frequency = muscleFrequency[muscle]
                const volumeColor = getVolumeColor(volume)
                const frequencyColor = getFrequencyColor(frequency)
                
                return (
                  <tr key={muscle} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.5rem', fontWeight: '500' }}>{muscle}</td>
                    <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: volumeColor === 'green' ? '#dcfce7' : '#dbeafe',
                        color: volumeColor === 'green' ? '#166534' : '#1e40af',
                        fontWeight: '500'
                      }}>
                        {volume}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: frequencyColor === 'green' ? '#dcfce7' : frequencyColor === 'yellow' ? '#fef3c7' : '#fee2e2',
                        color: frequencyColor === 'green' ? '#166534' : frequencyColor === 'yellow' ? '#92400e' : '#dc2626',
                        fontWeight: '500'
                      }}>
                        {frequency}x/week
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem' }}>
                        <div style={{ color: volumeColor === 'green' ? '#10b981' : '#3b82f6' }}>
                          Volume: {getVolumeText(volume)}
                        </div>
                        <div style={{ color: frequencyColor === 'green' ? '#10b981' : frequencyColor === 'yellow' ? '#f59e0b' : '#ef4444' }}>
                          Freq: {getFrequencyText(frequency)}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* {hardSets.length > 0 && (
        <div className="volume-section">
          <h3>Hard Sets Warning</h3>
          <div className="warning">
            <strong>⚠️ {hardSets.length} hard sets detected (RIR ≤ 1)</strong>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {hardSets.map((set, index) => (
                <div key={index}>
                  {set.day}: {set.exercise} ({set.sets} sets, RIR {set.rir})
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}
      
      <div className="volume-section">
        <h3>Volume Guidelines</h3>
        <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Minimum:</span> 4–8 sets per week per muscle group
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#3b82f6', fontWeight: '600' }}>Adequate:</span> 8+ sets per week per muscle group
          </div>
        </div>
      </div>
      
      <div className="volume-section">
        <h3>Muscle Group Frequency</h3>
        <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#f59e0b', fontWeight: '600' }}>Minimum:</span> Train each muscle group 2x per week
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Optimal:</span> Aim to train each muscle group 3x per week
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolumePanel

