const totalTrials = 75;
let currentTrial = 0;

const trialContainer = document.getElementById('trial-container');
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  progressBar.style.width = percent + '%';
}

function sampleAngle() {
  const maxAngle = 180;
  const angleStep = 5;
  const steps = maxAngle / angleStep + 1;
  return Math.floor(Math.random() * steps) * angleStep;
}

function normalRandom() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clampAngle(a, max = 180) {
  return Math.min(Math.max(a, 0), max);
}

function constrainedSample(refAngle) {
  const sdNear = 5;
  const sdFar = 15;
  let near, far;
  do {
    near = clampAngle(refAngle + Math.round(normalRandom() * sdNear));
    far = clampAngle(refAngle + Math.round(normalRandom() * sdFar));
  } while(Math.abs(far - near) < 10 || near === far || far > 180);
  return { near, far };
}

function showTrial() {
  if (currentTrial >= totalTrials) {
    trialContainer.innerHTML = `<h2>Thank you for completing the experiment!</h2>`;
    return;
  }

  currentTrial++;

  // Pick random object 1-75 (you can later implement no repeats)
  const objectId = Math.floor(Math.random() * 75) + 1;
  const refAngle = sampleAngle();
  const { near, far } = constrainedSample(refAngle);

  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;

  trialContainer.innerHTML = `
    <h3>Trial ${currentTrial} of ${totalTrials}</h3>
    <h3>Reference Image</h3>
    <img src="${refFile}" alt="Reference" style="width:200px;"/>
    <h3>Choose the most similar angle</h3>
    <div>
      <img id="option1" src="${nearFile}" alt="Option 1" style="width:150px; cursor:pointer; border: 3px solid transparent;"/>
      <img id="option2" src="${farFile}" alt="Option 2" style="width:150px; cursor:pointer; border: 3px solid transparent;"/>
    </div>
  `;

  updateProgressBar();

  // Hover highlight
  document.querySelectorAll('#option1, #option2').forEach(img => {
    img.addEventListener('mouseenter', () => img.style.borderColor = 'green');
    img.addEventListener('mouseleave', () => img.style.borderColor = 'transparent');
  });

  // Click handlers
  document.getElementById('option1').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 1 (angle ${near})`);
    showTrial();
  };

  document.getElementById('option2').onclick = () => {
    console.log(`Trial ${currentTrial}: Chose option 2 (angle ${far})`);
    showTrial();
  };
}

// Initialize
window.onload = () => {
  updateProgressBar();
  showTrial();
};

