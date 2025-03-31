const apiKey = "fa40c307f3b80fc8b1820d4e540bb327"; 
let map;


const weatherIcons = {
    "01d": "fas fa-sun",          
    "01n": "fas fa-moon",          
    "02d": "fas fa-cloud-sun",     
    "02n": "fas fa-cloud-moon",   
    "03d": "fas fa-cloud",       
    "03n": "fas fa-cloud",
    "04d": "fas fa-cloud",         
    "04n": "fas fa-cloud",
    "09d": "fas fa-cloud-rain",    
    "09n": "fas fa-cloud-rain",
    "10d": "fas fa-cloud-sun-rain",
    "10n": "fas fa-cloud-moon-rain",
    "11d": "fas fa-bolt",          
    "11n": "fas fa-bolt",
    "13d": "fas fa-snowflake",     
    "13n": "fas fa-snowflake",
    "50d": "fas fa-smog",         
    "50n": "fas fa-smog"
};


function initMap(lat = -28.4793, lon = 24.6727) {
    if (map) map.remove();
    map = L.map('map').setView([lat, lon], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}


function getWeatherIcon(iconCode) {
    return weatherIcons[iconCode] || "fas fa-question";
}


async function fetchWeather(city) {
    try {
       
        if (city.toLowerCase().includes("south africa") || city.toLowerCase() === "sa") {
            city = "Johannesburg";
        }

    
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city},ZA&appid=${apiKey}&units=metric`
        );
        const currentData = await currentRes.json();

        if (currentData.cod !== 200) {
            throw new Error(currentData.message);
        }

    
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city},ZA&appid=${apiKey}&units=metric`
        );
        const forecastData = await forecastRes.json();

        updateUI(currentData, forecastData);
        updateMap(currentData.coord.lat, currentData.coord.lon, currentData.name);

    } catch (error) {
        alert(`Error: ${error.message}\nTry: Johannesburg, Cape Town, Durban, Pretoria`);
    }
}


function updateMap(lat, lon, cityName) {
    if (map) map.remove();
    map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${cityName}</b>`)
        .openPopup();
}


function updateUI(currentData, forecastData) {
 
    document.getElementById("city-name").textContent = currentData.name;
    document.querySelector(".temp").innerHTML = `${Math.round(currentData.main.temp)}<span>°C</span>`;
    document.querySelector(".description").textContent = 
        currentData.weather[0].description.charAt(0).toUpperCase() + 
        currentData.weather[0].description.slice(1);
    
   
    const weatherIcon = document.querySelector(".weather-icon i");
    weatherIcon.className = getWeatherIcon(currentData.weather[0].icon);
   
    document.getElementById("humidity").textContent = `${currentData.main.humidity}%`;
    document.getElementById("wind").textContent = `${(currentData.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById("feels-like").textContent = `${Math.round(currentData.main.feels_like)}°C`;

    const forecastCards = document.getElementById("forecast-cards");
    forecastCards.innerHTML = "";
  
    for (let i = 0; i < forecastData.list.length; i += 8) {
        const day = forecastData.list[i];
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
            <div>${new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}</div>
            <i class="${getWeatherIcon(day.weather[0].icon)}"></i>
            <div>${Math.round(day.main.temp)}°C</div>
            <small>${day.weather[0].description}</small>
        `;
        forecastCards.appendChild(card);
    }
}

// Get user's current location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Reverse geocode to get city name
                fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=${apiKey}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            fetchWeather(data[0].name);
                        }
                    });
            },
            (error) => {
                alert("Location access denied. Using default location.");
                fetchWeather("Johannesburg");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        fetchWeather("Johannesburg");
    }
}

// Event Listeners
document.getElementById("search-btn").addEventListener("click", () => {
    const city = document.getElementById("city-input").value.trim();
    if (city) fetchWeather(city);
});

document.getElementById("location-btn").addEventListener("click", getLocation);


document.querySelectorAll(".city-buttons button").forEach(button => {
    button.addEventListener("click", () => {
        fetchWeather(button.dataset.city);
    });
});

// Initialize
initMap();
fetchWeather("Johannesburg");