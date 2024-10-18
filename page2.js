const apiKey = '608912e386285f941d2cd47944a5c396';
let unit = 'metric'; // Default unit is Celsius ('metric' for Celsius, 'imperial' for Fahrenheit)

const currentWeather = document.getElementById('weatherWidget');
let forecastData = [];

// Event listeners for buttons
document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        updateWeatherDisplay(city);
    } else {
        alert("Please enter a valid city name.");
    }
});

// Main function to update weather display
async function updateWeatherDisplay(city) {
    await getWeatherData(city);
    await getForecastData(city);
}

// Fetch current weather data by city
async function getWeatherData(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();
        displayCurrentWeather(data);
        displayCurrentWeatherChart(data);
    } catch (error) {
        currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Fetch forecast data by city
async function getForecastData(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(forecastUrl);
        const data = await response.json();
        forecastData = data; // Store forecast data for further processing
        displayForecastCharts(data);
    } catch (error) {
        currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Display current weather information
function displayCurrentWeather(data) {
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    currentWeather.innerHTML = `
        <h3 id="cityName">${data.name}, ${data.sys.country}</h3>
        <p id="description">Description: ${data.weather[0].description}</p>
        <p id="temperature">Temperature: ${data.main.temp}${unitSymbol}</p>
        <p id="humidity">Humidity: ${data.main.humidity}%</p>
        <p id="windSpeed">Wind Speed: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
    `;
}

// Display current weather chart
function displayCurrentWeatherChart(data) {
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    const ctx = document.getElementById('tempBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Temp', 'Feels Like', 'Min Temp', 'Max Temp'],
            datasets: [{
                label: `Temperature (${unitSymbol})`,
                data: [data.main.temp, data.main.feels_like, data.main.temp_min, data.main.temp_max],
                backgroundColor: ['#f39c12', '#e74c3c', '#9b59b6', '#3498db']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Display forecast charts
function displayForecastCharts(data) {
    const forecastData = data.list.filter((_, index) => index % 8 === 0);
    const temps = forecastData.map(day => day.main.temp);
    const labels = forecastData.map(day => new Date(day.dt * 1000).toLocaleDateString());

    const lineCtx = document.getElementById('tempLineChart').getContext('2d');
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${unitSymbol})`,
                data: temps,
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const doughnutCtx = document.getElementById('weatherDonutChart').getContext('2d');
    const weatherConditions = forecastData.map(day => day.weather[0].main);
    const conditionCounts = weatherConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                label: 'Weather Conditions',
                data: Object.values(conditionCounts),
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
