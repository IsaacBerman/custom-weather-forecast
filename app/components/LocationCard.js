'use client'

import { useState, useEffect } from 'react'
import { fetchWeatherData } from '../utils/weather'

export default function LocationCard({ location, onDelete }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchWeatherData(location.latitude, location.longitude)
        setWeather(data)
      } catch (err) {
        setError('Failed to load weather data')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [location.latitude, location.longitude])

  // Update the getWeatherIcon function in LocationCard.js to match:
    const getWeatherIcon = (code) => {
    // More specific weather icons based on WMO codes
    if (code === 0) return '☀️'; // Clear sky
    if (code === 1) return '🌤️'; // Mainly clear
    if (code === 2) return '⛅'; // Partly cloudy
    if (code === 3) return '☁️'; // Overcast
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 57) return '🌧️'; // Drizzle
    if (code >= 61 && code <= 67) return '🌧️'; // Rain
    if (code >= 71 && code <= 77) return '❄️'; // Snow
    if (code >= 80 && code <= 82) return '🌦️'; // Rain showers
    if (code >= 85 && code <= 86) return '🌨️'; // Snow showers
    if (code >= 95 && code <= 99) return '⛈️'; // Thunderstorm
    return '🌤️'; // Default
    };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{location.name}</h3>
          <button
            onClick={() => onDelete(location.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{location.name}</h3>
        <button
          onClick={() => onDelete(location.id)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete
        </button>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°W
      </div>

      {/* Current Weather */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
           <div className="text-3xl font-bold text-gray-900">
                {Math.round(weather.current.temperature_2m)}°C
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-2xl">{getWeatherIcon(weather.current.weather_code)}</span>
              <div>
                <div className="font-semibold text-gray-800">{weather.current.weather_text}</div>
                <div className="text-sm text-gray-600">Current</div>
              </div>
            </div>
          </div>
          <div className="text-right text-sm space-y-1">
            <div className="bg-white px-2 py-1 rounded border">
              <span className="font-semibold text-gray-900">{`Precip: ${weather.current.precipitation.toFixed(1)}mm`}</span> 
            </div>
            <div className="bg-white px-2 py-1 rounded border">
              <span className="font-semibold text-gray-900">{`Clouds: ${Math.round(weather.current.cloud_cover)}%`}</span> 
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}