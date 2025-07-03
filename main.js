const totalTrials = 75;
let currentTrial = 0;

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

const objectCount = 75; // total objects
const angleStep = 5;    // angle increments
const maxAngle = 180;

// Shuffle object IDs to avoid repeats
let objectOrder = [];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Box-Muller transform to sample from normal distribution
function normalRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clampAngle(a) {
  return Math.min(Math.max(a, 0), maxAngle);
}

// Sample near and far angles from normal distributions with constraints:
// min 10° difference, max 180°, near SD=5, far SD=15 degrees
function constrainedSample(refAngle) {
  const sdNear = 5;
  const sdFar = 15;
  let near, far;

  do {
    near = clampAngle(refAngle + Math.round(normalRandom() * sdNear));
    far = clampAngle(refAngle + Math.round(normalRandom() * sdFar));
  } while (Math.abs(far - near) < 10 || near === far || far > maxAngle);

  return { near, far };
}

function sampleAngle() {
  const steps = maxAngle / angleStep + 1;
  return Math.floor(Math.random() * steps) * angleStep;
}

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

function showTrial() {
  if (currentTrial >= totalTrials) {
    trialContainer.innerHTML = `<h2>Thank you for completing the experiment!</h2>`;
    return;
  }

  const objectId = objectOrder[currentTrial];
  const refAngle = sampleAngle();
  const { near, far } = constrainedSample(refAngle);

  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;

  // Randomize option order so near/far don’t always appear on the same side
  const options = [
    {id: 'option1', file: nearFile, angle: near},
    {id: 'option2', file: farFile, angle: far}
  ];
  options.sort(() => Math.random() - 0.5);

  trialContainer.innerHTML = `
    <h3>Trial ${currentTrial + 1} of ${totalTrials}</h3>
    <h3>Reference Image</h3>
    <img src="${refFile}" alt="Reference Image" style="width: 200px;" />
    <h3>Choose the most similar angle</h3>
    <div style="display: flex; gap: 40px; justify-content: center;">
      <img id="${options[0].id}" class="option" src="${options[0].file}" alt="Option 1" style="width: 150px; border: 3px solid transparent; cursor: pointer;" />
      <img id="${options[1].id}" class="option" src="${options[1].file}" alt="Option 2" style="width: 150px; border: 3px solid transparent; cursor: pointer;" />
    </div>
  `;

  // Add hover effect for border highlight
  document.querySelectorAll('.option').forEach(img => {
    img.addEventListener('mouseenter', () => img.style.borderColor = 'green');
    img.addEventListener('mouseleave', () => img.style.borderColor = 'transparent');
  });

  // Set click handlers
  document.getElementById(options[0].id).onclick = () => {
    console.log(`Trial ${currentTrial + 1}: Chose ${options[0].id} (angle ${options[0].angle})`);
    currentTrial++;
    updateProgressBar();
    showTrial();
  };
  document.getElementById(options[1].id).onclick = () => {
    console.log(`Trial ${currentTrial + 1}: Chose ${options[1].id} (angle ${options[1].angle})`);
    currentTrial++;
    updateProgressBar();
    showTrial();
  };
}

// Initialization
function startExperiment() {
  currentTrial = 0;
  objectOrder = shuffle([...Array(objectCount).keys()].map(i => i + 1)); // [1..75] shuffled
  updateProgressBar();
  showTrial();
}

window.onload = startExperiment;

