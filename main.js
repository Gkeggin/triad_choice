const totalTrials = 75;
const objectCount = 75;  // total objects
const angleStep = 5;
const maxAngle = 180;

let currentTrial = 0;
const usedObjects = new Set();
const responses = [];

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

// Utility: Sample angle from {0,5,...,180}
function sampleAngle() {
  const steps = maxAngle / angleStep + 1;
  return Math.floor(Math.random() * steps) * angleStep;
}

// Box-Muller transform: normal dist mean=0 sd=1
function normalRandom() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Clamp angle between 0 and maxAngle
function clampAngle(a) {
  return Math.min(Math.max(a, 0), maxAngle);
}

// Sample near/far angles with constraints
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

// Pick a unique object ID (no repeats)
function getUniqueObject() {
  if (usedObjects.size >= objectCount) return null; // all used
  let id;
  do {
    id = Math.floor(Math.random() * objectCount) + 1;
  } while (usedObjects.has(id));
  usedObjects.add(id);
  return id;
}

// Update progress bar width (no numbers shown)
function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

// Show a trial with images and click handlers
function showTrial() {
  currentTrial++;
  if (currentTrial > totalTrials) {
    showEndScreen();
    return;
  }
  
  updateProgressBar();
  
  const objectId = getUniqueObject();
  if (!objectId) {
    showEndScreen();
    return;
  }
  
  const refAngle = sampleAngle();
  const { near, far } = constrainedSample(refAngle);
  
  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;
  
  trialContainer.innerHTML = `
    <h3>Reference Image</h3>
    <img src="${refFile}" alt="Reference" style="width:200px;" />
    <h3>Choose the more similar angle</h3>
    <div>
      <img id="option1" src="${nearFile}" alt="Option 1" />
      <img id="option2" src="${farFile}" alt="Option 2" />
    </div>
  `;
  
  // On click, save response and go to next trial
  document.getElementById('option1').onclick = () => {
    responses.push({
      trial: currentTrial,
      object: objectId,
      refAngle,
      chosenOption: 'option1',
      chosenAngle: near,
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
      timestamp: new Date().toISOString()
    });
    showTrial();
  };
}

// Show final screen with data download button
function showEndScreen() {
  trialContainer.innerHTML = `
    <h2>Thank you for completing the experiment!</h2>
    <button id="download-btn">Download your data</button>
  `;
  
  progressBar.style.width = '100%';
  
  document.getElementById('download-btn').onclick = () => {
    downloadCSV();
  };
}

// Download CSV helper
function downloadCSV() {
  if (responses.length === 0) return alert('No data to download.');
  
  const headers = Object.keys(responses[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const row of responses) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'experiment_data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Start experiment on page load
window.onload = () => {
  showTrial();
  updateProgressBar();
};
