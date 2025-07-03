const totalTrials = 75;
let trialCount = 0;
const objectCount = 75;  // total different objects
const angleStep = 5;     // angle increments
const maxAngle = 180;

function sampleAngle() {
  const steps = maxAngle / angleStep + 1;
  return Math.floor(Math.random() * steps) * angleStep;
}

function normalRandom() {
  // Box-Muller transform for mean=0, sd=1
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

function startExperiment() {
  trialCount = 0;
  showInstructions();
}

function showInstructions() {
  const html = `
    <h2>In this task, you will see images of objects.</h2>
    <p>At the top is the <b>reference image</b>.</p>
    <p>At the bottom are two options.</p>
    <p>Your task: Click on the image that shows the object at the most similar angle to the reference.</p>
    <button id="start-button">Start Experiment</button>
  `;
  document.getElementById('experiment-container').innerHTML = html;
  document.getElementById('start-button').onclick = () => nextTrial();
}

function nextTrial() {
  trialCount++;
  if (trialCount > totalTrials) {
    showEndScreen();
    return;
  }
  
  // Pick random object from 1 to 75, without repeats would need a shuffle - simplified here
  const objectId = Math.floor(Math.random() * objectCount) + 1;
  
  const refAngle = sampleAngle();
  const { near, far } = constrainedSample(refAngle);
  
  const refFile = `stimuli/${objectId}_rot_${refAngle}.png`;
  const nearFile = `stimuli/${objectId}_rot_${near}.png`;
  const farFile = `stimuli/${objectId}_rot_${far}.png`;
  
  const html = `
    <h3>Trial ${trialCount} of ${totalTrials}</h3>
    <h3>Reference image</h3>
    <img src="${refFile}" alt="Reference image" style="width:200px;" />
    <h3>Options (click the most similar)</h3>
    <div>
      <img id="option1" src="${nearFile}" alt="Option 1" />
      <img id="option2" src="${farFile}" alt="Option 2" />
    </div>
  `;
  const container = document.getElementById('experiment-container');
  container.innerHTML = html;
  
  container.querySelector('#option1').onclick = () => {
    console.log(`Trial ${trialCount}: Chose option 1 (angle ${near})`);
    nextTrial();
  };
  container.querySelector('#option2').onclick = () => {
    console.log(`Trial ${trialCount}: Chose option 2 (angle ${far})`);
    nextTrial();
  };
}

function showEndScreen() {
  const html = `<h2>Thank you for completing the experiment!</h2>`;
  document.getElementById('experiment-container').innerHTML = html;
}

window.onload = () => startExperiment();
