const totalTrials = 75;
let currentTrial = 0;
const objectCount = 75;  // number of different objects
const angleStep = 5;     // degrees per step
const maxAngle = 180;

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

function normalRandom() {
  // Box-Muller transform for mean=0, sd=1
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clampAngle(a) {
  return Math.min(Math.max(a, 0), maxAngle);
}

function sampleAngle() {
  const steps = maxAngle / angleStep + 1;
  return Math.floor(Math.random() * steps) * angleStep;
}

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

function showTrial() {
  if (currentTrial >= totalTrials) {
    showEndScreen();
    return;
  }

  currentTrial++;
  updateProgressBar();

  // Random object between 1 and 75
  const objectId = Math.floor(Math.random() * objectCount) + 1;

  const refAngle = sampleAngle();
  const { near, far } = constrainedSample(refAngle);

  // Convert angle to index for filenames
  const refIndex = refAngle / angleStep;
  const nearIndex = near / angleStep;
  const farIndex = far / angleStep;

  const refFile = `stimuli/${objectId}_rot_${refIndex}.png`;
  const nearFile = `stimuli/${objectId}_rot_${nearIndex}.png`;
  const farFile = `stimuli/${objectId}_rot_${farIndex}.png`;

  trialContainer.innerHTML = `
    <h2>Trial ${currentTrial} of ${totalTrials}</h2>
    <h3>Reference image</h3>
    <img id="reference-img" src="${refFile}" alt="Reference Image" />
    <h3>Options (click the most similar)</h3>
    <img class="option" id="option1" src="${nearFile}" alt="Option 1" />
    <img class="option" id="option2" src="${farFile}" alt="Option 2" />
  `;

  document.getElementById('option1').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 1 (angle ${near})`);
    // TODO: Save choice data here
    showTrial();
  };

  document.getElementById('option2').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 2 (angle ${far})`);
    // TODO: Save choice data here
    showTrial();
  };
}

function showEndScreen() {
  trialContainer.innerHTML = `<h2>Thank you for completing the experiment!</h2>`;
}

window.onload = () => {
  updateProgressBar();
  showTrial();
};
