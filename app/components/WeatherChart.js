'use client'

import { useState, useEffect } from 'react'
import { fetchWeatherData } from '../utils/weather'

export default function WeatherChart({ locations }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      if (locations.length === 0) {
        setChartData([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const allData = await Promise.all(
          locations.map(async (location) => {
            const weather = await fetchWeatherData(location.latitude, location.longitude)
            return {
              location: location.name,
              daily: weather.daily.slice(0, 7) // Get next 7 days
            }
          })
        )
        setChartData(allData)
      } catch (error) {
        console.error('Error loading chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [locations])

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
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'America/New_York' // Ensure dates are in EST
    })
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">7-Day Forecast Comparison</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h3 className="text-xl font-semibold mb-4">7-Day Forecast Comparison</h3>
        <p className="text-gray-500">Add locations to see comparison charts</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-700">7-Day Forecast Comparison (EST)</h3>
      
      <div className="space-y-8">
        {chartData.map((locationData, locationIndex) => (
          <div key={locationData.location} className="border-b pb-6 last:border-b-0">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">
              {locationData.location}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {locationData.daily.map((day, dayIndex) => (
                <div key={dayIndex} className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-sm font-semibold text-center mb-3 text-gray-700">
                    {formatDate(day.date)}
                  </div>
                  
                  {/* Morning Section */}
                  {day.morning && (
                    <div className="mb-4 p-2 bg-orange-50 rounded border">
                      <div className="text-xs font-semibold text-orange-800 text-center mb-1">
                        🌅 Morning
                      </div>
                      <div className="text-center space-y-1">
                        <div className="flex justify-center items-center space-x-1">
                          <span className="text-lg">{getWeatherIcon(day.morning.weather_code)}</span>
                          <span className="text-sm font-bold text-gray-900">{Math.round(day.morning.temperature)}°C</span>
                        </div>
                        <div className="text-xs text-gray-600">POP: {Math.round(day.morning.precipitation_probability)}%</div>
                        <div className="text-xs text-gray-600">Precip: {day.morning.precipitation_total.toFixed(1)}mm</div>
                        <div className="text-xs text-gray-900 font-medium min-h-[2rem] flex items-center justify-center px-1" 
                             title={day.morning.weather_text}>
                          {day.morning.weather_text}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Afternoon Section */}
                  {day.afternoon && (
                    <div className="p-2 bg-yellow-50 rounded border">
                      <div className="text-xs font-semibold text-yellow-800 text-center mb-1">
                        ☀️ Afternoon
                      </div>
                      <div className="text-center space-y-1">
                        <div className="flex justify-center items-center space-x-1">
                          <span className="text-lg">{getWeatherIcon(day.afternoon.weather_code)}</span>
                          <span className="text-sm font-bold text-gray-900">{Math.round(day.afternoon.temperature)}°C</span>
                        </div>
                        <div className="text-xs text-gray-600">POP: {Math.round(day.afternoon.precipitation_probability)}%</div>
                        <div className="text-xs text-gray-600">Precip: {day.afternoon.precipitation_total.toFixed(1)}mm</div>
                        <div className="text-xs text-gray-900 font-medium min-h-[2rem] flex items-center justify-center px-1"
                             title={day.afternoon.weather_text}>
                          {day.afternoon.weather_text}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}