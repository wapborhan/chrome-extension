/*
 * Material You NewTab
 * Copyright (c) 2023-2024 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Check if alert has already been shown
if (!localStorage.getItem("alertShown")) {
  // Show the alert after 4 seconds
  setTimeout(() => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const message = isMac
      ? "Press Cmd + Shift + B to show the bookmarks bar."
      : "Press Ctrl + Shift + B to show the bookmarks bar.";

    alert(message);

    // Set a flag in localStorage so the alert is not shown again
    localStorage.setItem("alertShown", "true");
  }, 4000);
}

let proxyurl;
let clocktype;
let hourformat;
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Cache DOM elements
    const userAPIInput = document.getElementById("userAPI");
    const userLocInput = document.getElementById("userLoc");
    const userProxyInput = document.getElementById("userproxy");
    const saveAPIButton = document.getElementById("saveAPI");
    const saveLocButton = document.getElementById("saveLoc");
    const resetbtn = document.getElementById("resetsettings");
    const saveProxyButton = document.getElementById("saveproxy");

    // Load saved data from localStorage
    const savedApiKey = localStorage.getItem("weatherApiKey");
    const savedLocation = localStorage.getItem("weatherLocation");
    const savedProxy = localStorage.getItem("proxy");

    // Pre-fill input fields with saved data
    if (savedLocation) userLocInput.value = savedLocation;
    if (savedApiKey) userAPIInput.value = savedApiKey;

    const defaultProxyURL = "https://mynt-proxy.rhythmcorehq.com"; //Default proxy url
    if (savedProxy && savedProxy !== defaultProxyURL) {
      userProxyInput.value = savedProxy;
    }

    // Function to simulate button click on Enter key press
    function handleEnterPress(event, buttonId) {
      if (event.key === "Enter") {
        document.getElementById(buttonId).click();
      }
    }

    // Add event listeners for handling Enter key presses
    userAPIInput.addEventListener("keydown", (event) =>
      handleEnterPress(event, "saveAPI")
    );
    userLocInput.addEventListener("keydown", (event) =>
      handleEnterPress(event, "saveLoc")
    );
    userProxyInput.addEventListener("keydown", (event) =>
      handleEnterPress(event, "saveproxy")
    );

    // Save API key to localStorage
    saveAPIButton.addEventListener("click", () => {
      const apiKey = userAPIInput.value.trim();
      localStorage.setItem("weatherApiKey", apiKey);
      userAPIInput.value = "";
      location.reload();
    });

    // Save location to localStorage
    saveLocButton.addEventListener("click", () => {
      const userLocation = userLocInput.value.trim();
      localStorage.setItem("weatherLocation", userLocation);
      userLocInput.value = "";
      location.reload();
    });

    // Reset settings (clear localStorage)
    resetbtn.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to reset your settings? This action cannot be undone."
        )
      ) {
        localStorage.clear();
        location.reload();
      }
    });

    // Save the proxy to localStorage
    saveProxyButton.addEventListener("click", () => {
      const proxyurl = userProxyInput.value.trim();

      // If the input is empty, use the default proxy.
      if (proxyurl === "") {
        localStorage.setItem("proxy", defaultProxyURL);
        userProxyInput.value = "";
        location.reload();
        return;
      }

      // Validate if input starts with 'http://' or 'https://'
      if (proxyurl.startsWith("http://") || proxyurl.startsWith("https://")) {
        if (!proxyurl.endsWith("/")) {
          localStorage.setItem("proxy", proxyurl);
          userProxyInput.value = "";
          location.reload();
        } else {
          alert("There shouldn't be / at the end of the link");
        }
      } else {
        alert("Only links (starting with http:// or https://) are allowed.");
      }
    });

    // Default Weather API key
    const weatherApiKeys = [
      "db0392b338114f208ee135134240312",
      "de5f7396db034fa2bf3140033240312",
      "c64591e716064800992140217240312",
      "9b3204c5201b4b4d8a2140330240312",
      "eb8a315c15214422b60140503240312",
      "cd148ebb1b784212b74140622240312",
      "7ae67e219af54df2840140801240312",
    ];
    const defaultApiKey =
      weatherApiKeys[Math.floor(Math.random() * weatherApiKeys.length)];

    // Determine API key and proxy URL to use
    const apiKey = savedApiKey || defaultApiKey;
    proxyurl = savedProxy || defaultProxyURL;

    // Determine the location to use
    let currentUserLocation = savedLocation;

    // If no saved location, fetch the IP-based location
    if (!currentUserLocation) {
      try {
        const geoLocation = "https://ipinfo.io/json/";
        const locationData = await fetch(geoLocation);
        const parsedLocation = await locationData.json();

        // If the country is India and the location is 'Delhi', update to 'New Delhi'
        if (
          parsedLocation.country === "IN" &&
          parsedLocation.city === "Delhi"
        ) {
          currentUserLocation = "New Delhi";
        } else {
          currentUserLocation = parsedLocation.city; // Update to user's city from IP
        }

        localStorage.setItem("weatherLocation", currentUserLocation); // Save and show the fetched location
      } catch (error) {
        currentUserLocation = "auto:ip"; // Fallback if fetching location fails
      }
    }

    const currentLanguage = getLanguageStatus("selectedLanguage") || "en";

    // Fetch weather data using Weather API
    const weatherApi = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${currentUserLocation}&aqi=no&lang=${currentLanguage}`;
    const data = await fetch(weatherApi);
    const parsedData = await data.json();

    // Weather data
    const conditionText = parsedData.current.condition.text;
    const tempCelsius = Math.round(parsedData.current.temp_c);
    const tempFahrenheit = Math.round(parsedData.current.temp_f);
    const humidity = parsedData.current.humidity;
    const feelsLikeCelsius = parsedData.current.feelslike_c;
    const feelsLikeFahrenheit = parsedData.current.feelslike_f;

    // Update DOM elements with the weather data
    document.getElementById("conditionText").textContent = conditionText;

    // Localize and display temperature and humidity
    const localizedHumidity = localizeNumbers(
      humidity.toString(),
      currentLanguage
    );
    const localizedTempCelsius = localizeNumbers(
      tempCelsius.toString(),
      currentLanguage
    );
    const localizedFeelsLikeCelsius = localizeNumbers(
      feelsLikeCelsius.toString(),
      currentLanguage
    );
    const localizedTempFahrenheit = localizeNumbers(
      tempFahrenheit.toString(),
      currentLanguage
    );
    const localizedFeelsLikeFahrenheit = localizeNumbers(
      feelsLikeFahrenheit.toString(),
      currentLanguage
    );

    // Set humidity level
    const humidityLabel =
      translations[currentLanguage]?.humidityLevel ||
      translations["en"].humidityLevel; // Fallback to English if translation is missing
    document.getElementById(
      "humidityLevel"
    ).innerHTML = `${humidityLabel} ${localizedHumidity}%`;

    // Event Listener for the Fahrenheit toggle
    const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
    const updateTemperatureDisplay = () => {
      const tempElement = document.getElementById("temp");
      const feelsLikeLabel =
        translations[currentLanguage]?.feelsLike ||
        translations["en"].feelsLike;
      if (fahrenheitCheckbox.checked) {
        tempElement.innerHTML = `${localizedTempFahrenheit}<span class="tempUnit">°F</span>`;
        const feelsLikeFUnit = currentLanguage === "cs" ? " °F" : "°F"; // Add space for Czech in Fahrenheit
        document.getElementById(
          "feelsLike"
        ).innerHTML = `${feelsLikeLabel} ${localizedFeelsLikeFahrenheit}${feelsLikeFUnit}`;
      } else {
        tempElement.innerHTML = `${localizedTempCelsius}<span class="tempUnit">°C</span>`;
        const feelsLikeCUnit = currentLanguage === "cs" ? " °C" : "°C"; // Add space for Czech in Celsius
        document.getElementById(
          "feelsLike"
        ).innerHTML = `${feelsLikeLabel} ${localizedFeelsLikeCelsius}${feelsLikeCUnit}`;
      }
    };
    updateTemperatureDisplay();

    // Setting weather Icon
    const newWIcon = parsedData.current.condition.icon;
    const weatherIcon = newWIcon.replace("//cdn", "https://cdn");
    document.getElementById("wIcon").src = weatherIcon;

    // Define minimum width for the slider based on the language
    const humidityMinWidth = {
      idn: "47%",
      en: "42%", // Default for English and others
    };
    const slider = document.getElementById("slider");
    slider.style.minWidth =
      humidityMinWidth[currentLanguage] || humidityMinWidth["en"];

    // Set slider width based on humidity
    if (humidity > 40) {
      slider.style.width = `calc(${humidity}% - 60px)`;
    }

    // Update location
    var city = parsedData.location.name;
    // var city = "Thiruvananthapuram";
    var maxLength = 10;
    var limitedText =
      city.length > maxLength ? city.substring(0, maxLength) + "..." : city;
    document.getElementById("location").textContent = limitedText;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }

  // Get the platform
  const platform = navigator.platform.toUpperCase();

  // Get the div element
  const bookmakrsMessage = document.getElementById("bookmakrsMessage");

  // Determine the message based on the platform
  let message = "";
  if (platform.indexOf("MAC") >= 0) {
    message = "Press Cmd (⌘) + Shift + B to show the bookmarks bar.";
  } else if (platform.indexOf("WIN") >= 0) {
    message = "Press Ctrl + Shift + B to show the bookmarks bar.";
  } else if (platform.indexOf("LINUX") >= 0) {
    message = "Press Ctrl + Shift + B to show the bookmarks bar.";
  } else if (/IPHONE|IPAD|ANDROID/i.test(platform)) {
    message = "Bookmarks bar functionality is not available on mobile devices.";
  } else {
    message = "Your device may not support showing the bookmarks bar.";
  }

  // Update the div with the message
  bookmakrsMessage.textContent = message;
});
// ---------------------------end of weather stuff--------------------

// ------------------------Google App Menu-----------------------------------
const iconContainer = document.getElementById("iconContainer");
const googleAppsCont = document.getElementById("googleAppsCont");

// Toggle menu and tooltip visibility
googleAppsCont.addEventListener("click", function (event) {
  const isMenuVisible = iconContainer.style.display === "grid";

  // Toggle menu visibility
  iconContainer.style.display = isMenuVisible ? "none" : "grid";

  // Add or remove the class to hide the tooltip
  if (!isMenuVisible) {
    googleAppsCont.classList.add("menu-open"); // Hide tooltip
  } else {
    googleAppsCont.classList.remove("menu-open"); // Restore tooltip
  }

  event.stopPropagation();
});

// Close menu when clicking outside
document.addEventListener("click", function (event) {
  const isClickInside =
    iconContainer.contains(event.target) ||
    googleAppsCont.contains(event.target);

  if (!isClickInside && iconContainer.style.display === "grid") {
    iconContainer.style.display = "none"; // Hide menu
    googleAppsCont.classList.remove("menu-open"); // Restore tooltip
  }
});
// ------------------------End of Google App Menu Setup-----------------------------------

// Showing border or outline when you click on the searchbar
const searchbar = document.getElementById("searchbar");
searchbar.addEventListener("click", function (event) {
  event.stopPropagation(); // Stop the click event from propagating to the document
  searchbar.classList.add("active");
});

document.addEventListener("click", function (event) {
  // Check if the clicked element is not the searchbar
  if (!searchbar.contains(event.target)) {
    searchbar.classList.remove("active");
  }
});

// Search function
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.querySelector(".dropdown-content");

  document.addEventListener("click", (event) => {
    if (dropdown.style.display == "block") {
      event.stopPropagation();
      dropdown.style.display = "none";
    }
  });

  document
    .querySelector(".dropdown-btn")
    .addEventListener("click", function (event) {
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });

  const enterBTN = document.getElementById("enterBtn");
  const searchInput = document.getElementById("searchQ");
  const searchEngineRadio = document.getElementsByName("search-engine");
  const searchDropdowns = document.querySelectorAll(
    '[id$="-dropdown"]:not(*[data-default])'
  );
  const defaultEngine = document.querySelector(
    '#default-dropdown-item div[id$="-dropdown"]'
  );

  const sortDropdown = () => {
    // Change the elements to the array
    const elements = Array.from(searchDropdowns);

    // Sort the dropdown
    const sortedDropdowns = elements.sort((a, b) => {
      const engineA = parseInt(a.getAttribute("data-engine"), 10);
      const engineB = parseInt(b.getAttribute("data-engine"), 10);

      return engineA - engineB;
    });

    // get the parent
    const parent = sortedDropdowns[0]?.parentNode;

    // Append the items. if parent exists.
    if (parent) {
      sortedDropdowns.forEach((item) => parent.appendChild(item));
    }
  };

  // This will add event listener for click in the search bar
  searchDropdowns.forEach((element) => {
    element.addEventListener("click", () => {
      const engine = element.getAttribute("data-engine");
      const radioButton = document.querySelector(
        `input[type="radio"][value="engine${engine}"]`
      );

      radioButton.checked = true;

      // Swap The dropdown. and sort them
      swapDropdown(element);
      sortDropdown();

      localStorage.setItem("selectedSearchEngine", radioButton.value);
    });
  });

  // Make entire search-engine div clickable
  document.querySelectorAll(".search-engine").forEach((engineDiv) => {
    engineDiv.addEventListener("click", () => {
      const radioButton = engineDiv.querySelector('input[type="radio"]');

      radioButton.checked = true;

      const radioButtonValue = radioButton.value.charAt(
        radioButton.value.length - 1
      );

      const element = document.querySelector(
        `[data-engine="${radioButtonValue}"]`
      );

      // Swap The dropdown.
      swapDropdown(element);
      sortDropdown();

      localStorage.setItem("selectedSearchEngine", radioButton.value);
    });
  });

  /**
   * Swap attributes and contents between the default engine and a selected element.
   * @param {HTMLElement} defaultEngine - The current default engine element.
   * @param {HTMLElement} selectedElement - The clicked or selected element.
   */
  function swapDropdown(selectedElement) {
    // Swap innerHTML
    const tempHTML = defaultEngine.innerHTML;
    defaultEngine.innerHTML = selectedElement.innerHTML;
    selectedElement.innerHTML = tempHTML;

    // Swap attributes
    ["data-engine", "data-engine-name", "id"].forEach((attr) => {
      const tempAttr = defaultEngine.getAttribute(attr);
      defaultEngine.setAttribute(attr, selectedElement.getAttribute(attr));
      selectedElement.setAttribute(attr, tempAttr);
    });
  }

  // Function to perform search
  function performSearch() {
    var selectedOption = document.querySelector(
      'input[name="search-engine"]:checked'
    ).value;
    var searchTerm = searchInput.value;
    var searchEngines = {
      engine1: "https://www.google.com/search?q=",
      engine2: "https://duckduckgo.com/?q=",
      engine3: "https://bing.com/?q=",
      engine4: "https://search.brave.com/search?q=",
      engine5: "https://www.youtube.com/results?search_query=",
    };

    if (searchTerm !== "") {
      var searchUrl =
        searchEngines[selectedOption] + encodeURIComponent(searchTerm);
      window.location.href = searchUrl;
    }
  }

  // Event listeners
  enterBTN.addEventListener("click", performSearch);

  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  // Set selected search engine from local storage
  const storedSearchEngine = localStorage.getItem("selectedSearchEngine");

  if (storedSearchEngine) {
    // Find Serial Number - SN with the help of charAt.
    const storedSearchEngineSN = storedSearchEngine.charAt(
      storedSearchEngine.length - 1
    );
    const defaultDropdownSN = document
      .querySelector("*[data-default]")
      .getAttribute("data-engine");

    // check if the default selected search engine is same as the stored one.
    if (storedSearchEngineSN !== defaultDropdownSN) {
      // The following line will find out the appropriate dropdown for the selected search engine.
      const storedSearchEngineDropdown = document.querySelector(
        `*[data-engine="${storedSearchEngineSN}"]`
      );

      swapDropdown(storedSearchEngineDropdown);
      sortDropdown();
    }

    const selectedRadioButton = document.querySelector(
      `input[name="search-engine"][value="${storedSearchEngine}"]`
    );
    if (selectedRadioButton) {
      selectedRadioButton.checked = true;
    }
  }

  const dropdownItems = document.querySelectorAll(
    ".dropdown-item:not(*[data-default])"
  );
  let selectedIndex = -1;

  // Function to update the selected item
  function updateSelection() {
    // let hasSelected = [];
    dropdownItems.forEach((item, index) => {
      item.addEventListener("mouseenter", () => {
        item.classList.add("selected");
      });
      item.addEventListener("mouseleave", () => {
        item.classList.remove("selected");
      });

      if (index === selectedIndex) {
        item.focus();
        item.classList.add("selected");
      } else {
        item.focus();
        item.classList.remove("selected");
      }
    });
  }

  // Event listener for keydown events to navigate up/down
  document
    .querySelector(".dropdown")
    .addEventListener("keydown", function (event) {
      if (dropdown.style.display == "block") {
        if (event.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % dropdownItems.length; // Move down, loop around
        } else if (event.key === "ArrowUp") {
          selectedIndex =
            (selectedIndex - 1 + dropdownItems.length) % dropdownItems.length; // Move up, loop around
        } else if (event.key === "Enter") {
          const element = document.querySelector(".dropdown-content .selected");
          const engine = element.getAttribute("data-engine");
          const radioButton = document.querySelector(
            `input[type="radio"][value="engine${engine}"]`
          );

          radioButton.checked = true;

          // Swap The dropdown. and sort them
          swapDropdown(element);
          sortDropdown();
        }
        updateSelection();
      }
    });

  // Initial setup for highlighting
  updateSelection();

  // Event listener for search engine radio buttons
  searchEngineRadio.forEach((radio) => {
    radio.addEventListener("change", () => {
      const selectedOption = document.querySelector(
        'input[name="search-engine"]:checked'
      ).value;
      localStorage.setItem("selectedSearchEngine", selectedOption);
    });
  });
  // -----Theme stay changed even if user reload the page---
  //  🔴🟠🟡🟢🔵🟣⚫️⚪️🟤
  const storedTheme = localStorage.getItem(themeStorageKey);
  if (storedTheme) {
    applySelectedTheme(storedTheme);
    const selectedRadioButton = document.querySelector(
      `.colorPlate[value="${storedTheme}"]`
    );
    if (selectedRadioButton) {
      selectedRadioButton.checked = true;
    }
  }
});

//  -----------Voice Search------------
// Function to detect Chrome and Edge on desktop
function isSupportedBrowser() {
  const userAgent = navigator.userAgent;
  const isChrome =
    /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent);
  const isDesktop = !/Android|iPhone|iPad|iPod/.test(userAgent); // Check if the device is not mobile
  const isBrave = navigator.brave && navigator.brave.isBrave; // Detect Brave

  return (isChrome || isEdge) && isDesktop && !isBrave;
}

// Set the initial state of the mic icon and checkbox based on saved state or supported browser
const micIcon = document.getElementById("micIcon");
const micIconCheckbox = document.getElementById("micIconCheckbox");

// Check if there's a saved state in localStorage
const savedState = localStorage.getItem("micIconVisible");
let isMicIconVisible;

// If saved state exists, use it; otherwise, fallback to initial state based on browser support
if (savedState !== null) {
  isMicIconVisible = savedState === "true";
} else {
  // Default state: Hide mic icon if browser is not supported
  isMicIconVisible = isSupportedBrowser();
  // Save the initial state based on the user agent
  localStorage.setItem("micIconVisible", isMicIconVisible);
}

// Set the checkbox state based on the saved or default state
micIconCheckbox.checked = !isMicIconVisible; // Checked hides the mic icon
micIcon.style.visibility = isMicIconVisible ? "visible" : "hidden";

// Function to toggle mic icon visibility
function toggleMicIconVisibility(isVisible) {
  micIcon.style.visibility = isVisible ? "visible" : "hidden";
  localStorage.setItem("micIconVisible", isVisible); // Save to localStorage
}

// Toggle mic icon display based on checkbox state
micIconCheckbox.addEventListener("change", () => {
  const isChecked = micIconCheckbox.checked;
  toggleMicIconVisibility(!isChecked); // Checked hides the mic icon

  // Only initialize Web Speech API if the mic icon is visible
  if (!isChecked) {
    initializeSpeechRecognition();
  }
});

// Function to initialize Web Speech API if supported
function initializeSpeechRecognition() {
  const searchInput = document.getElementById("searchQ");
  const resultBox = document.getElementById("resultBox");
  const currentLanguage = getLanguageStatus("selectedLanguage") || "en";

  // Check if the browser supports SpeechRecognition API
  const isSpeechRecognitionAvailable =
    "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  if (isSpeechRecognitionAvailable) {
    // Initialize SpeechRecognition (cross-browser compatibility)
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.continuous = false; // Stop recognition after first result
    recognition.interimResults = true; // Enable interim results for live transcription
    recognition.lang = currentLanguage; // Set the language dynamically based on selected language

    let isRecognizing = false; // Flag to check if recognition is active

    // When speech recognition starts
    recognition.onstart = () => {
      isRecognizing = true; // Set the flag to indicate recognition is active
      const selectedRadio = document.querySelector(".colorPlate:checked");
      if (selectedRadio.value !== "dark") {
        micIcon.style.color = "var(--darkerColor-blue)";
        // micIcon.style.transform = 'scale(1.05)';
      }
      searchInput.placeholder = `${
        translations[currentLanguage]?.listenPlaceholder ||
        translations["en"].listenPlaceholder
      }`;
      micIcon.classList.add("micActive");
    };

    // When speech recognition results are available (including interim results)
    recognition.onresult = (event) => {
      let transcript = "";
      // Loop through results to build the transcript text
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript; // Append each piece of the transcript
      }
      // Display the interim result in the search input
      searchInput.value = transcript;
      // If the result is final, hide the result box
      if (event.results[event.results.length - 1].isFinal) {
        resultBox.style.display = "none"; // Hide result box after final input
      }
    };

    // When an error occurs during speech recognition
    recognition.onerror = (event) => {
      console.error("Speech recognition error: ", event.error);
      isRecognizing = false; // Reset flag on error
    };

    // When speech recognition ends (either by user or automatically)
    recognition.onend = () => {
      isRecognizing = false; // Reset the flag to indicate recognition has stopped
      micIcon.style.color = "var(--darkColor-blue)"; // Reset mic color
      // micIcon.style.transform = 'scale(1)'; // Reset scaling
      micIcon.classList.remove("micActive");
      searchInput.placeholder = `${
        translations[currentLanguage]?.searchPlaceholder ||
        translations["en"].searchPlaceholder
      }`;
    };

    // Start speech recognition when mic icon is clicked
    micIcon.addEventListener("click", () => {
      if (isRecognizing) {
        recognition.stop(); // Stop recognition if it's already listening
      } else {
        recognition.start(); // Start recognition if it's not already listening
      }
    });
  } else {
    console.warn("Speech Recognition API not supported in this browser.");
  }
}

// Initialize SpeechRecognition only if the mic icon is visible
if (!micIconCheckbox.checked) {
  initializeSpeechRecognition();
}
//  -----------End of Voice Search------------

// Function to apply the selected theme
const radioButtons = document.querySelectorAll(".colorPlate");
const themeStorageKey = "selectedTheme";
const storedTheme = localStorage.getItem(themeStorageKey);
// const radioButtons = document.querySelectorAll('.colorPlate');
// const themeStorageKey = 'selectedTheme'; // For predefined themes
const customThemeStorageKey = "customThemeColor"; // For color picker
// const storedTheme = localStorage.getItem(themeStorageKey);
const storedCustomColor = localStorage.getItem(customThemeStorageKey);

let darkThemeStyleTag; // Variable to store the dynamically added style tag

const resetDarkTheme = () => {
  // Remove the dark theme class
  document.documentElement.classList.remove("dark-theme");

  // Remove the injected dark theme style tag
  if (darkThemeStyleTag) {
    darkThemeStyleTag.remove();
    darkThemeStyleTag = null;
  }

  // Reset inline styles that were applied specifically for dark mode
  const resetElements = [
    "searchQ",
    "searchIconDark",
    "darkFeelsLikeIcon",
    "menuButton",
    "menuCloseButton",
    "closeBtnX",
  ];

  resetElements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.removeAttribute("style");
    }
  });

  // Reset fill color for elements with the class "accentColor"
  const accentElements = document.querySelectorAll(".accentColor");
  accentElements.forEach((element) => {
    element.style.fill = ""; // Reset fill color
  });
  // Reset the CSS variables to default (for non-dark themes)
  document.documentElement.style.setProperty("--bg-color-blue", "#ffffff");
  document.documentElement.style.setProperty(
    "--accentLightTint-blue",
    "#E2EEFF"
  );
  document.documentElement.style.setProperty("--darkerColor-blue", "#3569b2");
  document.documentElement.style.setProperty("--darkColor-blue", "#4382EC");
  document.documentElement.style.setProperty("--textColorDark-blue", "#1b3041");
  document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
};

const applySelectedTheme = (colorValue) => {
  // If the selected theme is not dark, reset dark theme styles
  if (colorValue !== "dark") {
    resetDarkTheme();

    // Apply styles for other themes (not dark)
    if (colorValue === "blue") {
      document.documentElement.style.setProperty("--bg-color-blue", "#BBD6FD");
      document.documentElement.style.setProperty(
        "--accentLightTint-blue",
        "#E2EEFF"
      );
      document.documentElement.style.setProperty(
        "--darkerColor-blue",
        "#3569b2"
      );
      document.documentElement.style.setProperty("--darkColor-blue", "#4382EC");
      document.documentElement.style.setProperty(
        "--textColorDark-blue",
        "#1b3041"
      );
      document.documentElement.style.setProperty(
        "--whitishColor-blue",
        "#ffffff"
      );
    } else {
      document.documentElement.style.setProperty(
        "--bg-color-blue",
        `var(--bg-color-${colorValue})`
      );
      document.documentElement.style.setProperty(
        "--accentLightTint-blue",
        `var(--accentLightTint-${colorValue})`
      );
      document.documentElement.style.setProperty(
        "--darkerColor-blue",
        `var(--darkerColor-${colorValue})`
      );
      document.documentElement.style.setProperty(
        "--darkColor-blue",
        `var(--darkColor-${colorValue})`
      );
      document.documentElement.style.setProperty(
        "--textColorDark-blue",
        `var(--textColorDark-${colorValue})`
      );
      document.documentElement.style.setProperty(
        "--whitishColor-blue",
        `var(--whitishColor-${colorValue})`
      );
    }
  }

  // If the selected theme is dark
  else if (colorValue === "dark") {
    // Apply dark theme styles using CSS variables
    document.documentElement.style.setProperty(
      "--bg-color-blue",
      `var(--bg-color-${colorValue})`
    );
    document.documentElement.style.setProperty(
      "--accentLightTint-blue",
      `var(--accentLightTint-${colorValue})`
    );
    document.documentElement.style.setProperty(
      "--darkerColor-blue",
      `var(--darkerColor-${colorValue})`
    );
    document.documentElement.style.setProperty(
      "--darkColor-blue",
      `var(--darkColor-${colorValue})`
    );
    document.documentElement.style.setProperty(
      "--textColorDark-blue",
      `var(--textColorDark-${colorValue})`
    );

    // Add dark theme styles for specific elements
    darkThemeStyleTag = document.createElement("style");
    darkThemeStyleTag.textContent = `
            .dark-theme .search-engine input[type="radio"]:checked {
                background-color: #2a2a2a;
                border: 2px solid #919191;
            }

            .dark-theme .search-engine input[type="radio"] {
                background-color: #9d9d9d   ;
                border: 0px solid #000000;
            }

            .dark-theme .colorsContainer {
                background-color: #212121;
            }

            .dark-theme #themeButton {
                background-color: #212121;
            }

            .dark-theme #themeIconSvg, .dark-theme #languageSelectorIconSvg {
                fill: #cdcdcd !important;
            }

            .dark-theme .languageIcon,
            .dark-theme .languageSelector {
                background-color: #212121;
                scrollbar-color: var(--darkerColor-blue) transparent;
            }

            .dark-theme .languageSelector::-webkit-scrollbar-thumb,
            .dark-theme .languageSelector::-webkit-scrollbar-thumb:hover {
                background-color: var(--darkerColor-blue);
            }

            .dark-theme .bottom a {
                color: #a1a1a1;
            }

            .dark-theme .ttcont input {
                background-color: #212121 !important;
            }

            .dark-theme input:checked + .toggle {
                background-color: #aaaaaa;
            }

            .dark-theme .tilesCont .tiles {
                color: #e8e8e8;
            }

            #searchQ{
            color: #fff;
            }

            .searchbar.active {
                outline: 2px solid #696969;
            }

            #searchIconDark {
                fill: #bbb !important;
            }

            .tilesContainer .tiles {
                background-color: #212121;
            }

            #darkFeelsLikeIcon{
                fill: #fff !important;
            }

            .humidityBar .thinLine{
                background-color: #aaaaaa;
            }

            .search-engine .darkIconForDarkTheme, .aiDarkIcons{
                fill: #bbbbbb !important;
            }

            .divider{
                background-color: #cdcdcd;
            }
    
            .shorcutDarkColor{
                fill: #3c3c3c !important;
            }

            #darkLightTint{
                fill: #bfbfbf;
            }

            .strokecolor {
	            stroke: #3c3c3c;
            }

            .shortcutsContainer .shortcuts .shortcutLogoContainer {
                background: radial-gradient(circle, #bfbfbf 44%, #000 64%);
            }

            .digiclock {
                fill: #909090;
            }
	    
	    #userText, #date, .shortcuts .shortcut-name {
	             text-shadow: 1px 1px 15px rgba(15, 15, 15, 0.9),
	 		          -1px -1px 15px rgba(15, 15, 15, 0.9),
    			          1px -1px 15px rgba(15, 15, 15, 0.9),
       			          -1px 1px 15px rgba(15, 15, 15, 0.9) !important;
            }

     	    .uploadButton,
            .randomButton{
                background-color: var(--darkColor-blue);
                color: var(--whitishColor-dark);
            }

            .clearButton:hover{
                background-color: var(--whitishColor-dark);
            }

            .clearButton:active{
                color: #0e0e0e;
            }

            .backupRestoreBtn {
                background-color: #212121;
            }
            
            .uploadButton:active,
            .randomButton:active,
            .backupRestoreBtn:active,
            .resetbtn:active {
                background-color: #0e0e0e;
            }

     	    .micIcon{
                background-color: var(--whitishColor-dark);
            }

            #minute, #minute::after, #second::after {
                background-color: #909090;
            }

            .dot-icon {
                fill: #bfbfbf;
            }

            .menuicon{
                color: #c2c2c2;
            }

            #menuButton::before{
                background-color: #bfbfbf;
            }
            
            #menuButton::after{
                border: 4px solid #858585;
            }

            #menuCloseButton, #menuCloseButton:hover {
                background-color: var(--darkColor-dark);
            }

            #menuCloseButton .icon{
                background-color: #cdcdcd;
            }

            #closeBtnX{
                border: 2px solid #bdbdbd;
                border-radius: 100px;
            }

            body{
                background-color: #000000;
            }
            
            #HangNoAlive{
                fill: #c2c2c2 !important;
            }

            .tempUnit{
                color: #dadada;
            }

            .dark-theme #githab,
            .dark-theme #sujhaw {
                fill: #b1b1b1;
            }

            .resultItem.active {
                background-color: var(--darkColor-dark);;
            }
        `;
    document.head.appendChild(darkThemeStyleTag);

    // Apply dark theme class
    document.documentElement.classList.add("dark-theme");

    // Change fill color for elements with the class "accentColor"
    const accentElements = document.querySelectorAll(".accentColor");
    accentElements.forEach((element) => {
      element.style.fill = "#212121";
    });
  }

  // Change the extension icon based on the selected theme
  const iconPaths = [
    "blue",
    "yellow",
    "red",
    "green",
    "cyan",
    "orange",
    "purple",
    "pink",
    "brown",
    "silver",
    "grey",
    "dark",
  ].reduce((acc, color) => {
    acc[color] = `./favicon/${color}.png`;
    return acc;
  }, {});

  // Function to update the extension icon based on browser
  const updateExtensionIcon = (colorValue) => {
    if (typeof chrome !== "undefined" && chrome.action) {
      // Chromium-based: Chrome, Edge, Brave
      chrome.action.setIcon({ path: iconPaths[colorValue] });
    } else if (typeof browser !== "undefined" && browser.browserAction) {
      // Firefox
      browser.browserAction.setIcon({ path: iconPaths[colorValue] });
    } else if (typeof safari !== "undefined") {
      // Safari
      safari.extension.setToolbarIcon({ path: iconPaths[colorValue] });
    }
  };
  updateExtensionIcon(colorValue);

  // Change the favicon dynamically
  const faviconLink = document.querySelector("link[rel='icon']");
  if (faviconLink && iconPaths[colorValue]) {
    faviconLink.href = iconPaths[colorValue];
  }
};

// ----Color Picker || ColorPicker----
function darkenHexColor(hex, factor = 0.6) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.floor(r * (1 - factor));
  g = Math.floor(g * (1 - factor));
  b = Math.floor(b * (1 - factor));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function lightenHexColor(hex, factor = 0.85) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.floor(r + (255 - r) * factor);
  g = Math.floor(g + (255 - g) * factor);
  b = Math.floor(b + (255 - b) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function lightestColor(hex, factor = 0.95) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.floor(r + (255 - r) * factor);
  g = Math.floor(g + (255 - g) * factor);
  b = Math.floor(b + (255 - b) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function isNearWhite(hex, threshold = 240) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return r > threshold && g > threshold && b > threshold;
}

// ---- Color Picker || ColorPicker----

const applyCustomTheme = (color) => {
  adjustedColor = color;
  if (isNearWhite(color)) {
    adjustedColor = "#696969"; // Light gray if near white
  }
  const darkerColorHex = darkenHexColor(adjustedColor);
  const lighterColorHex = lightenHexColor(adjustedColor, 0.85);
  const lightTin = lightestColor(adjustedColor, 0.95);

  // resetDarkTheme();
  document.documentElement.style.setProperty(
    "--bg-color-blue",
    lighterColorHex
  );
  document.documentElement.style.setProperty(
    "--accentLightTint-blue",
    lightTin
  );
  document.documentElement.style.setProperty(
    "--darkerColor-blue",
    darkerColorHex
  );
  document.documentElement.style.setProperty("--darkColor-blue", adjustedColor);
  document.documentElement.style.setProperty(
    "--textColorDark-blue",
    darkerColorHex
  );
  document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
  document.getElementById("rangColor").style.borderColor = color;
  document.getElementById("dfChecked").checked = false;
};

// Load theme on page reload// Load theme on page reload
window.addEventListener("load", function () {
  // console.log('Page loaded, stored theme:', storedTheme);
  // console.log('Page loaded, stored custom color:', storedCustomColor);
  if (storedTheme) {
    applySelectedTheme(storedTheme);
  } else if (storedCustomColor) {
    applyCustomTheme(storedCustomColor);
  }
});

// Handle radio button changes
const handleThemeChange = function () {
  if (this.checked) {
    const colorValue = this.value;
    // console.log('Radio button changed, selected theme:', colorValue);
    localStorage.setItem(themeStorageKey, colorValue);
    localStorage.removeItem(customThemeStorageKey); // Clear custom theme
    applySelectedTheme(colorValue);
  }
};

// Remove any previously attached listeners and add only one
radioButtons.forEach((radioButton) => {
  radioButton.removeEventListener("change", handleThemeChange); // Remove if already attached
  radioButton.addEventListener("change", handleThemeChange); // Add fresh listener
});

// Handle color picker changes
const handleColorPickerChange = function (event) {
  const selectedColor = event.target.value;
  // console.log('Color picker changed, selected color:', selectedColor);
  resetDarkTheme(); // Clear dark theme if active
  localStorage.setItem(customThemeStorageKey, selectedColor); // Save custom color
  localStorage.removeItem(themeStorageKey); // Clear predefined theme
  applyCustomTheme(selectedColor);

  // Uncheck all radio buttons
  radioButtons.forEach((radio) => {
    radio.checked = false;
  });
};

// Add listeners for color picker
colorPicker.removeEventListener("input", handleColorPickerChange); // Ensure no duplicate listeners
colorPicker.addEventListener("input", handleColorPickerChange);
// colorPicker.addEventListener('change', function () {
//     // console.log('Final color applied:', colorPicker.value);
//     location.reload();
// });

// end of Function to apply the selected theme

// ------------ Wallpaper ---------------------------------
// Constants for database and storage
const dbName = "ImageDB";
const storeName = "backgroundImages";
const timestampKey = "lastUpdateTime"; // Key to store last update time
const imageTypeKey = "imageType"; // Key to store the type of image ('random' or 'upload')

// Open IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      db.createObjectStore(storeName);
    };
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function (event) {
      reject("Database error: " + event.target.errorCode);
    };
  });
}

// Save image data, timestamp, and type to IndexedDB
async function saveImageToIndexedDB(imageUrl, isRandom) {
  const db = await openDatabase();
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.put(imageUrl, "backgroundImage");
    store.put(new Date().toISOString(), timestampKey);
    store.put(isRandom ? "random" : "upload", imageTypeKey);

    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) =>
      reject("Transaction error: " + event.target.errorCode);
  });
}

// Load image, timestamp, and type from IndexedDB
async function loadImageAndDetails() {
  const db = await openDatabase();
  return await Promise.all([
    new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get("backgroundImage");

      request.onsuccess = (event) => resolve(request.result);
      request.onerror = (event_1) =>
        reject("Request error: " + event_1.target.errorCode);
    }),
    new Promise((resolve_1, reject_1) => {
      const transaction_1 = db.transaction(storeName, "readonly");
      const store_1 = transaction_1.objectStore(storeName);
      const request_1 = store_1.get(timestampKey);

      request_1.onsuccess = (event_2) => resolve_1(request_1.result);
      request_1.onerror = (event_3) =>
        reject_1("Request error: " + event_3.target.errorCode);
    }),
    new Promise((resolve_2, reject_2) => {
      const transaction_2 = db.transaction(storeName, "readonly");
      const store_2 = transaction_2.objectStore(storeName);
      const request_2 = store_2.get(imageTypeKey);

      request_2.onsuccess = (event_4) => resolve_2(request_2.result);
      request_2.onerror = (event_5) =>
        reject_2("Request error: " + event_5.target.errorCode);
    }),
  ]);
}

// Load only the background image
async function loadImageFromIndexedDB() {
  const db = await openDatabase();
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get("backgroundImage");

    request.onsuccess = (event) => resolve(request.result);
    request.onerror = (event_1) =>
      reject("Request error: " + event_1.target.errorCode);
  });
}

// Clear image data from IndexedDB
async function clearImageFromIndexedDB() {
  const db = await openDatabase();
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete("backgroundImage");

    request.onsuccess = () => resolve();
    request.onerror = (event) =>
      reject("Delete error: " + event.target.errorCode);
  });
}

// Handle file input and save image as upload
document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const image = new Image();
        image.onload = function () {
          const totalPixels = image.width * image.height;
          if (totalPixels > 2073600) {
            alert(
              `Warning: The uploaded image dimensions (${image.width}x${image.height}) exceed (1920x1080) pixels. ` +
                `This may impact performance or image may fail to load properly.`
            );
          }
          document.body.style.setProperty(
            "--bg-image",
            `url(${e.target.result})`
          );
          // saveImageToIndexedDB(e.target.result, false)
          //   .then(() => updateTextShadow(true))
          //   .catch((error) => console.error(error));
        };
        image.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

// Fetch and apply random image as background
const RANDOM_IMAGE_URL = "https://picsum.photos/1920/1080";
async function applyRandomImage(showConfirmation = true) {
  if (
    showConfirmation &&
    !confirm("Would you like to set a new image as your wallpaper for the day?")
  ) {
    return;
  }
  try {
    const response = await fetch(RANDOM_IMAGE_URL);
    const imageUrl = response.url;
    document.body.style.setProperty("--bg-image", `url(${imageUrl})`);
    await saveImageToIndexedDB(imageUrl, true);
  } catch (error) {
    console.error("Error fetching random image:", error);
  }
}

// Check and update image on page load
function checkAndUpdateImage() {
  loadImageAndDetails()
    .then(([savedImage, savedTimestamp, imageType]) => {
      const now = new Date();
      const lastUpdate = new Date(savedTimestamp);

      // Case 1: No image found, disable text shadow and return.

      // Case 2: Invalid or missing timestamp, disable text shadow and return.

      // Case 3: Uploaded image should always be applied.
      if (imageType === "upload") {
        document.body.style.setProperty("--bg-image", `url(${savedImage})`);
        document.body.style.backgroundImage = `var(--bg-image)`;
        return;
      }

      // Case 4: Random image should be refreshed if it's a new day.
      if (lastUpdate.toDateString() !== now.toDateString()) {
        applyRandomImage(false); // Fetch new random image and apply it.
      } else {
        // Case 5: Same day random image, reapply saved image.
        document.body.style.setProperty("--bg-image", `url(${savedImage})`);
      }
    })
    .catch((error) => {
      console.error("Error loading image details:", error);
    });
}

// Event listeners for buttons
document
  .getElementById("uploadTrigger")
  .addEventListener("click", () =>
    document.getElementById("imageUpload").click()
  );
document.getElementById("clearImage").addEventListener("click", function () {
  loadImageFromIndexedDB()
    .then((savedImage) => {
      if (savedImage) {
        if (confirm("Are you sure you want to clear the background image?")) {
          clearImageFromIndexedDB()
            .then(() => {
              document.body.style.removeProperty("--bg-image");
            })
            .catch((error) => console.error(error));
        }
      } else {
        alert("No background image is currently set.");
      }
    })
    .catch((error) => console.error(error));
});
document
  .getElementById("randomImageTrigger")
  .addEventListener("click", applyRandomImage);

// Start image check on page load
checkAndUpdateImage();

// ------- End of BG Image -------------------------------------------

// ------- Zooming in out function-----------
const slider = document.getElementById("zoom-slider");
const body = document.body;

function applyZoom(value, min, max) {
  const percentage = (value / max) * 100;
  const sliderValue = percentage - 8;

  slider.style.borderRadius = "100px";
  slider.style.background = `linear-gradient(to right, var(--darkColor-blue) ${sliderValue}%, #00000000 ${sliderValue}%)`;

  const zoomLevel = ((value - min) / (max - min)) * (1 - 0.6) + 0.6;
  body.style.zoom = zoomLevel;

  localStorage.setItem("zoomLevel", value);
}

slider.addEventListener("input", function () {
  const value = this.value;
  const max = this.max;
  const min = this.min;
  document.getElementById("zoomMessage").style.display = "block";

  applyZoom(value, min, max);
});

slider.addEventListener("change", function () {
  document.getElementById("zoomMessage").style.display = "none";
});

window.addEventListener("load", function () {
  const savedZoomLevel = localStorage.getItem("zoomLevel");

  if (savedZoomLevel) {
    slider.value = savedZoomLevel;
    const max = slider.max;
    const min = slider.min;

    applyZoom(savedZoomLevel, min, max);
  }
});
// ------- End of Zooming in out function-----------

// -------- Backup-Restore Settings ----------------------------------
document.getElementById("backupBtn").addEventListener("click", backupData);
document
  .getElementById("restoreBtn")
  .addEventListener("click", () =>
    document.getElementById("fileInput").click()
  );
document
  .getElementById("fileInput")
  .addEventListener("change", validateAndRestoreData);

// Backup data from localStorage and IndexedDB
async function backupData() {
  if (!confirm("Are you sure you want to backup your settings?")) return;

  try {
    const backup = { localStorage: {}, indexedDB: {} };

    // Backup localStorage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        backup.localStorage[key] = localStorage.getItem(key);
      }
    }

    // Backup IndexedDB (ImageDB)
    backup.indexedDB = await backupIndexedDB();

    // Generate filename with current date (format: DDMMYYYY)
    const date = new Date();
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${date.getFullYear()}`;
    const fileName = `NewTab_Backup_${formattedDate}.json`;

    // Create and download the backup file
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Backup completed successfully!");
  } catch (error) {
    alert("Backup failed: " + error.message);
  }
}

// Validate and restore data from a backup file
async function validateAndRestoreData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      await restoreData(backup);

      alert("Restore completed successfully!");
      location.reload();
    } catch (error) {
      alert("Restore failed: " + error.message);
    }
  };
  reader.readAsText(file);
}

// Backup IndexedDB: Extract data from ImageDB -> backgroundImages
function backupIndexedDB() {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("ImageDB");

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("backgroundImages", "readonly");
      const store = transaction.objectStore("backgroundImages");
      const data = {};

      store.getAllKeys().onsuccess = (keysEvent) => {
        const keys = keysEvent.target.result;

        if (!keys.length) {
          resolve({ backgroundImages: {} });
          return;
        }

        let pending = keys.length;
        keys.forEach((key) => {
          store.get(key).onsuccess = (getEvent) => {
            data[key] = getEvent.target.result;
            if (--pending === 0) resolve({ backgroundImages: data });
          };
        });
      };

      transaction.onerror = () => reject(transaction.error);
    };

    openRequest.onerror = () => reject(openRequest.error);
  });
}

// Restore IndexedDB: Clear and repopulate ImageDB -> backgroundImages
function restoreIndexedDB(data) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("ImageDB");

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("backgroundImages", "readwrite");
      const store = transaction.objectStore("backgroundImages");

      store.clear();
      Object.entries(data).forEach(([key, value]) => {
        store.put(value, key);
      });

      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    };

    openRequest.onerror = () => reject(openRequest.error);
  });
}

// Restore data for both localStorage and IndexedDB
async function restoreData(backup) {
  // Clear localStorage before restoring
  localStorage.clear();

  // Restore localStorage from backup
  if (backup.localStorage) {
    Object.keys(backup.localStorage).forEach((key) => {
      localStorage.setItem(key, backup.localStorage[key]);
    });
  }

  // Restore IndexedDB from backup
  if (backup.indexedDB && backup.indexedDB.backgroundImages) {
    await restoreIndexedDB(backup.indexedDB.backgroundImages);
  }
}
// -------------------End of Settings ------------------------------

// when User click on "AI-Tools"
const element = document.getElementById("toolsCont");
const shortcuts = document.getElementById("shortcutsContainer");

function toggleShortcuts(event) {
  const shortcutsCheckbox = document.getElementById("shortcutsCheckbox");

  if (shortcutsCheckbox.checked) {
    if (element.style.display === "flex") {
      shortcuts.style.display = "flex";
      element.style.opacity = "0";
      element.style.gap = "0";
      element.style.transform = "translateX(-100%)";

      setTimeout(() => {
        element.style.display = "none";
        shortcuts.style.display = "flex";
      }, 500);
    } else {
      shortcuts.style.display = "none";
      element.style.display = "flex";
      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateX(0)";
      }, 1);
      setTimeout(() => {
        element.style.gap = "12px";
      }, 300);
    }
  } else {
    if (element.style.display === "flex") {
      shortcuts.style.display = "none";
      element.style.opacity = "0";
      element.style.gap = "0";
      element.style.transform = "translateX(-100%)";
      setTimeout(() => {
        element.style.display = "none";
      }, 500);
    } else {
      shortcuts.style.display = "none";
      element.style.display = "flex";
      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateX(0)";
      }, 1);
      setTimeout(() => {
        element.style.gap = "12px";
      }, 300);
    }
  }
  // Prevent outside click handler from triggering
  if (event) event.stopPropagation();
}

// Collapse when clicking outside toolsCont
document.addEventListener("click", (event) => {
  if (!element.contains(event.target) && element.style.display === "flex") {
    toggleShortcuts();
  }
});

document.getElementById("0NIHK").onclick = toggleShortcuts;

// ------------Search Suggestions---------------

// Show the result box
// function showResultBox() {
//   resultBox.classList.add("show");
//   resultBox.style.display = "block";
// }

// Hide the result box
// function hideResultBox() {
//   resultBox.classList.remove("show");
//   resultBox.style.display = "none";
// }

// showResultBox();
// hideResultBox();

document.getElementById("searchQ").addEventListener("input", async function () {
  const searchsuggestionscheckbox = document.getElementById(
    "searchsuggestionscheckbox"
  );
  if (searchsuggestionscheckbox.checked) {
    var selectedOption = document.querySelector(
      'input[name="search-engine"]:checked'
    ).value;
    var searchEngines = {
      engine1: "https://www.google.com/search?q=",
      engine2: "https://duckduckgo.com/?q=",
      engine3: "https://bing.com/?q=",
      engine4: "https://search.brave.com/search?q=",
      engine5: "https://www.youtube.com/results?search_query=",
    };
    const query = this.value;
    const resultBox = document.getElementById("resultBox");

    if (query.length > 0) {
      try {
        // Fetch autocomplete suggestions
        const suggestions = await getAutocompleteSuggestions(query);

        if (suggestions == "") {
          // hideResultBox();
        } else {
          // Clear the result box
          resultBox.innerHTML = "";

          // Add suggestions to the result box
          suggestions.forEach((suggestion, index) => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("resultItem");
            resultItem.textContent = suggestion;
            resultItem.setAttribute("data-index", index);
            resultItem.onclick = () => {
              var resultlink =
                searchEngines[selectedOption] + encodeURIComponent(suggestion);
              window.location.href = resultlink;
            };
            // resultBox.appendChild(resultItem);
          });
          // showResultBox();
        }
      } catch (error) {
        // Handle the error (if needed)
      }
    } else {
      // hideResultBox();
    }
  }
});

// let isMouseOverResultBox = false;
// // Track mouse entry and exit within the resultBox
// resultBox.addEventListener("mouseenter", () => {
//   isMouseOverResultBox = true;
//   // Remove keyboard highlight
//   const activeItem = resultBox.querySelector(".active");
//   if (activeItem) {
//     activeItem.classList.remove("active");
//   }
// });

// resultBox.addEventListener("mouseleave", () => {
//   isMouseOverResultBox = false;
// });

// document.getElementById("searchQ").addEventListener("keydown", function (e) {
//   if (isMouseOverResultBox) {
//     return; // Ignore keyboard events if the mouse is in the resultBox
//   }
//   const activeItem = resultBox.querySelector(".active");
//   let currentIndex = activeItem
//     ? parseInt(activeItem.getAttribute("data-index"))
//     : -1;

//   if (resultBox.children.length > 0) {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       if (activeItem) {
//         activeItem.classList.remove("active");
//       }
//       currentIndex = (currentIndex + 1) % resultBox.children.length;
//       resultBox.children[currentIndex].classList.add("active");

//       // Ensure the active item is visible within the result box
//       const activeElement = resultBox.children[currentIndex];
//       activeElement.scrollIntoView({ block: "nearest" });
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       if (activeItem) {
//         activeItem.classList.remove("active");
//       }
//       currentIndex =
//         (currentIndex - 1 + resultBox.children.length) %
//         resultBox.children.length;
//       resultBox.children[currentIndex].classList.add("active");

//       // Ensure the active item is visible within the result box
//       const activeElement = resultBox.children[currentIndex];
//       activeElement.scrollIntoView({ block: "nearest" });
//     } else if (e.key === "Enter" && activeItem) {
//       e.preventDefault();
//       activeItem.click();
//     }
//   }
// });

function getClientParam() {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for different browsers and return the corresponding client parameter
  if (userAgent.includes("firefox")) {
    return "firefox";
  } else if (userAgent.includes("chrome") || userAgent.includes("crios")) {
    return "chrome";
  } else if (userAgent.includes("safari")) {
    return "safari";
  } else if (userAgent.includes("edge") || userAgent.includes("edg")) {
    return "firefox";
  } else if (userAgent.includes("opera") || userAgent.includes("opr")) {
    return "opera";
  } else {
    return "firefox"; // Default to Firefox client if the browser is not recognized
  }
}

async function getAutocompleteSuggestions(query) {
  const clientParam = getClientParam(); // Get the browser client parameter dynamically
  var selectedOption = document.querySelector(
    'input[name="search-engine"]:checked'
  ).value;
  var searchEnginesapi = {
    engine1: `http://www.google.com/complete/search?client=${clientParam}&q=${encodeURIComponent(
      query
    )}`,
    engine2: `https://duckduckgo.com/ac/?q=${encodeURIComponent(
      query
    )}&type=list`,
    engine3: `http://www.google.com/complete/search?client=${clientParam}&q=${encodeURIComponent(
      query
    )}`,
    engine4: `https://search.brave.com/api/suggest?q=${encodeURIComponent(
      query
    )}&rich=true&source=web`,
    engine5: `http://www.google.com/complete/search?client=${clientParam}&ds=yt&q=${encodeURIComponent(
      query
    )}`,
  };
  const useproxyCheckbox = document.getElementById("useproxyCheckbox");
  let apiUrl = searchEnginesapi[selectedOption];
  if (useproxyCheckbox.checked) {
    apiUrl = `${proxyurl}/proxy?url=${encodeURIComponent(apiUrl)}`;
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (selectedOption === "engine4") {
      const suggestions = data[1].map((item) => {
        if (item.is_entity) {
          return `${item.q} - ${item.name} (${
            item.category ? item.category : "No category"
          })`;
        } else {
          return item.q;
        }
      });
      return suggestions;
    } else {
      return data[1];
    }
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return [];
  }
}

// Hide results when clicking outside
document.addEventListener("click", function (event) {
  const searchbar = document.getElementById("searchbar");
  // const resultBox = document.getElementById("resultBox");

  if (!searchbar.contains(event.target)) {
    // hideResultBox();
  }
});
// ------------End of Search Suggestions---------------

// ------------Showing & Hiding Menu-bar ---------------
const menuButton = document.getElementById("menuButton");
const menuBar = document.getElementById("menuBar");
const menuCont = document.getElementById("menuCont");
const optCont = document.getElementById("optCont");
const overviewPage = document.getElementById("overviewPage");
const shortcutEditPage = document.getElementById("shortcutEditPage");

function pageReset() {
  optCont.scrollTop = 0;
  overviewPage.style.transform = "translateX(0)";
  overviewPage.style.opacity = "1";
  overviewPage.style.display = "block";
  shortcutEditPage.style.transform = "translateX(120%)";
  shortcutEditPage.style.opacity = "0";
  shortcutEditPage.style.display = "none";
}

const closeMenuBar = () => {
  requestAnimationFrame(() => {
    optCont.style.opacity = "0";
    optCont.style.transform = "translateX(100%)";
  });
  setTimeout(() => {
    requestAnimationFrame(() => {
      menuBar.style.opacity = "0";
      menuCont.style.transform = "translateX(100%)";
    });
  }, 14);
  setTimeout(() => {
    menuBar.style.display = "none";
  }, 555);
};

const openMenuBar = () => {
  setTimeout(() => {
    menuBar.style.display = "block";
    pageReset();
  });
  setTimeout(() => {
    requestAnimationFrame(() => {
      menuBar.style.opacity = "1";
      menuCont.style.transform = "translateX(0px)";
    });
  }, 7);
  setTimeout(() => {
    requestAnimationFrame(() => {
      optCont.style.opacity = "1";
      optCont.style.transform = "translateX(0px)";
    });
  }, 11);
};

menuButton.addEventListener("click", () => {
  if (menuBar.style.display === "none" || menuBar.style.display === "") {
    openMenuBar();
  } else {
    closeMenuBar();
  }
});

//   ----------Hiding Menu Bar--------
menuBar.addEventListener("click", (event) => {
  if (event.target === menuBar) {
    closeMenuBar();
  }
});

// Hiding Menu Bar when user click on close button --------
document.getElementById("menuCloseButton").onclick = () => {
  closeMenuBar();
};

// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  /* ------ Constants ------ */

  // maximum number of shortcuts allowed
  const MAX_SHORTCUTS_ALLOWED = 50;

  // minimum number of  shorcutDarkColor allowed
  const MIN_SHORTCUTS_ALLOWED = 1;

  // The new shortcut placeholder info
  const PLACEHOLDER_SHORTCUT_NAME = "New shortcut";
  const PLACEHOLDER_SHORTCUT_URL =
    "https://github.com/XengShi/materialYouNewTab";

  // The placeholder for an empty shortcut
  const SHORTCUT_NAME_PLACEHOLDER = "Shortcut Name";
  const SHORTCUT_URL_PLACEHOLDER = "Shortcut URL";

  const SHORTCUT_PRESET_NAMES = [
    "Youtube",
    "Gmail",
    "Telegram",
    "WhatsApp",
    "Instagram",
    "Twitter",
  ];
  const SHORTCUT_PRESET_URLS_AND_LOGOS = new Map([
    [
      "youtube.com",
      `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M11.6698 9.82604L9.33021 8.73437C9.12604 8.63958 8.95833 8.74583 8.95833 8.97187V11.0281C8.95833 11.2542 9.12604 11.3604 9.33021 11.2656L11.6688 10.174C11.874 10.0781 11.874 9.92188 11.6698 9.82604ZM10 0C4.47708 0 0 4.47708 0 10C0 15.5229 4.47708 20 10 20C15.5229 20 20 15.5229 20 10C20 4.47708 15.5229 0 10 0ZM10 14.0625C4.88125 14.0625 4.79167 13.601 4.79167 10C4.79167 6.39896 4.88125 5.9375 10 5.9375C15.1187 5.9375 15.2083 6.39896 15.2083 10C15.2083 13.601 15.1187 14.0625 10 14.0625Z"
                    fill="#617859"/>
            </svg>`,
    ],
    [
      "mail.google.com",
      `
            <svg fill="none" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
	            <circle cx="12" cy="12" r="12" class="accentColor shorcutDarkColor"/>
                <g transform="translate(12, 12) scale(0.7) translate(-10, -10)">
	            <path class="bgLightTint" id="darkLightTint" fill-rule="evenodd"
                    d="m7.172 11.334l2.83 1.935l2.728-1.882l6.115 6.033q-.242.079-.512.08H1.667c-.22 0-.43-.043-.623-.12zM20 6.376v9.457c0 .247-.054.481-.15.692l-5.994-5.914zM0 6.429l6.042 4.132l-5.936 5.858A1.7 1.7 0 0 1 0 15.833zM18.333 2.5c.92 0 1.667.746 1.667 1.667v.586L9.998 11.648L0 4.81v-.643C0 3.247.746 2.5 1.667 2.5z" />
                </g>
            </svg>
            `,
    ],
    [
      "web.telegram.org",
      `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.64 6.8C14.49 8.38 13.84 12.22 13.51 13.99C13.37 14.74 13.09 14.99 12.83 15.02C12.25 15.07 11.81 14.64 11.25 14.27C10.37 13.69 9.87 13.33 9.02 12.77C8.03 12.12 8.67 11.76 9.24 11.18C9.39 11.03 11.95 8.7 12 8.49C12.0069 8.45819 12.006 8.42517 11.9973 8.3938C11.9886 8.36244 11.9724 8.33367 11.95 8.31C11.89 8.26 11.81 8.28 11.74 8.29C11.65 8.31 10.25 9.24 7.52 11.08C7.12 11.35 6.76 11.49 6.44 11.48C6.08 11.47 5.4 11.28 4.89 11.11C4.26 10.91 3.77 10.8 3.81 10.45C3.83 10.27 4.08 10.09 4.55 9.9C7.47 8.63 9.41 7.79 10.38 7.39C13.16 6.23 13.73 6.03 14.11 6.03C14.19 6.03 14.38 6.05 14.5 6.15C14.6 6.23 14.63 6.34 14.64 6.42C14.63 6.48 14.65 6.66 14.64 6.8Z"
                    fill="#617859"/>
            </svg>
            `,
    ],
    [
      "web.whatsapp.com",
      `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C8.23279 20.0029 6.49667 19.5352 4.97001 18.645L0.00401407 20L1.35601 15.032C0.465107 13.5049 -0.00293838 11.768 1.38802e-05 10C1.38802e-05 4.477 4.47701 0 10 0ZM6.59201 5.3L6.39201 5.308C6.26254 5.31589 6.13599 5.3499 6.02001 5.408C5.91153 5.46943 5.81251 5.54622 5.72601 5.636C5.60601 5.749 5.53801 5.847 5.46501 5.942C5.09514 6.4229 4.89599 7.01331 4.89901 7.62C4.90101 8.11 5.02901 8.587 5.22901 9.033C5.63801 9.935 6.31101 10.89 7.19901 11.775C7.41301 11.988 7.62301 12.202 7.84901 12.401C8.9524 13.3725 10.2673 14.073 11.689 14.447L12.257 14.534C12.442 14.544 12.627 14.53 12.813 14.521C13.1043 14.506 13.3886 14.4271 13.646 14.29C13.777 14.2225 13.9048 14.1491 14.029 14.07C14.029 14.07 14.072 14.042 14.154 13.98C14.289 13.88 14.372 13.809 14.484 13.692C14.567 13.606 14.639 13.505 14.694 13.39C14.772 13.227 14.85 12.916 14.882 12.657C14.906 12.459 14.899 12.351 14.896 12.284C14.892 12.177 14.803 12.066 14.706 12.019L14.124 11.758C14.124 11.758 13.254 11.379 12.722 11.137C12.6663 11.1127 12.6067 11.0988 12.546 11.096C12.4776 11.089 12.4085 11.0967 12.3433 11.1186C12.2781 11.1405 12.2183 11.1761 12.168 11.223C12.163 11.221 12.096 11.278 11.373 12.154C11.3315 12.2098 11.2744 12.2519 11.2088 12.2751C11.1433 12.2982 11.0723 12.3013 11.005 12.284C10.9399 12.2665 10.876 12.2445 10.814 12.218C10.69 12.166 10.647 12.146 10.562 12.11C9.98808 11.8595 9.4567 11.5211 8.98701 11.107C8.86101 10.997 8.74401 10.877 8.62401 10.761C8.2306 10.3842 7.88774 9.95801 7.60401 9.493L7.54501 9.398C7.50264 9.33416 7.46837 9.2653 7.44301 9.193C7.40501 9.046 7.50401 8.928 7.50401 8.928C7.50401 8.928 7.74701 8.662 7.86001 8.518C7.97001 8.378 8.06301 8.242 8.12301 8.145C8.24101 7.955 8.27801 7.76 8.21601 7.609C7.93601 6.925 7.64601 6.244 7.34801 5.568C7.28901 5.434 7.11401 5.338 6.95501 5.319C6.90101 5.313 6.84701 5.307 6.79301 5.303C6.65872 5.29633 6.52415 5.29766 6.39001 5.307L6.59101 5.299L6.59201 5.3Z"
                    fill="#617859"/>
            </svg>
            `,
    ],
    [
      "instagram.com",
      `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8.44" class="strokecolor" stroke-width="3" fill="none" />
                <g transform="translate(10, 10) scale(0.85) translate(-10, -10)">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C4.44444 0 0 4.44444 0 10C0 15.5556 4.44444 20 10 20C15.5556 20 20 15.5556 20 10C20 4.44444 15.5556 0 10 0ZM10 7.77778C11.2222 7.77778 12.2222 8.77778 12.2222 10C12.2222 11.2222 11.2222 12.2222 10 12.2222C8.77778 12.2222 7.77778 11.2222 7.77778 10C7.77778 8.77778 8.77778 7.77778 10 7.77778ZM13.1111 5.55556C13.1111 4.77778 13.7778 4.22222 14.4444 4.22222C15.1111 4.22222 15.7778 4.88889 15.7778 5.55556C15.7778 6.22222 15.2222 6.88889 14.4444 6.88889C13.6667 6.88889 13.1111 6.33333 13.1111 5.55556ZM10 17.7778C5.66667 17.7778 2.22222 14.3333 2.22222 10H5.55556C5.55556 12.4444 7.55556 14.4444 10 14.4444C12.4444 14.4444 14.4444 12.4444 14.4444 10H17.7778C17.7778 14.3333 14.3333 17.7778 10 17.7778Z" fill="#617859"/>
                </g>
            </svg>
            `,
    ],
    [
      "x.com",
      `
            <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path class="accentColor shorcutDarkColor"
                    d="M10 0C15.5286 0 20 4.47143 20 10C20 15.5286 15.5286 20 10 20C4.47143 20 0 15.5286 0 10C0 4.47143 4.47143 0 10 0ZM8.17143 15.2714C12.6 15.2714 15.0286 11.6 15.0286 8.41429V8.1C15.5 7.75714 15.9143 7.32857 16.2286 6.84286C15.8 7.02857 15.3286 7.15714 14.8429 7.22857C15.3429 6.92857 15.7286 6.45714 15.9 5.9C15.4286 6.17143 14.9143 6.37143 14.3714 6.48571C13.9286 6.01429 13.3 5.72857 12.6143 5.72857C11.2857 5.72857 10.2 6.81429 10.2 8.14286C10.2 8.32857 10.2143 8.51429 10.2714 8.68571C8.27143 8.58571 6.48571 7.62857 5.3 6.17143C5.1 6.52857 4.97143 6.94286 4.97143 7.38571C4.97143 8.21429 5.4 8.95714 6.04286 9.38571C5.64286 9.38571 5.27143 9.27143 4.95714 9.08571V9.11429C4.95714 10.2857 5.78571 11.2571 6.88571 11.4857C6.68571 11.5429 6.47143 11.5714 6.25714 11.5714C6.1 11.5714 5.95714 11.5571 5.8 11.5286C6.1 12.4857 7 13.1857 8.04286 13.2C7.21429 13.8429 6.17143 14.2286 5.04286 14.2286C4.84286 14.2286 4.65714 14.2286 4.47143 14.2C5.52857 14.8857 6.8 15.2857 8.15714 15.2857"
                    fill="#617859"/>
            </svg>
            `,
    ],
  ]);

  const SHORTCUT_DELETE_BUTTON_HTML = `
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                    <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-12q-15.3 0-25.65-10.29Q192-716.58 192-731.79t10.35-25.71Q212.7-768 228-768h156v-12q0-15.3 10.35-25.65Q404.7-816 420-816h120q15.3 0 25.65 10.35Q576-795.3 576-780v12h156q15.3 0 25.65 10.29Q768-747.42 768-732.21t-10.35 25.71Q747.3-696 732-696h-12v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM419.79-288q15.21 0 25.71-10.35T456-324v-264q0-15.3-10.29-25.65Q435.42-624 420.21-624t-25.71 10.35Q384-603.3 384-588v264q0 15.3 10.29 25.65Q404.58-288 419.79-288Zm120 0q15.21 0 25.71-10.35T576-324v-264q0-15.3-10.29-25.65Q555.42-624 540.21-624t-25.71 10.35Q504-603.3 504-588v264q0 15.3 10.29 25.65Q524.58-288 539.79-288ZM312-696v480-480Z"/>
                </svg>
            </button>
            `;

  // const FAVICON_CANDIDATES = (hostname) => [
  //     `https://${hostname}/apple-touch-icon-180x180.png`,
  //     `https://${hostname}/apple-touch-icon-120x120.png`,
  //     `https://${hostname}/apple-touch-icon.png`
  // ];

  const GOOGLE_FAVICON_API_FALLBACK = (hostname) =>
    `https://s2.googleusercontent.com/s2/favicons?domain_url=https://${hostname}&sz=256`;

  // const FAVICON_REQUEST_TIMEOUT = 5000;

  const ADAPTIVE_ICON_CSS = `.shortcutsContainer .shortcuts .shortcutLogoContainer img {
                height: calc(100% / sqrt(2)) !important;
                width: calc(100% / sqrt(2)) !important;
                }`;

  /* ------ Element selectors ------ */

  const shortcuts = document.getElementById("shortcuts-section");
  const aiToolsCont = document.getElementById("aiToolsCont");
  const googleAppsCont = document.getElementById("googleAppsCont");
  const shortcutsCheckbox = document.getElementById("shortcutsCheckbox");
  const proxybypassField = document.getElementById("proxybypassField");
  const proxyinputField = document.getElementById("proxyField");
  const useproxyCheckbox = document.getElementById("useproxyCheckbox");
  const searchsuggestionscheckbox = document.getElementById(
    "searchsuggestionscheckbox"
  );
  const shortcutEditField = document.getElementById("shortcutEditField");
  const adaptiveIconField = document.getElementById("adaptiveIconField");
  const adaptiveIconToggle = document.getElementById("adaptiveIconToggle");
  const aiToolsCheckbox = document.getElementById("aiToolsCheckbox");
  const googleAppsCheckbox = document.getElementById("googleAppsCheckbox");
  const timeformatField = document.getElementById("timeformatField");
  const hourcheckbox = document.getElementById("12hourcheckbox");
  const digitalCheckbox = document.getElementById("digitalCheckbox");
  const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
  const shortcutEditButton = document.getElementById("shortcutEditButton");
  const backButton = document.getElementById("backButton");
  const shortcutSettingsContainer = document.getElementById("shortcutList"); // shortcuts in settings
  const shortcutsContainer = document.getElementById("shortcutsContainer"); // shortcuts in page
  const newShortcutButton = document.getElementById("newShortcutButton");
  const resetShortcutsButton = document.getElementById("resetButton");
  // const iconStyle = document.getElementById("iconStyle");

  // const flexMonitor = document.getElementById("flexMonitor"); // monitors whether shortcuts have flex-wrap flexed
  // const defaultHeight = document.getElementById("defaultMonitor").clientHeight; // used to compare to previous element

  /* ------ Helper functions for saving and loading states ------ */

  // Function to save checkbox state to localStorage
  function saveCheckboxState(key, checkbox) {
    localStorage.setItem(key, checkbox.checked ? "checked" : "unchecked");
  }

  // Function to load and apply checkbox state from localStorage
  function loadCheckboxState(key, checkbox) {
    const savedState = localStorage.getItem(key);
    checkbox.checked = savedState === "checked";
  }

  // Function to save display status to localStorage
  function saveDisplayStatus(key, displayStatus) {
    localStorage.setItem(key, displayStatus);
  }

  // Function to load and apply display status from localStorage
  function loadDisplayStatus(key, element) {
    const savedStatus = localStorage.getItem(key);
    if (savedStatus === "flex") {
      element.style.display = "flex";
    } else {
      element.style.display = "none";
    }
  }

  // Function to save activeness status to localStorage
  function saveActiveStatus(key, activeStatus) {
    localStorage.setItem(key, activeStatus);
  }

  // Function to load and apply activeness status from localStorage
  function loadActiveStatus(key, element) {
    const savedStatus = localStorage.getItem(key);
    if (savedStatus === "active") {
      element.classList.remove("inactive");
    } else {
      element.classList.add("inactive");
    }
  }

  // Function to save style data
  function saveIconStyle(key, CSS) {
    localStorage.setItem(key, CSS);
  }

  // Function to load style data

  /* ------ Loading shortcuts ------ */

  /**
   * Function to load and apply all shortcut names and URLs from localStorage
   *
   * Iterates through the stored shortcuts and replaces the settings entry for the preset shortcuts with the
   * stored ones.
   * It then calls apply for all the shortcuts, to synchronize the changes settings entries with the actual shortcut
   * container.
   */

  function loadShortcuts() {
    let amount = localStorage.getItem("shortcutAmount");

    const presetAmount = SHORTCUT_PRESET_NAMES.length;

    if (amount === null) {
      // first time opening
      amount = presetAmount;
      localStorage.setItem("shortcutAmount", amount.toString());
    } else {
      amount = parseInt(amount);
    }

    // If we are not allowed to add more shortcuts.
    if (amount >= MAX_SHORTCUTS_ALLOWED)
      newShortcutButton.className = "inactive";

    // If we are not allowed to delete anymore, all delete buttons should be deactivated.
    const deleteInactive = amount <= MIN_SHORTCUTS_ALLOWED;

    for (let i = 0; i < amount; i++) {
      const name =
        localStorage.getItem("shortcutName" + i.toString()) ||
        SHORTCUT_PRESET_NAMES[i];
      const url =
        localStorage.getItem("shortcutURL" + i.toString()) ||
        [...SHORTCUT_PRESET_URLS_AND_LOGOS.keys()][i];

      const newSettingsEntry = createShortcutSettingsEntry(
        name,
        url,
        deleteInactive,
        i
      );

      // Save the index for the future
      newSettingsEntry._index = i;

      shortcutSettingsContainer.appendChild(newSettingsEntry);

      applyShortcut(newSettingsEntry);
    }
  }

  /* ------ Creating shortcut elements ------ */

  /**
   * Function that creates a div to be used in the shortcut edit panel of the settings.
   *
   * @param name The name of the shortcut
   * @param url The URL of the shortcut
   * @param deleteInactive Whether the delete button should be active
   * @param i The index of the shortcut
   * @returns {HTMLDivElement} The div to be used in the settings
   */
  function createShortcutSettingsEntry(name, url, deleteInactive, i) {
    const deleteButtonContainer = document.createElement("div");
    deleteButtonContainer.className = "delete";
    deleteButtonContainer.innerHTML = SHORTCUT_DELETE_BUTTON_HTML;

    const deleteButton = deleteButtonContainer.children[0];
    if (deleteInactive) deleteButton.className = "inactive";
    deleteButton.addEventListener("click", (e) =>
      deleteShortcut(e.target.closest(".shortcutSettingsEntry"))
    );

    const shortcutName = document.createElement("input");
    shortcutName.className = "shortcutName";
    shortcutName.placeholder = SHORTCUT_NAME_PLACEHOLDER;
    shortcutName.value = name;
    const shortcutUrl = document.createElement("input");
    shortcutUrl.className = "URL";
    shortcutUrl.placeholder = SHORTCUT_URL_PLACEHOLDER;
    shortcutUrl.value = url;

    attachEventListenersToInputs([shortcutName, shortcutUrl]);

    const textDiv = document.createElement("div");
    textDiv.append(shortcutName, shortcutUrl);

    const entryDiv = document.createElement("div");
    entryDiv.className = "shortcutSettingsEntry";
    entryDiv.append(textDiv, deleteButtonContainer);

    entryDiv._index = i;

    return entryDiv;
  }

  /**
   * This function creates a shortcut to be used for the shortcut container on the main page.
   *
   * @param shortcutName The name of the shortcut
   * @param shortcutUrl The url of the shortcut
   * @param i The index of the shortcut
   */
  function createShortcutElement(shortcutName, shortcutUrl, i) {
    const shortcut = document.createElement("a");
    shortcut.href = shortcutUrl;

    const name = document.createElement("span");
    name.className = "shortcut-name";
    name.textContent = shortcutName;

    let icon = getCustomLogo(shortcutUrl);

    if (!icon) {
      // if we had to pick the fallback, attempt to get a better image in the background.
      icon = getFallbackFavicon(shortcutUrl);
      // getBestIconUrl(shortcutUrl).then((iconUrl) => icon.src = iconUrl).catch();
    }

    const iconContainer = document.createElement("div");
    iconContainer.className = "shortcutLogoContainer";
    iconContainer.appendChild(icon);

    shortcut.append(iconContainer, name);

    const shortcutContainer = document.createElement("div");
    shortcutContainer.className = "shortcuts";
    shortcutContainer.appendChild(shortcut);
    shortcutContainer._index = i;

    return shortcutContainer;
  }

  /* ------ Attaching event listeners to shortcut settings ------ */

  /**
   * Function to attach all required event listeners to the shortcut edit inputs in the settings.
   *
   * It adds three event listeners to each of the two inputs:
   * 1. Blur, to save changes to the shortcut automatically.
   * 2. Focus, to select all text in the input field when it is selected.
   * 3. Keydown, which moves the focus to the URL field when the user presses 'Enter' in the name field,
   * and removes all focus to save the changes when the user presses 'Enter' in the URL field.
   *
   * @param inputs a list of the two inputs these listeners should be applied to.
   */
  function attachEventListenersToInputs(inputs) {
    inputs.forEach((input) => {
      // save and apply when done
      input.addEventListener("blur", (e) => {
        const shortcut = e.target.closest(".shortcutSettingsEntry");
        saveShortcut(shortcut);
        applyShortcut(shortcut);
      });
      // select all content on click:
      input.addEventListener("focus", (e) => e.target.select());
    });
    inputs[0].addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        inputs[1].focus(); // Move focus to the URL
      }
    });
    inputs[1].addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.target.blur(); // Blur the input field
      }
    });
  }

  /* ------ Saving and applying changes to shortcuts ------ */

  /**
   * This function stores a shortcut by saving its values in the settings panel to the local storage.
   *
   * @param shortcut The shortcut to be saved
   */
  function saveShortcut(shortcut) {
    const name = shortcut.querySelector("input.shortcutName").value;
    const url = shortcut.querySelector("input.URL").value;

    localStorage.setItem("shortcutName" + shortcut._index, name);
    localStorage.setItem("shortcutURL" + shortcut._index, url);
  }

  /**
   * This function applies a change that has been made in the settings panel to the real shortcut in the container
   *
   * @param shortcut The shortcut to be applied.
   */
  function applyShortcut(shortcut) {
    const shortcutName = shortcut.querySelector("input.shortcutName").value;
    let url = shortcut.querySelector("input.URL").value.trim();

    // URL validation function
    function isValidUrl(url) {
      const pattern =
        /^(https:\/\/|http:\/\/)?(([a-zA-Z\d-]+\.)+[a-zA-Z]{2,}|(\d{1,3}\.){3}\d{1,3})(\/[^\s]*)?$/i;
      return pattern.test(url);
    }

    // Validate URL before normalizing
    if (!isValidUrl(url)) {
      // alert("Invalid URL. Please enter a valid URL with http or https protocol.");
      url =
        "https://xengshi.github.io/materialYouNewTab/shortcuts_icons/PageNotFound.html";
    }

    // Normalize URL if valid
    const normalizedUrl =
      url.startsWith("https://") || url.startsWith("http://")
        ? url
        : "https://" + url;

    const i = shortcut._index;

    const shortcutElement = createShortcutElement(
      shortcutName,
      normalizedUrl,
      i
    );

    if (i < shortcutsContainer.children.length) {
      shortcutsContainer.replaceChild(
        shortcutElement,
        shortcutsContainer.children[i]
      );
    } else {
      shortcutsContainer.appendChild(shortcutElement);
    }
  }

  /* ------ Adding, deleting, and resetting shortcuts ------ */

  /**
   * This function creates a new shortcut in the settings panel, then saves and applies it.
   */
  function newShortcut() {
    const currentAmount = parseInt(localStorage.getItem("shortcutAmount"));
    const newAmount = currentAmount + 1;

    if (newAmount > MAX_SHORTCUTS_ALLOWED) return;

    // If the delete buttons were deactivated, reactivate them.
    if (currentAmount === MIN_SHORTCUTS_ALLOWED) {
      shortcutSettingsContainer
        .querySelectorAll(".delete button.inactive")
        .forEach((b) => b.classList.remove("inactive"));
    }

    // If we have reached the max, deactivate the add button.
    if (newAmount === MAX_SHORTCUTS_ALLOWED)
      newShortcutButton.className = "inactive";

    // Save the new amount
    localStorage.setItem("shortcutAmount", newAmount.toString());

    // create placeholder div
    const shortcut = createShortcutSettingsEntry(
      PLACEHOLDER_SHORTCUT_NAME,
      PLACEHOLDER_SHORTCUT_URL,
      false,
      currentAmount
    );

    shortcutSettingsContainer.appendChild(shortcut);

    saveShortcut(shortcut);
    applyShortcut(shortcut);
  }

  /**
   * This function deletes a shortcut and shifts all indices of the following shortcuts back by one.
   *
   * @param shortcut The shortcut to be deleted.
   */
  function deleteShortcut(shortcut) {
    const newAmount = (localStorage.getItem("shortcutAmount") || 0) - 1;
    if (newAmount < MIN_SHORTCUTS_ALLOWED) return;

    const i = shortcut._index;

    // If we had previously deactivated it, reactivate the add button
    newShortcutButton.classList.remove("inactive");

    // Remove the shortcut from the DOM
    shortcut.remove();
    shortcutsContainer.removeChild(shortcutsContainer.children[i]);

    // Update localStorage by shifting all the shortcuts after the deleted one and update the index
    for (let j = i; j < newAmount; j++) {
      const shortcutEntry = shortcutSettingsContainer.children[j];
      shortcutEntry._index--;
      saveShortcut(shortcutEntry);
    }

    // Remove the last shortcut from storage, as it has now moved up
    localStorage.removeItem("shortcutName" + newAmount);
    localStorage.removeItem("shortcutURL" + newAmount);

    // Disable delete buttons if minimum number reached
    if (newAmount === MIN_SHORTCUTS_ALLOWED) {
      shortcutSettingsContainer
        .querySelectorAll(".delete button")
        .forEach((button) => (button.className = "inactive"));
    }

    // Update the shortcutAmount in localStorage
    localStorage.setItem("shortcutAmount", newAmount.toString());
  }

  /**
   * This function resets shortcuts to their original state, namely the presets.
   *
   * It does this by deleting all shortcut-related data, then reloading the shortcuts.
   */
  function resetShortcuts() {
    for (let i = 0; i < (localStorage.getItem("shortcutAmount") || 0); i++) {
      localStorage.removeItem("shortcutName" + i);
      localStorage.removeItem("shortcutURL" + i);
    }
    shortcutSettingsContainer.innerHTML = "";
    shortcutsContainer.innerHTML = "";
    localStorage.removeItem("shortcutAmount");
    loadShortcuts();
  }

  /* ------ Shortcut favicon handling ------ */

  /**
   * This function verifies whether a URL for a favicon is valid.
   *
   * It does this by creating an image and setting the URL as the src, as fetch would be blocked by CORS.
   *
   * @param urls the array of potential URLs of favicons
   * @returns {Promise<unknown>}
   */
  // function filterFavicon(urls) {
  //     return new Promise((resolve, reject) => {
  //         let found = false;

  //         for (const url of urls) {
  //             const img = new Image();
  //             img.referrerPolicy = "no-referrer"; // Don't send referrer data
  //             img.src = url;

  //             img.onload = () => {
  //                 if (!found) { // Make sure to resolve only once
  //                     found = true;
  //                     resolve(url);
  //                 }
  //             };
  //         }

  //         // If none of the URLs worked after all have been tried
  //         setTimeout(() => {
  //             if (!found) {
  //                 reject();
  //             }
  //         }, FAVICON_REQUEST_TIMEOUT);
  //     });
  // }

  /**
   * This function returns the url to the favicon of a website, given a URL.
   *
   * @param urlString The url of the website for which the favicon is requested
   * @return {Promise<String>} Potentially the favicon url
   */
  // async function getBestIconUrl(urlString) {
  //     const hostname = new URL(urlString).hostname;
  //     try {
  //         // Wait for filterFavicon to resolve with a valid URL
  //         return await filterFavicon(FAVICON_CANDIDATES(hostname));
  //     } catch (error) {
  //         return Promise.reject();
  //     }
  // }

  /**
   * This function uses Google's API to immediately get a favicon,
   * to be used while loading the real one and as a fallback.
   *
   * @param urlString the url of the website for which the favicon is requested
   * @returns {HTMLImageElement} The img element representing the favicon
   */
  function getFallbackFavicon(urlString) {
    const logo = document.createElement("img");
    const hostname = new URL(urlString).hostname;

    if (hostname === "github.com") {
      logo.src = "./shortcuts_icons/github-shortcut.svg";
    } else if (
      urlString ===
      "https://xengshi.github.io/materialYouNewTab/shortcuts_icons/PageNotFound.html"
    ) {
      // Special case for invalid URLs
      logo.src = "./shortcuts_icons/invalid-url.svg";
    } else {
      logo.src = GOOGLE_FAVICON_API_FALLBACK(hostname);

      // Handle image loading error on offline scenario
      logo.onerror = () => {
        logo.src = "./shortcuts_icons/offline.svg";
      };
    }

    return logo;
  }

  /**
   * This function returns the custom logo for the url associated with a preset shortcut.
   *
   * @param url The url of the shortcut.
   * @returns {Element|null} The logo if it was found, otherwise null.
   */
  function getCustomLogo(url) {
    const html = SHORTCUT_PRESET_URLS_AND_LOGOS.get(
      url.replace("https://", "")
    );
    return html
      ? document.createRange().createContextualFragment(html).firstElementChild
      : null;
  }

  /* ------ Proxy ------ */

  /**
   * This function shows the proxy disclaimer.
   */
  function showProxyDisclaimer() {
    const message =
      "All proxy features are off by default.\n\nIf you enable search suggestions and CORS bypass proxy, it is strongly recommended to host your own proxy for enhanced privacy.\n\nBy default, the proxy will be set to https://mynt-proxy.rhythmcorehq.com, meaning all your data will go through this service, which may pose privacy concerns.";

    return confirm(message);
  }

  /* ------ Event Listeners ------ */
  const searchIconContainer = document.querySelectorAll(".searchIcon");

  const showEngineContainer = () => {
    searchIconContainer[1].style.display = "none";
    searchIconContainer[0].style.display = "block";
    document.getElementById("search-with-container").style.visibility =
      "visible";
  };

  const hideEngineContainer = () => {
    searchIconContainer[0].style.display = "none";
    searchIconContainer[1].style.display = "block";
    document.getElementById("search-with-container").style.visibility =
      "hidden";
  };

  const initShortCutSwitch = (element) => {
    if (element.checked) {
      hideEngineContainer();
      localStorage.setItem("showShortcutSwitch", true);
    } else {
      showEngineContainer();
      localStorage.setItem("showShortcutSwitch", false);
    }
  };

  // ---------- Code for Hiding Search Icon And Search With Options for Search switch shortcut --------
  const element = document.getElementById("shortcut_switchcheckbox");
  element.addEventListener("change", (e) => {
    initShortCutSwitch(e.target);
  });

  // Intialize shortcut switch
  if (localStorage.getItem("showShortcutSwitch")) {
    const isShortCutSwitchEnabled =
      localStorage.getItem("showShortcutSwitch").toString() == "true";
    document.getElementById("shortcut_switchcheckbox").checked =
      isShortCutSwitchEnabled;

    if (isShortCutSwitchEnabled) {
      hideEngineContainer();
    } else if (!isShortCutSwitchEnabled) {
      showEngineContainer();
    }
  } else {
    localStorage.setItem("showShortcutSwitch", false);
  }

  initShortCutSwitch(element);

  // Add change event listeners for the checkboxes
  shortcutsCheckbox.addEventListener("change", function () {
    saveCheckboxState("shortcutsCheckboxState", shortcutsCheckbox);
    if (shortcutsCheckbox.checked) {
      shortcuts.style.display = "flex";
      saveDisplayStatus("shortcutsDisplayStatus", "flex");
      shortcutEditField.classList.remove("inactive");
      saveActiveStatus("shortcutEditField", "active");
      adaptiveIconField.classList.remove("inactive");
      saveActiveStatus("adaptiveIconField", "active");
    } else {
      shortcuts.style.display = "none";
      saveDisplayStatus("shortcutsDisplayStatus", "none");
      shortcutEditField.classList.add("inactive");
      saveActiveStatus("shortcutEditField", "inactive");
      adaptiveIconField.classList.add("inactive");
      saveActiveStatus("adaptiveIconField", "inactive");
    }
  });

  searchsuggestionscheckbox.addEventListener("change", function () {
    saveCheckboxState(
      "searchsuggestionscheckboxState",
      searchsuggestionscheckbox
    );
    if (searchsuggestionscheckbox.checked) {
      proxybypassField.classList.remove("inactive");
      saveActiveStatus("proxybypassField", "active");
    } else {
      proxybypassField.classList.add("inactive");
      saveActiveStatus("proxybypassField", "inactive");
      useproxyCheckbox.checked = false;
      saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
      proxyinputField.classList.add("inactive");
      saveActiveStatus("proxyinputField", "inactive");
    }
  });

  if (localStorage.getItem("greetingEnabled") === null) {
    localStorage.setItem("greetingEnabled", "true");
  }
  const greetingCheckbox = document.getElementById("greetingcheckbox");
  const greetingField = document.getElementById("greetingField");
  greetingCheckbox.checked = localStorage.getItem("greetingEnabled") === "true";
  greetingCheckbox.disabled = localStorage.getItem("clocktype") !== "digital";

  digitalCheckbox.addEventListener("change", function () {
    saveCheckboxState("digitalCheckboxState", digitalCheckbox);
    if (digitalCheckbox.checked) {
      timeformatField.classList.remove("inactive");
      greetingField.classList.remove("inactive");
      greetingCheckbox.disabled = false; // Enable greeting toggle
      localStorage.setItem("clocktype", "digital");
      clocktype = localStorage.getItem("clocktype");
      displayClock();
      stopClock();
      saveActiveStatus("timeformatField", "active");
      saveActiveStatus("greetingField", "active");
    } else {
      timeformatField.classList.add("inactive");
      greetingField.classList.add("inactive");
      greetingCheckbox.disabled = true; // Disable greeting toggle
      localStorage.setItem("clocktype", "analog");
      clocktype = localStorage.getItem("clocktype");
      stopClock();
      startClock();
      displayClock();
      saveActiveStatus("timeformatField", "inactive");
      saveActiveStatus("greetingField", "inactive");
    }
  });

  hourcheckbox.addEventListener("change", function () {
    saveCheckboxState("hourcheckboxState", hourcheckbox);
    if (hourcheckbox.checked) {
      localStorage.setItem("hourformat", "true");
    } else {
      localStorage.setItem("hourformat", "false");
    }
  });

  greetingCheckbox.addEventListener("change", () => {
    localStorage.setItem("greetingEnabled", greetingCheckbox.checked);
    // updatedigiClock();
  });

  useproxyCheckbox.addEventListener("change", function () {
    if (useproxyCheckbox.checked) {
      // Show the disclaimer and check the user's choice
      const userConfirmed = showProxyDisclaimer();
      if (userConfirmed) {
        // Only enable the proxy if the user confirmed
        saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
        proxyinputField.classList.remove("inactive");
        saveActiveStatus("proxyinputField", "active");
      } else {
        // Revert the checkbox state if the user did not confirm
        useproxyCheckbox.checked = false;
      }
    } else {
      // If the checkbox is unchecked, disable the proxy
      saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
      proxyinputField.classList.add("inactive");
      saveActiveStatus("proxyinputField", "inactive");
    }
  });

  // adaptiveIconToggle.addEventListener("change", function () {
  //   saveCheckboxState("adaptiveIconToggle", adaptiveIconToggle);
  //   if (adaptiveIconToggle.checked) {
  //     // saveIconStyle("iconStyle", ADAPTIVE_ICON_CSS);
  //     // iconStyle.innerHTML = ADAPTIVE_ICON_CSS;
  //   } else {
  //     // saveIconStyle("iconStyle", "");
  //     // iconStyle.innerHTML = "";
  //   }
  // });

  aiToolsCheckbox.addEventListener("change", function () {
    saveCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
    if (aiToolsCheckbox.checked) {
      aiToolsCont.style.display = "flex";
      saveDisplayStatus("aiToolsDisplayStatus", "flex");
    } else {
      aiToolsCont.style.display = "none";
      saveDisplayStatus("aiToolsDisplayStatus", "none");
      toggleShortcuts();
    }
  });

  googleAppsCheckbox.addEventListener("change", function () {
    saveCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
    if (googleAppsCheckbox.checked) {
      googleAppsCont.style.display = "flex";
      saveDisplayStatus("googleAppsDisplayStatus", "flex");
    } else {
      googleAppsCont.style.display = "none";
      saveDisplayStatus("googleAppsDisplayStatus", "none");
    }
  });

  fahrenheitCheckbox.addEventListener("change", function () {
    saveCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);
  });

  newShortcutButton.addEventListener("click", () => newShortcut());

  resetShortcutsButton.addEventListener("click", () => resetShortcuts());

  /* ------ Page Transitions & Animations ------ */

  // When clicked, open new page by sliding it in from the right.
  shortcutEditButton.onclick = () => {
    setTimeout(() => {
      shortcutEditPage.style.display = "block";
    });
    requestAnimationFrame(() => {
      overviewPage.style.transform = "translateX(-120%)";
      overviewPage.style.opacity = "0";
    });
    setTimeout(() => {
      requestAnimationFrame(() => {
        shortcutEditPage.style.transform = "translateX(0)";
        shortcutEditPage.style.opacity = "1";
      });
    }, 50);
    setTimeout(() => {
      overviewPage.style.display = "none";
    }, 650);
  };

  // Close page by sliding it away to the right.
  backButton.onclick = () => {
    setTimeout(() => {
      overviewPage.style.display = "block";
    });
    requestAnimationFrame(() => {
      shortcutEditPage.style.transform = "translateX(120%)";
      shortcutEditPage.style.opacity = "0";
    });
    setTimeout(() => {
      requestAnimationFrame(() => {
        overviewPage.style.transform = "translateX(0)";
        overviewPage.style.opacity = "1";
      });
    }, 50);
    setTimeout(() => {
      shortcutEditPage.style.display = "none";
    }, 650);
  };

  // Rotate reset button when clicked
  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", () => {
    resetButton.querySelector("svg").classList.toggle("rotateResetButton");
  });

  /* ------ Loading ------ */

  // Load and apply the saved checkbox states and display statuses
  loadCheckboxState("shortcutsCheckboxState", shortcutsCheckbox);
  loadActiveStatus("shortcutEditField", shortcutEditField);
  loadActiveStatus("adaptiveIconField", adaptiveIconField);
  loadCheckboxState(
    "searchsuggestionscheckboxState",
    searchsuggestionscheckbox
  );
  loadCheckboxState("useproxyCheckboxState", useproxyCheckbox);
  loadCheckboxState("digitalCheckboxState", digitalCheckbox);
  loadCheckboxState("hourcheckboxState", hourcheckbox);
  loadActiveStatus("proxyinputField", proxyinputField);
  loadActiveStatus("timeformatField", timeformatField);
  loadActiveStatus("greetingField", greetingField);
  loadActiveStatus("proxybypassField", proxybypassField);
  loadCheckboxState("adaptiveIconToggle", adaptiveIconToggle);
  loadCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
  loadCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
  loadDisplayStatus("shortcutsDisplayStatus", shortcuts);
  loadDisplayStatus("aiToolsDisplayStatus", aiToolsCont);
  loadDisplayStatus("googleAppsDisplayStatus", googleAppsCont);
  loadCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);
  loadShortcuts();
});
