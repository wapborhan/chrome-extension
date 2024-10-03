// Create custom context menu
document.addEventListener("DOMContentLoaded", () => {
  // Create a custom menu div
  const customMenu = document.createElement("div");
  customMenu.style.position = "absolute";
  customMenu.style.backgroundColor = "#333";
  customMenu.style.color = "#fff";
  customMenu.style.padding = "10px";
  customMenu.style.borderRadius = "5px";
  customMenu.style.display = "none";
  customMenu.style.zIndex = "1000";
  customMenu.id = "customMenu";

  // Add refresh button to the custom menu with Font Awesome icon
  const refreshButton = document.createElement("button");
  refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Changes Quotes';
  refreshButton.style.background = "none";
  refreshButton.style.border = "none";
  refreshButton.style.color = "#fff";
  refreshButton.style.cursor = "pointer";
  refreshButton.style.fontSize = "16px";

  // Add the button to the custom menu
  customMenu.appendChild(refreshButton);
  document.body.appendChild(customMenu);

  // Add event listener for right-click (context menu)
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault(); // Prevent the default context menu
    customMenu.style.top = `${event.pageY}px`;
    customMenu.style.left = `${event.pageX}px`;
    customMenu.style.display = "block"; // Show custom menu
  });

  // Hide the menu when clicking anywhere outside
  document.addEventListener("click", function () {
    customMenu.style.display = "none"; // Hide custom menu
  });

  // Add functionality to refresh button
  refreshButton.addEventListener("click", () => {
    location.reload(); // Refresh the page
  });
});
