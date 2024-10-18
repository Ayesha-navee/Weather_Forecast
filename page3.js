
const weatherApiKey = '608912e386285f941d2cd47944a5c396'; // OpenWeatherMap API key
const geminiApiKey = 'AIzaSyBO3q2-Tq6pd8jBSz69D7WKk9emQzyB5bQ'; // Replace with your actual Gemini API keys


// Event listener for the chatbot input
document.getElementById('sendMessageBtn').addEventListener('click', handleChatbotMessage);

async function handleChatbotMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    const chatbox = document.getElementById('chatbox');

    if (!userInput) {
        alert('Please enter a message');
        return;
    }

    // Display the user's message
    chatbox.innerHTML += `<div class="user-message">You: ${userInput}</div>`;

    // Check for weather-related questions
    if (userInput.toLowerCase().includes('weather')) {
        const city = extractCity(userInput);
        if (city) {
            await getFiveDayWeather(city); // Fetch weather data
        } else {
            chatbox.innerHTML += `<div class="bot-message">Bot: Please specify a city.</div>`;
        }
    } else {
        chatbox.innerHTML += `<div class="bot-message">Bot: I'm a simple chatbot. I can only provide weather information!</div>`;
    }

    // Clear input and scroll chatbox to the bottom
    document.getElementById('userInput').value = '';
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Function to extract city name from user input
function extractCity(userInput) {
    const words = userInput.split(' ');
    const cityIndex = words.indexOf('in') + 1; // Assuming input like "weather in CityName"
    return cityIndex > 0 ? words.slice(cityIndex).join(' ') : null; // Join remaining words as city name
}


async function getFiveDayWeather(city) {
    console.log("City entered:", city);

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${weatherApiKey}`;
    console.log("API URL:", apiUrl);

    try {
        const response = await fetch(apiUrl);
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        console.log("Weather data received:", data);
        displayFiveDayWeather(data);
    } catch (error) {
        alert('Error fetching data: ' + error.message);
        console.error('Error fetching data:', error);
    }
}


function displayFiveDayWeather(data) {
    const weatherTableBody = document.getElementById('weatherInfoContainer');
    if (!weatherTableBody) {
        console.error("Weather table body element not found!");
        return;
    }

    weatherTableBody.innerHTML = ''; // Clear previous data

    const table = document.createElement('table');
    table.className = 'weather-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Weather</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    weatherTableBody.appendChild(table);

    const tableBody = table.querySelector('tbody');
    const isCelsius = !document.getElementById('unitToggle').checked;

    // Get one forecast per day at 12:00
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    
    dailyForecasts.slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const temp = isCelsius ? forecast.main.temp.toFixed(1) : celsiusToFahrenheit(forecast.main.temp).toFixed(1);
        const humidity = forecast.main.humidity;
        const weatherCondition = forecast.weather[0]?.description || 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${temp} °${isCelsius ? 'C' : 'F'}</td>
            <td>${humidity}%</td>
            <td>${weatherCondition}</td>
        `;
        tableBody.appendChild(row);
    });
}

document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    getFiveDayWeather(city);
});

document.getElementById('sendMessageBtn').addEventListener('click', handleChatbotMessage);

function handleChatbotMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    const chatbox = document.getElementById('chatbox');

    if (!userInput) {
        alert('Please enter a message');
        return;
    }

    chatbox.innerHTML += `<div class="user-message">You: ${userInput}</div>`;

    let botResponse = "I'm a simple chatbot. I can only respond to basic weather-related queries.";
    const lowerCaseInput = userInput.toLowerCase();

    if (lowerCaseInput.includes('weather') || lowerCaseInput.includes('temperature')) {
        botResponse = "To get weather information, please use the 'Get Weather' button above and enter a city name.";
    } else if (lowerCaseInput.includes('hello') || lowerCaseInput.includes('hi')) {
        botResponse = "Hello! How can I assist you with weather information today?";
    } else if (lowerCaseInput.includes('bye') || lowerCaseInput.includes('goodbye')) {
        botResponse = "Goodbye! Feel free to return if you need more weather information.";
    }

    chatbox.innerHTML += `<div class="bot-message">Bot: ${botResponse}</div>`;
    document.getElementById('userInput').value = '';
    chatbox.scrollTop = chatbox.scrollHeight;
}

document.getElementById('locationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;
            
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    console.log("Weather data (Location) received:", data);
                    displayFiveDayWeather(data);
                })
                .catch(error => {
                    alert('Error fetching data: ' + error.message);
                    console.error('Error fetching data:', error);
                });
        }, () => {
            alert('Unable to retrieve your location');
        });
    } else {
        alert('Geolocation is not supported by this browser');
    }
});

document.getElementById('unitToggle').addEventListener('change', () => {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    if (city) {
        getFiveDayWeather(city);
    }
});

// Initial call to set up the page
document.addEventListener('DOMContentLoaded', () => {
    const defaultCity = 'London';
    document.getElementById('cityInput').value = defaultCity;
    getFiveDayWeather(defaultCity);
});