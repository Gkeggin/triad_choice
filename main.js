const totalTrials = 75;
let currentTrial = 0;
const objectCount = 75;    // Number of objects
const angleStep = 5;       // Angle increments
const maxAngle = 180;      // Max angle allowed

// To keep track of used objects so no repeats
const usedObjects = new Set();

// Missing files log
const missingFiles = [];

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

function sampleAngle() {
  const steps = maxAngle / angleStep + 1;
  return Math.floor(Math.random() * steps) * angleStep;
}

function normalRandom() {
  // Box-Muller transform for mean=0, sd=1
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clampAngle(a) {
  return Math.min(Math.max(a, 0), maxAngle);
}

function constrainedSample(refAngle) {
  const sdNear = 5;
  const sdFar = 15;
  let near, far;
  do {
    near = clampAngle(refAngle + Math.round(normalRandom() * sdNear));
    far = clampAngle(refAngle + Math.round(normalRandom() * sdFar));
  } while(Math.abs(far - near) < 10 || near === far || far > maxAngle);
  return { near, far };
}

function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function nextTrial() {
  if (currentTrial >= totalTrials) {
    showEndScreen();
    console.log('Missing files during experiment:', missingFiles);
    return;
  }

  // Pick an unused objectId
  let objectId;
  do {
    objectId = Math.floor(Math.random() * objectCount) + 1;
  } while (usedObjects.has(objectId) && usedObjects.size < objectCount);
  usedObjects.add(objectId);

  // Sample reference angle and options
  const refAngle = sampleAngle();
  const { near, far } = constrainedSample(refAngle);

  // Construct file paths
  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;

  // Check if all images exist
  const refExists = await checkImageExists(refFile);
  const nearExists = await checkImageExists(nearFile);
  const farExists = await checkImageExists(farFile);

  if (!refExists) {
    missingFiles.push(refFile);
    console.warn('Missing reference image:', refFile);
  }
  if (!nearExists) {
    missingFiles.push(nearFile);
    console.warn('Missing option 1 image:', nearFile);
  }
  if (!farExists) {
    missingFiles.push(farFile);
    console.warn('Missing option 2 image:', farFile);
  }

  // If any missing, skip trial and retry
  if (!refExists || !nearExists || !farExists) {
    // Just retry the trial with a different object
    return nextTrial();
  }

  currentTrial++;
  updateProgressBar();

  // Show trial HTML
  trialContainer.innerHTML = `
    <h3>Trial ${currentTrial} of ${totalTrials}</h3>
    <h3>Reference image</h3>
    <img id="reference-img" src="${refFile}" alt="Reference image" />
    <h3>Options (click the more similar)</h3>
    <div>
      <img class="option" id="option1" src="${nearFile}" alt="Option 1" />
      <img class="option" id="option2" src="${farFile}" alt="Option 2" />
    </div>
  `;

  // Click handlers for options
  document.getElementById('option1').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 1 (angle ${near})`);
    nextTrial();
  };

  document.getElementById('option2').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 2 (angle ${far})`);
    nextTrial();
  };
}

function showEndScreen() {
  trialContainer.innerHTML = `<h2>Thank you for completing the experiment!</h2>`;
  console.log('Experiment finished.');
  console.log('Missing files encountered:', missingFiles);
}

// Start experiment on page load
window.onload = () => {
  updateProgressBar();
  nextTrial();
};
