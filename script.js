// Function to handle input field click and show previous searches
document
  .getElementById("location-input")
  .addEventListener("click", function () {
    const dropdown = document.getElementById("previous-searches");
    dropdown.style.display = "block";

    // Load previous searches from local storage
    loadPreviousSearches();
  });

  function hideDropdown() {
    const dropdown = document.getElementById("previous-searches");
    
    // Remove focus from the location input element
    document.getElementById("location-input").blur();
  
    // Hide dropdown after a short delay to check if the click occurred on a dropdown item
    setTimeout(function () {
      if (!dropdown.dataset.itemClicked) {
        dropdown.innerHTML = "";
        dropdown.style.height = "0px";
        dropdown.style.display = "none";
      }
    }, 100); // Adjust delay as needed
  }
  
  document.getElementById("location-input").addEventListener("blur", hideDropdown);
  


// Function to populate dropdown with previous searches
function loadPreviousSearches() {
  const previousLocations =
    JSON.parse(localStorage.getItem("weatherLocations")) || [];
  const dropdown = document.getElementById("previous-searches");
  dropdown.innerHTML = ""; // Clear existing content

  // Add each previous location as an option in the dropdown
  for (let i = 0; i < previousLocations.length; i++) {
    const location = previousLocations[i];
    const option = document.createElement("div");
    option.classList.add("dropdown-item");
    option.textContent = location;

    // Listen for click events on the dropdown items
    option.addEventListener("click", function () {
      const inputField = document.getElementById("location-input");
      inputField.value = location;

      // Hide dropdown after selecting an item

      handleInput(location);
    });
    dropdown.style.height = "auto";
    dropdown.appendChild(option);
  }
}

// Function to populate the dropdown with locations retrieved from the API
async function populateLocationDropdown(input) {
  try {
    const locations = await getCity(input);
    const dropdown = document.getElementById("previous-searches");
    dropdown.innerHTML = ""; // Clear existing content

    // Check if there are any matching cities
    if (locations.length === 0) {
      // If no matching cities, display a message
      const message = document.createElement("div");
      message.textContent = "No matching cities";
      dropdown.appendChild(message);
    } else {
      // Add each location as an option in the dropdown
      locations.forEach(location => {
        const option = document.createElement("div");
        option.classList.add("dropdown-item");

        // Customize the text content based on location properties
        if (location.name) {
          option.textContent = `${location.name}, ${location.state}, ${location.country}`;
        } else {
          option.textContent = `${location.state}, ${location.country}`;
        }

        // Listen for click events on the dropdown items
        option.addEventListener("click", function () {
          saveToLocalStorage(location.name);
          updateCoordinates(`${location.lat}, ${location.lon}`);
          getCurrentWeather();
          getTomorrowsForecast();
    
          // Hide dropdown after selecting an item
          dropdown.style.height = "0px";
          hideDropdown();
        });

        dropdown.appendChild(option);
      });
    }
    dropdown.style.display = "block";
    dropdown.style.height = "auto";
  } catch (error) {
    console.error("Error populating dropdown with locations:", error);
  }
}




// Function to save input to local storage
function saveToLocalStorage(input) {
  // Trim the input value to remove leading/trailing whitespace
  input = input.trim();

  // Check if the input is not empty
  if (input) {
    let locations = JSON.parse(localStorage.getItem("weatherLocations")) || [];

    // Capitalize the input
    input = capitalize(input);

    // Check if the input already exists in the array
    const index = locations.indexOf(input);
    if (index !== -1) {
      // Remove the existing input from its current position
      locations.splice(index, 1);
    }

    // Add the input to the beginning of the locations array
    locations.unshift(input);

    // Ensure the array contains at most 6 elements
    if (locations.length > 6) {
      // If the array length exceeds 6, remove the last element
      locations.pop();
    }

    // Save the updated array back to local storage
    localStorage.setItem("weatherLocations", JSON.stringify(locations));
  }
}


// Function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
