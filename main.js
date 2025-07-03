// --- Constants and state ---
const totalTrials = 75;
const objectCount = 75;
const angleStep = 5;
const maxAngle = 180;

let currentTrial = 0;
let objectOrder = [];
let catchTrialPositions = [];
let responses = [];

const catchTrials = [
  {
    objectId: 1,
    refAngle: 0,
    nearAngle: 5,
    farAngle: 30,
    correctOption: 1
  },
  {
    objectId: 2,
    refAngle: 45,
    nearAngle: 50,
    farAngle: 90,
    correctOption: 1
  }
];

// --- Utility functions ---
function shuffleArray(array) {
  for(let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function sampleAngle() {
  const steps = maxAngle / angleStep + 1;
  return Math.floor(Math.random() * steps) * angleStep;
}

function normalRandom() {
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

function insertCatchTrials() {
  catchTrialPositions = [];
  while(catchTrialPositions.length < catchTrials.length) {
    const pos = Math.floor(Math.random() * totalTrials) + 1;
    if(!catchTrialPositions.includes(pos)) {
      catchTrialPositions.push(pos);
    }
  }
  catchTrialPositions.sort((a,b) => a - b);
}

// --- Experiment setup ---
function startExperiment() {
  currentTrial = 0;
  responses = [];

  // Prepare shuffled order of objects for normal trials
  objectOrder = Array.from({ length: objectCount }, (_, i) => i + 1);
  shuffleArray(objectOrder);

  // Insert catch trials at random positions
  insertCatchTrials();

  nextTrial();
}

// --- DOM references ---
const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

// --- Update progress bar ---
function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

// --- Save participant response ---
function saveResponse(trial, objectId, refAngle, nearAngle, farAngle, chosenOption, correctOption) {
  const isCatch = correctOption !== null;
  const isCorrect = isCatch ? (chosenOption === correctOption) : null;

  const response = {
    trial,
    objectId,
    refAngle,
    nearAngle,
    farAngle,
    chosenOption,
    isCatch,
    isCorrect,
    timestamp: new Date().toISOString()
  };

  responses.push(response);
  console.log('Saved response:', response);
}

// --- Show end screen and provide CSV download ---
function showEndScreen() {
  const csvHeader = "trial,objectId,refAngle,nearAngle,farAngle,chosenOption,isCatch,isCorrect,timestamp\n";
  const csvRows = responses.map(r => 
    `${r.trial},${r.objectId},${r.refAngle},${r.nearAngle},${r.farAngle},${r.chosenOption},${r.isCatch},${r.isCorrect},${r.timestamp}`
  ).join('\n');
  const csvContent = csvHeader + csvRows;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  trialContainer.innerHTML = `
    <h2>Thank you for completing the experiment!</h2>
    <a href="${url}" download="experiment_responses.csv">Download your responses (CSV)</a>
  `;

  progressBar.style.width = '100%';
}

// --- Run next trial ---
function nextTrial() {
  if (currentTrial >= totalTrials) {
    showEndScreen();
    return;
  }

  currentTrial++;
  updateProgressBar();

  // Check if current trial is a catch trial
  const catchIndex = catchTrialPositions.indexOf(currentTrial);

  let objectId, refAngle, nearAngle, farAngle, correctOption;

  if (catchIndex !== -1) {
    // Load catch trial
    const ct = catchTrials[catchIndex];
    objectId = ct.objectId;
    refAngle = ct.refAngle;
    nearAngle = ct.nearAngle;
    farAngle = ct.farAngle;
    correctOption = ct.correctOption;
  } else {
    // Normal trial
    objectId = objectOrder[currentTrial - 1];
    refAngle = sampleAngle();
    const angles = constrainedSample(refAngle);
    nearAngle = angles.near;
    farAngle = angles.far;
    correctOption = null;
  }

  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const opt1File = `stimuli/${objectId}_rot_${nearAngle}.png`;
  const opt2File = `stimuli/${objectId}_rot_${farAngle}.png`;

  // Render trial HTML
  trialContainer.innerHTML = `
    <h3>Trial ${currentTrial} of ${totalTrials}</h3>
    <h3>Reference image</h3>
    <img src="${refFile}" alt="Reference" style="width:200px;" />
    <h3>Options (click the most similar)</h3>
    <div>
      <img id="option1" src="${opt1File}" alt="Option 1" style="cursor:pointer; border: 3px solid transparent; margin-right:20px;" />
      <img id="option2" src="${opt2File}" alt="Option 2" style="cursor:pointer; border: 3px solid transparent;" />
    </div>
  `;

  // Add hover effect to highlight border
  ['option1', 'option2'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('mouseenter', () => el.style.borderColor = 'green');
    el.addEventListener('mouseleave', () => el.style.borderColor = 'transparent');
  });

  // Click handlers to save response and move to next trial
  document.getElementById('option1').onclick = () => {
    saveResponse(currentTrial, objectId, refAngle, nearAngle, farAngle, 1, correctOption);
    nextTrial();
  };
  document.getElementById('option2').onclick = () => {
    saveResponse(currentTrial, objectId, refAngle, nearAngle, farAngle, 2, correctOption);
    nextTrial();
  };
}

// --- Start the experiment on window load ---
window.onload = () => {
  startExperiment();
};
