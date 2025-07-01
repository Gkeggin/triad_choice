window.onload = function() {
  console.log("JS is loaded and running!");
  const message = document.createElement("p");
  message.textContent = "Hello from main.js! The script is running.";
  document.body.appendChild(message);
};
