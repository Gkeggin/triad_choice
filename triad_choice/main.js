// main.js

// This will run when the page is loaded
window.onload = function() {
  console.log("JS is loaded and running!");

  // Just add some text to the body so you can see it's working
  const message = document.createElement("p");
  message.textContent = "Hello from main.js! The script is running.";
  document.body.appendChild(message);
};
