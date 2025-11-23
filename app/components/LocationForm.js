'use client'

import { useState } from 'react'

export default function LocationForm({ onAddLocation }) {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert('Please fill in all fields')
      return
    }

    const lat = parseFloat(formData.latitude)
    const lng = parseFloat(formData.longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)')
      return
    }

    onAddLocation({
      name: formData.name,
      latitude: lat,
      longitude: lng
    })

    setFormData({ name: '', latitude: '', longitude: '' })
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev, 
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Location Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Toronto Downtown"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Latitude
          </label>
          <input
            type="number"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="e.g., 43.6532"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Longitude
          </label>
          <input
            type="number"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="e.g., -79.3832"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-700"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
      >
        Add Location
      </button>
    </form>
  )
}