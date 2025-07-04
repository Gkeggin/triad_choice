const totalTrials = 75;
const objectCount = 75;   // number of objects
const maxRotIndex = 74;   // rot_0 to rot_74
let currentTrial = 0;

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

// Box-Muller transform for normal distribution (mean=0, sd=1)
function normalRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clampIndex(i) {
  return Math.min(Math.max(i, 0), maxRotIndex);
}

function sampleIndex() {
  return Math.floor(Math.random() * (maxRotIndex + 1));
}

function constrainedSample(refIndex) {
  const sdNear = 3;
  const sdFar = 6;
  let near, far;
  do {
    near = clampIndex(refIndex + Math.round(normalRandom() * sdNear));
    far = clampIndex(refIndex + Math.round(normalRandom() * sdFar));
  } while (Math.abs(far - near) < 2 || near === far);  // <-- changed here
  return { near, far };
}

function nextTrial() {
  currentTrial++;
  if (currentTrial > totalTrials) {
    showEndScreen();
    return;
  }

  const objectId = Math.floor(Math.random() * objectCount) + 1;
  const refIndex = sampleIndex();
  const { near, far } = constrainedSample(refIndex);

  const refFile = `stimuli/${objectId}_rot_${refIndex}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;

  console.log('Trial', currentTrial, 'Files:', refFile, nearFile, farFile);  // Debug

  const html = `
    <h3>Trial ${currentTrial} of ${totalTrials}</h3>
    <h3>Reference image</h3>
    <img id="reference-img" src="${refFile}" alt="Reference Image" />
    <h3>Options (click the most similar)</h3>
    <div>
      <img class="option" id="option1" src="${nearFile}" alt="Option 1" />
      <img class="option" id="option2" src="${farFile}" alt="Option 2" />
    </div>
  `;

  trialContainer.innerHTML = html;
  updateProgressBar();

  document.getElementById('option1').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 1 (index ${near})`);
    nextTrial();
  };

  document.getElementById('option2').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 2 (index ${far})`);
    nextTrial();
  };
}

function showEndScreen() {
  trialContainer.innerHTML = `<h2>Thank you for completing the experiment!</h2>`;
  progressBar.style.width = '100%';
}

window.onload = () => {
  currentTrial = 0;
  updateProgressBar();
  nextTrial();
};
