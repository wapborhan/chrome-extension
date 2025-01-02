const apiKey = "acdffa918ce63d18185d3897fa4d5024"; // Replace with your OpenWeatherMap API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

// document
//   .getElementById("weatherForm")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();
//     let city = document.getElementById("cityInput").value;
//     city = city.trim();
//     getWeather(city);
//   });

function getWeather(city) {
  fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`)
    .then((response) => response.json())
    .then((data) => {
      updateWeather(data);
      return fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      //   updateForecast(data);
    })
    .catch((error) => {
      console.log("error while fetching weather:", error);
      return;
    });
}

function updateWeather(data) {
  document.getElementById("cityName").innerText = data.name;
  document.getElementById("date").innerText = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );
  document.getElementById("weatherDescription").innerText =
    data.weather[0].description;
  document.getElementById("temperature").innerText = `${Math.round(
    data.main.temp
  )}°`;
  //   document.getElementById("feelsLike").innerText = `+${Math.round(
  //     data.main.feels_like
  //   )}°`;
  //   document.getElementById("tempRange").innerText = `+${Math.round(
  //     data.main.temp_max
  //   )}° to ${Math.round(data.main.temp_min)}°`;
  document.getElementById("windSpeed").innerText = `${data.wind.speed} km/h`;
  document.getElementById("humidity").innerText = `${data.main.humidity} %`;
  document.getElementById("visibility").innerText = `${
    data.visibility / 1000
  } km`;
}

// function updateForecast(data) {
//   const forecastContainer = document.getElementById("weeklyForecast");
//   forecastContainer.innerHTML = "";

//   const forecastData = data.list.filter((item, index) => index % 8 == 0); // Get data for each day (every 8th item)
//   console.log(forecastData);
//   forecastData.forEach((item) => {
//     const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

//     const forecastItem = document.createElement("div");
//     forecastItem.className =
//       "rounded-lg border-2 border-gray-600 px-6 p-2 text-center";
//     forecastItem.innerHTML = `
//           <p class="text-2xl font-bold">${Math.round(item.main.temp)}°</p>
//           <img src="${iconUrl}" alt="${
//       item.weather[0].description
//     }" class="w-22 mx-auto" />
//           <p class="">${new Date(item.dt_txt).toLocaleDateString("en-US", {
//             day: "numeric",
//             month: "short",
//           })}</p>
//         `;
//     forecastContainer.appendChild(forecastItem);
//   });
// }

// Fetch weather for default city on page load
getWeather("kushtia");
