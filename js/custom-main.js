const images = [
  "../images/bg-1.jpg",
  "../images/bg-2.jpg",
  "../images/bg-3.jpg",
];

let currentIndex = 0;

function changeBackground() {
  currentIndex = (currentIndex + 1) % images.length;
  let newBackground = images[currentIndex];

  // Set the background
  document.body.style.backgroundImage = `url(${newBackground})`;

  // Save the current background in chrome.storage.local
  chrome.storage.local.set({ backgroundImage: newBackground }, function () {
    console.log("Background image saved.");
  });
}

// Button click event listener
document
  .getElementById("changeBackgroundButton")
  .addEventListener("click", changeBackground);

// Automatically change the background every 5 minutes (300000 milliseconds)
setInterval(changeBackground, 300000);

// Check if a background is saved and set it when the page loads
chrome.storage.local.get("backgroundImage", function (result) {
  if (result.backgroundImage) {
    document.body.style.backgroundImage = `url(${result.backgroundImage})`;
  }
});
