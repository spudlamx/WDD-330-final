const apiKey = "2ef850ed81f7733cf9ebb6a6db315ace";
const weatherIcon = document.querySelector("#weather-icon");
let latitude = "43.491651"; // Default latitude of Idaho Falls, Idaho
let longitude = "-112.033964"; // Default longitude of Idaho Falls, Idaho
let stateName = "";

async function getCity(city) {
  const cityGeoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
  try {
    const cityResponse = await fetch(cityGeoUrl);
    const cityData = await cityResponse.json();
    return cityData;
  } catch (error) {
    console.log("Error fetching city data:", error);
    throw error; // Propagate the error to the caller
  }
}

async function updateCoordinates(input) {
  try {
    // Check if input contains a comma (indicative of coordinates)
    if (input.includes(",")) {
      const coords = input.split(',').map(coord => coord.trim());
      latitude = coords[0];
      longitude = coords[1];
      stateName = ""; // Reset state name
    } else {
      // If input is not coordinates, assume it's a ZIP code
      const zipGeoUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${input}&appid=${apiKey}`;
      const zipResponse = await fetch(zipGeoUrl);
      const zipData = await zipResponse.json();

      if (zipData.lat && zipData.lon) {
        latitude = zipData.lat;
        longitude = zipData.lon;
        stateName = ""; // Reset state name
      } else {
        // If both city name and ZIP code fail, handle error or do nothing
        throw new Error("Unable to retrieve coordinates for the given input.");
      }
    }
    localStorage.setItem("weatherCoordinates", JSON.stringify({ latitude, longitude }));
  } catch (error) {
    console.log("Error updating coordinates:", error);
    throw error; // Propagate the error to the caller
  }
}


async function getCurrentWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check if the expected data structure is present in the response
    if (!data.main || !data.weather || !data.weather[0]) {
      throw new Error("Invalid response format from API");
    }

    const currentTemp = data.main.temp;
    const maxTemp = data.main.temp_max;
    const minTemp = data.main.temp_min;
    const currentHumidity = data.main.humidity;
    const wind = data.wind.speed;
    const currentWeather = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconSrc = `https://openweathermap.org/img/w/${iconCode}.png`;
    weatherIcon.setAttribute("src", iconSrc);
    weatherIcon.setAttribute("alt", data.weather[0].description);

    document.getElementById("location-name").textContent = `${data.name}, ${stateName} ${data.sys.country}`;
    document.getElementById("weather-description").textContent = currentWeather;
    document.getElementById("temperature").textContent = `${currentTemp}°F`;
    document.getElementById("highTemp").textContent = `${maxTemp}°F`;
    document.getElementById("lowTemp").textContent = `${minTemp}°F`;
    document.getElementById("wind-speed").textContent = `${wind} MPH`;
    document.getElementById("humidity").textContent = `${currentHumidity}%`;
    if (wind < 19){    
      document.getElementById("wind-icon").style.animation = `moveWindIcon ${(20 - wind) / 5}s linear infinite`;
    }else {    
      document.getElementById("wind-icon").style.animation = `moveWindIcon ${1}s linear infinite`;
    }

  } catch (error) {
    console.log("Error fetching current weather:", error);
    throw error; // Propagate the error to the caller
  }
}

async function getTomorrowsForecast() {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
  
  try {
    const response = await fetch(forecastUrl);
    const data = await response.json();

    // Check if the expected data structure is present in the response
    if (!data.list || !Array.isArray(data.list)) {
      throw new Error("Invalid response format from API");
    }

    const forecastData = data.list.slice(0, 3); // Extracting the next three entries

    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "<h3>Forcast</h3>";

    let currentDate = new Date(); // Initialize with current date
    currentDate.setDate(currentDate.getDate() + 1); // Increment to tomorrow

    forecastData.forEach((forecast) => {
      const temp = forecast.main.temp_max;
      const day = currentDate.toLocaleDateString("en-US", { weekday: "long" });
      const forecastElement = document.createElement("div");
      forecastElement.classList.add("infoPad");
      forecastElement.innerHTML = `<p>${day}: ${temp}°F</p>`;
      forecastContainer.appendChild(forecastElement);
      
      // Increment date for the next forecast
      currentDate.setDate(currentDate.getDate() + 1);
    });
  } catch (error) {
    console.log("Error fetching forecast:", error);
    throw error; // Propagate the error to the caller
  }
}

// Rest of your code remains unchanged

document.getElementById("search-form").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent default form submission

  const input = document.getElementById("location-input").value.trim();
  
  handleInput(input);
});


async function handleInput(input){
  if (input !== "") {
    if (input.includes(",")) { // Check if input contains a comma (coordinates)
      const [latitude, longitude] = input.split(",").map(coord => coord.trim());
      await updateCoordinates(`${latitude},${longitude}`);
      getCurrentWeather();
      getTomorrowsForecast();
      saveToLocalStorage(input);
      hideDropdown();
    } else if (!isNaN(input) && input.length === 5) { // Check if input is a number (ZIP code)
      await updateCoordinates(input);
      getCurrentWeather();
      getTomorrowsForecast();
      saveToLocalStorage(input);
      hideDropdown();
    } else { // Assume input is a city name
      try {
        populateLocationDropdown(input);
      } catch (error) {
        console.error("Error fetching city data:", error);
      }
    }
  } else {
    console.log("Please enter a city name, ZIP code, or coordinates.");
    // Display a message to prompt the user to enter input
  }
}

window.onload = async function () {
  // Retrieve the last saved coordinates from local storage
  const savedCoordinates = JSON.parse(localStorage.getItem("weatherCoordinates"));

  if (savedCoordinates && savedCoordinates.latitude && savedCoordinates.longitude) {
    // If coordinates are available, update them and fetch weather data
    latitude = savedCoordinates.latitude;
    longitude = savedCoordinates.longitude;
    getCurrentWeather();
    getTomorrowsForecast();
  } else {
    // If no coordinates are available, fetch weather data using default coordinates
    getCurrentWeather();
    getTomorrowsForecast();
  }
};

