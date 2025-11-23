'use client'

import { useState, useEffect } from 'react'
import LocationForm from './components/LocationForm'
import LocationCard from './components/LocationCard'
import WeatherChart from './components/WeatherChart'

export default function Home() {
  const [locations, setLocations] = useState([])
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    const savedLocations = localStorage.getItem('weatherLocations')
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('weatherLocations', JSON.stringify(locations))
  }, [locations])

  const addLocation = (newLocation) => {
    setLocations(prev => [...prev, { ...newLocation, id: Date.now() }])
  }

  const deleteLocation = (id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white-800">
          Your Locations ({locations.length})
        </h2>
        <button
          onClick={() => setShowChart(!showChart)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showChart ? 'Show Current' : 'Show 7-Day Chart'}
        </button>
      </div>

      <LocationForm onAddLocation={addLocation} />

      {showChart ? (
        <WeatherChart locations={locations} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(location => (
            <LocationCard
              key={location.id}
              location={location}
              onDelete={deleteLocation}
            />
          ))}
          {locations.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg">No locations added yet.</p>
              <p>Add your first location above to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}