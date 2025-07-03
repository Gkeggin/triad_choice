const totalTrials = 75;
let currentTrial = 0;
const trialData = [];

const objectCount = 75;  // Total unique objects
const angleStep = 5;
const maxAngle = 180;

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

function updateProgressBar() {
  const percent = (currentTrial / totalTrials) * 100;
  document.getElementById('progress-bar').style.width = percent + '%';
}

function nextTrial() {
  if (currentTrial >= totalTrials) {
    endExperiment();
    return;
  }
  
  currentTrial++;
  updateProgressBar();
  
  // Sample trial variables
  const objectId = currentTrial; // For simplicity, use trial number (or shuffle for random)
  const refAngle = sampleAngle();
  const { near, far } = constrainedSample(refAngle);
  
  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;
  
  // Show trial stimuli
  const container = document.getElementById('trial-container');
  container.innerHTML = `
    <h3>Trial ${currentTrial} of ${totalTrials}</h3>
    <h3>Reference image</h3>
    <img src="${refFile}" style="width:200px;" />
    <h3>Options (click the most similar)</h3>
    <div>
      <img id="option1" src="${nearFile}" style="width:150px; cursor:pointer; border: 3px solid transparent;" />
      <img id="option2" src="${farFile}" style="width:150px; cursor:pointer; border: 3px solid transparent;" />
    </div>
  `;

  // Timestamp start
  const startTime = Date.now();
  
  // Hover effect for options
  ['option1', 'option2'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('mouseenter', () => el.style.borderColor = 'green');
    el.addEventListener('mouseleave', () => el.style.borderColor = 'transparent');
  });

  // Click handlers
  document.getElementById('option1').onclick = () => recordChoice(1, near);
  document.getElementById('option2').onclick = () => recordChoice(2, far);

  function recordChoice(choiceNum, chosenAngle) {
    const rt = Date.now() - startTime;
    trialData.push({
      trial: currentTrial,
      objectId,
      refAngle,
      near,
      far,
      choice: choiceNum,
      chosenAngle,
      rt
    });
    nextTrial();
  }
}

function endExperiment() {
  // Generate CSV text
  const headers = ['trial','objectId','refAngle','near','far','choice','chosenAngle','rt'];
  const csvRows = [headers.join(',')];
  
  trialData.forEach(row => {
    csvRows.push(headers.map(h => row[h]).join(','));
  });
  
  const csvString = csvRows.join('\n');
  
  // Display download link
  const container = document.getElementById('trial-container');
  container.innerHTML = `
    <h2>Thank you for completing the experiment!</h2>
    <a href="data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}" download="triad_choice_data.csv">Download your data (CSV)</a>
  `;
}

// Start the experiment on window load
window.onload = () => {
  currentTrial = 0;
  updateProgressBar();
  nextTrial();
};

