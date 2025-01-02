document.addEventListener("DOMContentLoaded", () => {
  const hour = document.getElementById("hour");
  const dot = document.getElementById("dot");
  const min = document.getElementById("min");
  const sec = document.getElementById("sec");
  const ampm = document.getElementById("ampm");
  const week = document.getElementById("week");
  const dateDisplay = document.getElementById("date"); // New element for displaying the date

  let showDot = true;

  function update() {
    showDot = !showDot;
    const now = new Date();

    // Toggle the visibility of the dot
    if (showDot) {
      dot.classList.add("invisible");
    } else {
      dot.classList.remove("invisible");
    }

    // Get 24-hour format
    const hours24 = now.getHours();
    const isAM = hours24 < 12;

    // Convert 24-hour to 12-hour format
    const hours12 = hours24 % 12 || 12; // Convert 0 to 12 for midnight and 12 to 12 for noon

    // Update hours, minutes, seconds, and AM/PM
    hour.textContent = String(hours12).padStart(2, "0"); // 12-hour format
    min.textContent = String(now.getMinutes()).padStart(2, "0");
    sec.textContent = String(now.getSeconds()).padStart(2, "0");
    ampm.textContent = isAM ? "AM" : "PM";

    // Highlight the current day of the week
    const dayIndex = (now.getDay() + 1) % 7; // Shift Sunday to after Saturday
    Array.from(week.children).forEach((ele) => ele.classList.remove("active"));
    week.children[dayIndex].classList.add("active");

    // Format the date as "28 Dec 2024"
    const day = now.getDate();
    const month = now.toLocaleString("default", { month: "short" }); // Get short month name (e.g., Dec)
    const year = now.getFullYear();

    // Display the date in the desired format
    dateDisplay.textContent = `${String(day).padStart(
      2,
      "0"
    )} ${month} ${year}`;
  }

  // Run the update function every 500ms
  setInterval(update, 500);

  // Initial update to set the correct time immediately
  update();
});
