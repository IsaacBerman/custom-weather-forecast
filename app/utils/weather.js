import { fetchWeatherApi } from "openmeteo";

// Weather code to text mapping based on WMO codes
const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

// Helper function to find most common value in array
const findMostCommon = (arr) => {
  const frequency = {};
  let maxCount = 0;
  let mostCommon = arr[0];
  
  for (const value of arr) {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxCount) {
      maxCount = frequency[value];
      mostCommon = value;
    }
  }
  
  return mostCommon;
};

// Helper function to convert UTC time to EST
const convertUTCToEST = (utcTimestamp) => {
  // utcTimestamp is in seconds, convert to milliseconds
  const utcDate = new Date(utcTimestamp * 1000);
  return new Date(utcDate.toLocaleString("en-US", { timeZone: "America/New_York" }));
};

// Helper function to check if a UTC timestamp falls within EST hours
const isInESTPeriod = (utcTimestamp, startHourEST, endHourEST) => {
  const estDate = convertUTCToEST(utcTimestamp);
  const estHour = estDate.getHours();
  return estHour >= startHourEST && estHour < endHourEST;
};

export async function fetchWeatherData(latitude, longitude) {
  try {
    const params = {
      latitude,
      longitude,
      hourly: ["temperature_2m", "precipitation", "precipitation_probability", "weather_code"],
      current: ["temperature_2m", "precipitation", "weather_code", "cloud_cover"],
      timezone: "America/New_York", // Force EST timezone for the API response
      forecast_days: 7
    };

    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);
    
    if (!responses || responses.length === 0) {
      throw new Error('No response from weather API');
    }

    const response = responses[0];
    const current = response.current();
    const hourly = response.hourly();

    // Process current weather - already in EST due to timezone parameter
    const currentData = {
      time: new Date(Number(current.time()) * 1000), // Already in EST
      temperature_2m: current.variables(0).value(),
      precipitation: current.variables(1).value(),
      weather_code: current.variables(2).value(),
      weather_text: weatherCodeMap[current.variables(2).value()] || 'Unknown',
      cloud_cover: current.variables(3).value(),
    };

    // Process hourly data - times are already in EST due to timezone parameter
    const range = (start, stop, step) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Get raw UTC timestamps to properly filter by EST hours
    const utcTimestamps = range(
      Number(hourly.time()),
      Number(hourly.timeEnd()),
      hourly.interval()
    );

    const hourlyData = {
      time: utcTimestamps.map(utcTimestamp => {
        return convertUTCToEST(utcTimestamp); // Convert to EST for display
      }),
      utcTimestamps: utcTimestamps, // Keep UTC timestamps for proper filtering
      temperature_2m: hourly.variables(0).valuesArray(),
      precipitation: hourly.variables(1).valuesArray(),
      precipitation_probability: hourly.variables(2).valuesArray(),
      weather_code: hourly.variables(3).valuesArray(),
    };

    // Add weather text mapping
    hourlyData.weather_text = hourlyData.weather_code.map(
      code => weatherCodeMap[code] || 'Unknown'
    );

    console.log("Sample UTC timestamps:", utcTimestamps.slice(0, 5));
    console.log("Sample EST times:", hourlyData.time.slice(0, 5));

    // Group data by EST date and time periods (7am-12pm = morning, 12pm-5pm = afternoon)
    const dailyData = {};
    
    utcTimestamps.forEach((utcTimestamp, index) => {
      const estTime = hourlyData.time[index];
      const estDateKey = estTime.toDateString();
      
      if (!dailyData[estDateKey]) {
        dailyData[estDateKey] = {
          morning: { indices: [] },
          afternoon: { indices: [] }
        };
      }
      
      // Morning: 7am-12pm EST (7-11)
      if (isInESTPeriod(utcTimestamp, 7, 12)) {
        dailyData[estDateKey].morning.indices.push(index);
      }
      // Afternoon: 12pm-5pm EST (12-17)
      else if (isInESTPeriod(utcTimestamp, 12, 17)) {
        dailyData[estDateKey].afternoon.indices.push(index);
      }
    });

    // Calculate daily summaries
    const dailySummaries = Object.entries(dailyData).map(([dateString, periods]) => {
      const date = new Date(dateString);
      
      const calculatePeriodSummary = (periodIndices, periodName) => {
        if (periodIndices.length === 0) return null;
        
        const temps = periodIndices.map(i => hourlyData.temperature_2m[i]);
        const pops = periodIndices.map(i => hourlyData.precipitation_probability[i]);
        const precipitations = periodIndices.map(i => hourlyData.precipitation[i]);
        const weatherCodes = periodIndices.map(i => hourlyData.weather_code[i]);
        
        return {
          period: periodName,
          temperature: temps.reduce((sum, temp) => sum + temp, 0) / temps.length, // Average temperature
          precipitation_probability: Math.max(...pops),
          precipitation_total: precipitations.reduce((sum, precip) => sum + precip, 0),
          weather_code: Math.max(...weatherCodes),
          weather_text: weatherCodeMap[Math.max(...weatherCodes)] || 'Unknown',
          hour_count: periodIndices.length
        };
      };
      
      return {
        date,
        dateString,
        morning: calculatePeriodSummary(periods.morning.indices, 'morning'),
        afternoon: calculatePeriodSummary(periods.afternoon.indices, 'afternoon')
      };
    }).filter(day => day.morning !== null || day.afternoon !== null);

    // Sort daily summaries by date
    dailySummaries.sort((a, b) => a.date - b.date);

    console.log("Daily summaries:", dailySummaries);

    return {
      current: currentData,
      hourly: hourlyData,
      daily: dailySummaries
    };

  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data: ' + error.message);
  }
}