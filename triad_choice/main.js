document.addEventListener('DOMContentLoaded', () => {
  const container = document.createElement('div');
  container.style.textAlign = 'center';
  container.style.marginTop = '10%';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Which image matches the one on top?';

  const p = document.createElement('p');
  p.textContent = 'Click an image to select your answer.';
  
  container.appendChild(heading);
  container.appendChild(p);
  
  // Add a dummy image (replace with your actual images)
  const img = document.createElement('img');
  img.src = 'https://via.placeholder.com/150';
  img.alt = 'Option 1';
  img.style.margin = '10px';
  img.style.cursor = 'pointer';
  
  container.appendChild(img);
  
  document.body.appendChild(container);
});
