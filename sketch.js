let ml;
let bridge;

let wordClassMap = {
  "skyscraper": "class_1770897120362",
  "beach": "class_1770897120888",
  "bus": "class_1770897119972",
  "train": "class_1770897119570",
  "crosswalk": "class_1770897121562",
  "traffic light": "class_1770897118779",
  "grass": "class_1",
  "flowers": "class_2"
};

let words = Object.keys(wordClassMap);

let targetWord = "";
let detectedCorrect = false;
let switchDelay = 1000;
let switchTimer = 0;

let score = 0;
let showingCongrats = false;
let congratsTimer = 0;

function setup() {
  createCanvas(400, 400);

  ml = new MLBridge();
  bridge = new SerialBridge();

  bridge.onData('device_1', (data) => {
    console.log("Arduino says:", data);
  });

  pickNewWord();

  ml.onPrediction((data) => {
    if (data.label && !showingCongrats) {

      let confidencePercent = data.confidence * 100;
      let expectedClass = wordClassMap[targetWord];

      if (
        data.label === expectedClass &&
        confidencePercent >= 90 &&
        !detectedCorrect
      ) {
        detectedCorrect = true;
        switchTimer = millis();
        score++;  
      }
    }
  });
}

function draw() {
  background(20);

  textSize(28);
  textAlign(CENTER, CENTER);

  if (showingCongrats) {
    fill(0, 255, 0);
    text("Congratulations!\nWell Done", width / 2, height / 2);

    if (millis() - congratsTimer > 5000) {
      // after 5 seconds reset everything
      showingCongrats = false;
      score = 0;
      pickNewWord();
    }

    return;
  }

  if (detectedCorrect) {
    fill(0, 255, 0);
  } else {
    fill(255);
  }

  text(targetWord, width / 2, height / 2);

  if (detectedCorrect && millis() - switchTimer > switchDelay) {

    if (score >= 3) {
      showCongratulations();
    } else {
      pickNewWord();
    }
  }
}

function pickNewWord() {
  let newWord = targetWord;

  while (newWord === targetWord) {
    newWord = random(words);
  }

  targetWord = newWord;
  detectedCorrect = false;

  bridge.send('device_1', targetWord + '\n');
}

function showCongratulations() {
  showingCongrats = true;
  congratsTimer = millis();

  bridge.send('device_1', 'Congratulations\n');
  bridge.send('device_1', 'See You Tomorrow\n');
}
