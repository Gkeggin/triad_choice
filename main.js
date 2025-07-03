const totalTrials = 75;
let currentTrial = 0;
const objectCount = 75;
const maxIndex = 36;  // indices for 0 to 180 degrees in 5 degree steps

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

function normalRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clampIndex(idx) {
  return Math.min(Math.max(idx, 0), maxIndex);
}

function constrainedSample(refIndex) {
  const sdNear = 1;
  const sdFar = 3;
  let near, far;
  do {
    near = clampIndex(refIndex + Math.round(normalRandom() * sdNear));
    far = clampIndex(refIndex + Math.round(normalRandom() * sdFar));
  } while (Math.abs(far - near) < 2 || near === far || far > maxIndex);
  return { near, far };
}

function showTrial() {
  if (currentTrial >= totalTrials) {
    showEndScreen();
    return;
  }

  currentTrial++;
  updateProgressBar();

  const objectId = Math.floor(Math.random() * objectCount) + 1;
  const refIndex = Math.floor(Math.random() * (maxIndex + 1));
  const { near, far } = constrainedSample(refIndex);

  const refFile = `stimuli/${objectId}_rot_${refIndex}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;

  trialContainer.innerHTML = `
    <h3>Trial ${currentTrial} of ${totalTrials}</h3>
    <h3>Reference image</h3>
    <img id="reference-img" src="${refFile}" alt="Reference image" />
    <h3>Options (click the most similar)</h3>
    <div>
      <img class="option" id="option1" src="${nearFile}" alt="Option 1" />
      <img class="option" id="option2" src="${farFile}" alt="Option 2" />
    </div>
  `;

  // Setup click handlers and save data
  document.getElementById('option1').onclick = () => {
    saveTrialData(objectId, refIndex, near, far, 1);
    showTrial();
  };

  document.getElementById('option2').onclick = () => {
    saveTrialData(objectId, refIndex, near, far, 2);
    showTrial();
  };
}

const results = [];

function saveTrialData(objectId, refIndex, near, far, choice) {
  results.push({
    trial: currentTrial,
    objectId,
    referenceIndex: refIndex,
    referenceAngle: refIndex * 5,
    nearIndex: near,
    nearAngle: near * 5,
    farIndex: far,
    farAngle: far * 5,
    choice
  });
  console.log(`Trial ${currentTrial}: Chose option ${choice}`);
}

function showEndScreen() {
  trialContainer.innerHTML = `<h2>Thank you for completing the experiment!</h2>
    <button id="download-btn">Download Results</button>`;
  progressBar.style.width = '100%';

  document.getElementById('download-btn').onclick = downloadResults;
}

function downloadResults() {
  const header = [
    'trial', 'objectId', 'referenceIndex', 'referenceAngle',
    'nearIndex', 'nearAngle', 'farIndex', 'farAngle', 'choice'
  ].join(',');

  const csvRows = results.map(r =>
    [r.trial, r.objectId, r.referenceIndex, r.referenceAngle,
     r.nearIndex, r.nearAngle, r.farIndex, r.farAngle, r.choice].join(',')
  );

  const csvContent = [header, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'triad_choice_results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.onload = () => {
  updateProgressBar();
  showTrial();
};
