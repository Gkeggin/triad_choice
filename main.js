const totalTrials = 75;
let currentTrial = 0;
const maxIndex = 74;  // max rotation index (0 to 74)
const objectCount = 75; // objects 1 to 75

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

function normalRandom() {
  // Box-Muller transform for mean=0, sd=1
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function constrainedSampleIndex(refIndex) {
  let near, far;
  do {
    near = Math.min(Math.max(0, refIndex + Math.round(normalRandom() * 5)), maxIndex);
    far = Math.min(Math.max(0, refIndex + Math.round(normalRandom() * 15)), maxIndex);
  } while (Math.abs(far - near) < 2 || near === far);
  return { near, far };
}

function nextTrial() {
  if (currentTrial >= totalTrials) {
    showEndScreen();
    return;
  }
  currentTrial++;
  updateProgressBar();

  // Random object ID between 1 and 75
  const objectId = Math.floor(Math.random() * objectCount) + 1;

  // Sample reference rotation index and near/far indexes
  const refIndex = Math.floor(Math.random() * (maxIndex + 1));
  const { near, far } = constrainedSampleIndex(refIndex);

  // Build image filenames
  const refFile = `stimuli/${objectId}_rot_${refIndex}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;

  // Show trial content
  trialContainer.innerHTML = `
    <h3>Trial ${currentTrial} of ${totalTrials}</h3>
    <h3>Reference image</h3>
    <img id="reference-img" src="${refFile}" alt="Reference Image" />
    <h3>Options (click the most similar)</h3>
    <div>
      <img class="option" id="option1" src="${nearFile}" alt="Option 1" />
      <img class="option" id="option2" src="${farFile}" alt="Option 2" />
    </div>
  `;

  // Setup click handlers to save data and proceed to next trial
  document.getElementById('option1').onclick = () => {
    saveResponse(objectId, refIndex, near, far, 'option1');
    nextTrial();
  };
  document.getElementById('option2').onclick = () => {
    saveResponse(objectId, refIndex, near, far, 'option2');
    nextTrial();
  };
}

// Data saving array to hold all responses
const responses = [];

function saveResponse(objectId, refIndex, near, far, chosenOption) {
  responses.push({
    trial: currentTrial,
    objectId,
    refIndex,
    near,
    far,
    chosenOption,
    timestamp: new Date().toISOString()
  });
  console.log(`Trial ${currentTrial}: Chose ${chosenOption}`);
}

function showEndScreen() {
  // Create CSV string from responses
  const header = "trial,objectId,refIndex,near,far,chosenOption,timestamp\n";
  const rows = responses.map(r => 
    `${r.trial},${r.objectId},${r.refIndex},${r.near},${r.far},${r.chosenOption},${r.timestamp}`
  ).join("\n");
  const csvContent = header + rows;

  // Create downloadable link for CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  trialContainer.innerHTML = `
    <h2>Thank you for completing the experiment!</h2>
    <a href="${url}" download="triad_choice_responses.csv">Download your responses (CSV)</a>
  `;
}

window.onload = () => {
  updateProgressBar();
  nextTrial();
};
