let percentile = 25 / 5000;
let mutationRate = 0.1;
let generationSize = 5000;
let p = new population([24, 18, 18, 4], generationSize, mutationRate, percentile);
p.maxMutation = 5;

let networkOutput = [];
let startingDate;

let showDebug = false;
let networkViewEnabled = false;

// AI
function play() {
  // let direction = 90;
  let input = [];
  let data = [];
  let tailData = [];
  for (let direction = 0; direction < 360; direction += 45) {
    data.push({
      boundary: null,
      food: null,
      tail: null
    });
    let foundTail = false;
    for (let i = 1; i <= resolution * sqrt(2); i++) {
      let cellX = snake.head.x + round(sin(direction)) * i;
      let cellY = snake.head.y + round(cos(direction)) * i;
      push();
      noStroke();
      if (showDebug) {
        fill(255, 255, 255, 20);
        drawCell({
          x: cellX,
          y: cellY
        });
      }

      //Boundaries
      if ((cellX == -1 && cellY < resolution && cellY >= -1) || (cellX == resolution && cellY < resolution && cellY >= -1) || (cellY == -1 && cellX < resolution && cellX >= -1) || (cellY == resolution && cellX < resolution && cellX >= -1)) {
        data[direction / 45].boundary = dist(snake.head.x, snake.head.y, cellX, cellY);
        if (showDebug) {
          fill(255, 165, 0, 255);
          drawCell({
            x: cellX,
            y: cellY
          });
        }
      }

      //Food
      if (cellX == food.x && cellY == food.y) {
        data[direction / 45].food = dist(snake.head.x, snake.head.y, cellX, cellY);
        if (showDebug) {
          fill(165, 255, 0, 255);
          drawCell({
            x: cellX,
            y: cellY
          });
        }
      }

      //Tail
      for (let j = 0; j < snake.body.length; j++) {
        // console.log(snake.body[i].x, snake.body[i].y);
        if (cellX == snake.body[j].x && cellY == snake.body[j].y && foundTail == false) {
          data[direction / 45].tail = dist(snake.head.x, snake.head.y, cellX, cellY);
          if (showDebug) {
            fill(165, 255, 0);
            drawCell({
              x: cellX,
              y: cellY
            });
            foundTail = true;
          }
        }
      }
      pop();
    }
  }

  for (let i in data) {
    if (data[i].boundary) input.push(data[i].boundary);
    else input.push(0);
    if (data[i].food) input.push(data[i].food);
    else input.push(0);
    if (data[i].tail) input.push(data[i].tail);
    else input.push(0);
  }
  let net = p.getCurrentNetwork();
  networkOutput = net.feed(input);
  let i = networkOutput.indexOf(Math.max(...networkOutput));
  switch (i) {
    case 0:
      goUp();
      break;
    case 1:
      goDown();
      break;
    case 2:
      goLeft();
      break;
    case 3:
      goRight();
      break;
  }
  aiOverlay();
  // if (p.network == 0) aiOverlay();
  // else {
  //   push();
  //   background(0);
  //   translate(width/2, height/2);
  //   textSize(64);
  //   fill(255);
  //   stroke(255);
  //   strokeWeight(1);
  //   textAlign(CENTER);
  //   text(p.network + " / " + p.size, 0, -height / 2 + 100);
  //   let gen = (p.generation == 0 ? 'P' : `F${p.generation}`);
  //   text(gen + " generation", 0, -height / 2 + 200);
  //
  //   push();
  //   textSize(32);
  //   fill(255);
  //   stroke(255);
  //   strokeWeight(1);
  //
  //   text("highscore:      " + highscore, 0, 0);
  //   text("max lifetime:   " + maxLifeTime, 0, 50);
  //   text("max fitness:  " + maxFitness, 0, 100);
  //   text("mutation rate:   " + mutationRate, 0, 150);
  //   pop();
  //   pop();
  // }
}

// Events
let maxFitness = 0;
function aiLost() {
  if (p.network == generationSize - 1) {
    genFoodList();
    // cycleFinished = true;
    // p.selectBestNetwork();
    // showing = true;
  }
  let fitness = lifeTime + score * 1000;
  p.population[p.network].fitness = fitness;
  if (fitness > maxFitness) maxFitness = fitness;
  p.cycle();
  start();
}

// Draw Functions
function drawNetwork() {
  push();
  fill(255);
  noStroke();
  for (let i in p.structure) {
    for (let j = 0; j < p.structure[i]; j++) {
      let x = 60 * i - size - 250;
      let y = (j - p.structure[i] / 2) * 24;
      if (i != 0) {
        strokeWeight(1);
        // stroke(255, 0, 255);

        for (let k = 0; k < p.structure[i - 1]; k++) {
          let prevx = 60 * (i - 1) - size - 250;
          let prevy = (k - p.structure[i - 1] / 2) * 24;
          let w = p.getCurrentNetwork().getWeight(p.getCurrentNetwork().getNeuron(i - 1, k), p.getCurrentNetwork().getNeuron(i, j));
          // if (w > 0) stroke(0, 50, 255);
          // else stroke(255, 50, 0);

          let r = map(w, -2, 2, 255, 0);
          let g = map(w, -2, 2, 0, 0);
          let b = map(w, -2, 2, 0, 255);
          let a = map(abs(w), 0, 1, 0, 255);
          stroke(r, g, b, a);

          line(x, y, prevx, prevy);
        }
      }
    }
  }
  for (let i in p.structure) {
    for (let j = 0; j < p.structure[i]; j++) {
      let neuron = p.getCurrentNetwork().getNeuron(i, j);

      let x = 60 * i - size - 250;
      let y = (j - p.structure[i] / 2) * 24;
      noStroke();

      // let m = map(neuron.activation, 0, 1, 0, 255);
      let r = map(neuron.activation, 0, 1, 255, 0);
      let g = map(neuron.activation, 0, 1, 255, 255);
      let b = map(neuron.activation, 0, 1, 255, 0);
      fill(r, g, b);

      // if (i == p.structure.length - 1 && j == lastMove) {
      //   fill(0, 255, 0);
      // } else {
      //   fill(255);
      // }

      if (i == p.structure.length - 1) {
        textSize(12);
        text(round(networkOutput[j] * 10000) / 10000, x + 10, y + 4);
      }
      ellipse(x, y, 12);
    }
  }
  pop();
}

function aiOverlay() {
  push();
  textSize(64);
  fill(255);
  stroke(255);
  strokeWeight(1);
  textAlign(CENTER);
  text("AI Learns to play Snake", 0, -height / 2 + 100);
  let now = new Date();
  let d = now - startingDate;
  let seconds = d / 1000;
  let mins = seconds / 60;
  let hours = mins / 60;
  let string = `${(floor(hours) >= 10) ? `${floor(hours)}` : (`0${floor(hours)}`)}:${(floor(mins)%60 >= 10) ? `${floor(mins)%60}` : `0${floor(mins)%60}`}:${(floor(seconds)%60 >= 10) ? `${floor(seconds)%60}` : `0${floor(seconds)%60}`}`;
  // let date = new Date(d / 1000);
  // date.setSeconds(d / 1000);
  text(string, 0, size / 2 + 80);
  // textSize(32);
  // text("Press [enter] to try again", 0, 256);
  pop();
  push();
  textSize(24);
  text("Press [SPACEBAR] to toggle network view", -width*0.5 + 20, size / 2 + 80)
  pop();
  push();
  textSize(32);
  fill(255);
  stroke(255);
  strokeWeight(1);
  text("generation:   " + (p.generation + 1), -size / 2 - 250, -size / 2 + 50);
  text("network:      " + (p.network + 1), -size / 2 - 250, -size / 2 + 100);

  text("highscore:      " + highscore, size / 2 + 50, -size / 2 + 100);
  text("max fitness:  " + maxFitness, size / 2 + 50, -size / 2 + 150);

  text("lifetime:       " + lifeTime, size / 2 + 50, size / 2 - 50);
  text("max lifetime:   " + maxLifeTime, size / 2 + 50, size / 2);

  text("mutation rate:   " + mutationRate, -size / 2 - 250, size / 2);
  text("moves left:      " + movesLeft, -size / 2 - 250, size / 2 - 50);
  pop();
  if (networkViewEnabled) drawNetwork();
}
