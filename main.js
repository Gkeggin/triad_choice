const totalTrials = 75;
let currentTrial = 0;
const objectCount = 75;
const angleStep = 5;
const maxAngle = 180;

// Keep track of objects already used to avoid repeats
const usedObjects = new Set();

// Responses array to save data
const responses = [];

// Catch trials definition (hardcoded easy trials)
const catchTrials = [
  { trialNum: 10, objectId: 1, refAngle: 0, nearAngle: 5, farAngle: 30 },
  { trialNum: 50, objectId: 2, refAngle: 0, nearAngle: 5, farAngle: 30 }
];

// Elements references
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

// Get a unique random objectId from 1 to objectCount (no repeats)
function getUniqueObject() {
  if (usedObjects.size >= objectCount) return null; // no more unique objects
  let obj;
  do {
    obj = Math.floor(Math.random() * objectCount) + 1;
  } while(usedObjects.has(obj));
  usedObjects.add(obj);
  return obj;
}

function showTrial() {
  if(currentTrial >= totalTrials) {
    showEndScreen();
    return;
  }
  
  currentTrial++;
  updateProgressBar();

  // Check if this is a catch trial
  const catchTrial = catchTrials.find(ct => ct.trialNum === currentTrial);
  
  let objectId, refAngle, near, far;

  if (catchTrial) {
    objectId = catchTrial.objectId;
    refAngle = catchTrial.refAngle;
    near = catchTrial.nearAngle;
    far = catchTrial.farAngle;
  } else {
    objectId = getUniqueObject();
    if (!objectId) {
      showEndScreen();
      return;
    }
    refAngle = sampleAngle();
    ({ near, far } = constrainedSample(refAngle));
  }
  
  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;
  
  trialContainer.innerHTML = `
    <h3>Reference Image</h3>
    <img src="${refFile}" alt="Reference" style="width:200px;" />
    <h3>Choose the more similar angle</h3>
    <div style="display:flex; gap: 40px; justify-content:center;">
      <img id="option1" src="${nearFile}" alt="Option 1" style="cursor:pointer; border: 3px solid transparent; width:150px;" />
      <img id="option2" src="${farFile}" alt="Option 2" style="cursor:pointer; border: 3px solid transparent; width:150px;" />
    </div>
  `;

  // Highlight border on hover
  document.getElementById('option1').addEventListener('mouseenter', () => {
    document.getElementById('option1').style.borderColor = 'green';
  });
  document.getElementById('option1').addEventListener('mouseleave', () => {
    document.getElementById('option1').style.borderColor = 'transparent';
  });
  document.getElementById('option2').addEventListener('mouseenter', () => {
    document.getElementById('option2').style.borderColor = 'green';
  });
  document.getElementById('option2').addEventListener('mouseleave', () => {
    document.getElementById('option2').style.borderColor = 'transparent';
  });

  // Click handlers
  document.getElementById('option1').onclick = () => {
    responses.push({
      trial: currentTrial,
      object: objectId,
      refAngle,
      chosenOption: 'option1',
      chosenAngle: near,
      isCatchTrial: !!catchTrial,
      timestamp: new Date().toISOString()
    });
    showTrial();
  };

  document.getElementById('option2').onclick = () => {
    responses.push({
      trial: currentTrial,
      object: objectId,
      refAngle,
      chosenOption: 'option2',
      chosenAngle: far,
      isCatchTrial: !!catchTrial,
      timestamp: new Date().toISOString()
    });
    showTrial();
  };
}

function showEndScreen() {
  trialContainer.innerHTML = `
    <h2>Thank you for completing the experiment!</h2>
    <button id="download-btn">Download Data</button>
  `;

  document.getElementById('download-btn').onclick = () => {
    downloadCSV();
  };
}

// Convert responses array to CSV and download
function downloadCSV() {
  if (responses.length === 0) {
    alert("No data to download!");
    return;
  }

  const header = Object.keys(responses[0]).join(',');
  const rows = responses.map(obj => Object.values(obj).join(','));
  const csvContent = [header, ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'experiment_data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Start experiment when page loads
window.onload = () => {
  currentTrial = 0;
  updateProgressBar();
  showTrial();
};
