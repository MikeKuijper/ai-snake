let canvas;
let foodList = [];
let lifeTime = 0;
let highscore = 0;
let maxLifeTime = 0;
let playerLost = false;
let food = {
  x: 24,
  y: 16
}
let snake = {
  head: {
    x: 8,
    y: 16
  },
  direction: 90,
  body: [{
    x: 7,
    y: 16,
  }]
}

let size = 512;
let paused = false;
let playAI = true;
let resolution = 32;
let score = 0;
let movesLeft = 300;
let reward = 150;

let safeturn = true;

let font;

// p5.js Functions
function preload() {
  font = loadFont('assets/font.ttf');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  textFont(font);
  // newFood();
  startingDate = new Date();
  genFoodList();
  start();
  noCursor();
  paused = true;
  if (!playAI) frameRate(10);
}

function draw() {
  if (frameCount == 10) {
    paused = false;
    startingDate = new Date();
  }

  let notEaten = true;
  angleMode(DEGREES);
  if (!paused) background(0);

  // if (p.network == 0) {
  if (networkViewEnabled) translate(width / 2 + size / 4, height / 2);
  else translate(width / 2, height / 2);

  noFill();
  stroke(255);
  strokeWeight(1);

  rect(-size / 2 - 0.5, -size / 2 - 0.5, size + 1, size + 1);

  noStroke();
  fill(255, 0, 0);

  if (!paused) {
    drawCell(food);
    drawSnake();
    drawScore();
    // drawGrid();
  }
  // }

  // for (let i = 0; i < 5; i++) {
  // if (p.network == 0) {
  //   i = 10;
  //   frameRate(20);
  // } else {
  //   frameRate(60);
  // }

  if (snake.head.x == food.x && snake.head.y == food.y) {
    notEaten = false;
    score++;
    newFood();
    movesLeft += reward;
  }
  if (snake.head.x == resolution || snake.head.y == resolution || snake.head.x == -1 || snake.head.y == -1) {
    lost();
  }
  for (let i in snake.body) {
    let current = snake.body[i];
    if (snake.head.x == current.x && snake.head.y == current.y) {
      lost();
    }
  }

  if (!paused) {
    if (playAI) play();
    snake.body.push({
      x: snake.head.x,
      y: snake.head.y
    });
    snake.head.x += round(cos(snake.direction - 90));
    snake.head.y += round(sin(snake.direction - 90));
    if (notEaten) snake.body.shift();
    movesLeft--;
    lifeTime++;
    if (movesLeft <= 0) lost();
  }
  // }
}

let lastFrame = -1;
lastMove = null;

// Directions
function goLeft() {
  if (safeturn) {
    if (snake.direction != 90) {
      snake.direction = 270;
      lastMove = 2;
    }
  } else {
    snake.direction = 270;
  }
}

function goRight() {
  if (safeturn) {
    if (snake.direction != 270) {
      snake.direction = 90;
      lastMove = 3;
    }
  } else {
    snake.direction = 90;
  }
}

function goUp() {
  if (safeturn) {
    if (snake.direction != 180) {
      snake.direction = 0;
      lastMove = 0;
    }
  } else {
    snake.direction = 0;
  }
}

function goDown() {
  if (safeturn) {
    if (snake.direction != 0) {
      snake.direction = 180;
      lastMove = 1;
    }
  } else {
    snake.direction = 180;
  }
}

// Draw Functions
function drawSnake() {
  fill(255);
  drawCell(snake.head);
  for (let i in snake.body) {
    drawCell(snake.body[i]);
  }
}

function drawCell(point) {
  rect(-size / 2 + point.x * size / resolution + 1, -size / 2 + point.y * size / resolution + 1, size / resolution - 1, size / resolution - 1);
}

function drawScore() {
  push();
  textSize(32);
  fill(255);
  stroke(255);
  strokeWeight(1);
  text("score:          " + score, size / 2 + 50, -size / 2 + 50);
  pop();
}

function drawFinalScore() {
  push();
  textSize(128);
  fill(255);
  stroke(255);
  strokeWeight(1);
  textAlign(CENTER);
  text("score:     " + score, 0, 0);
  textSize(32);
  text("Press [enter] to try again", 0, 256);
  pop();
}

function drawGrid() {
  noFill();
  stroke(255, 255, 255, 100);
  strokeWeight(1);
  for (let i = 1; i < resolution; i++) {
    line(-size / 2, -size / 2 + i * size / resolution, size / 2, -size / 2 + i * size / resolution);
    line(-size / 2 + i * size / resolution, -size / 2, -size / 2 + i * size / resolution, size / 2);
  }
}

// Events
function lost() {
  background(255, 0, 0);
  drawFinalScore();
  if (!playAI) {
    playerLost = true;
    paused = true;
    noLoop();
  }

  if (score > highscore) highscore = score;
  if (lifeTime > maxLifeTime) maxLifeTime = lifeTime;
  if (playAI) aiLost();
}

function start() {
  movesLeft = 300;
  lifeTime = 0;
  newFood();
  score = 0;
  snake = {
    head: {
      x: 8,
      y: 16
    },
    direction: 90,
    body: [{
      x: 7,
      y: 16,
    }]
  }

  loop();
}

function windowResized() {
  canvas.resize(windowWidth, windowHeight);
}

function keyPressed() {
  console.log(keyCode);
  if (!playAI) {
    if (!playerLost) {
      if (frameCount != lastFrame) {
        switch (keyCode) {
          case UP_ARROW:
            goUp();
            break;
          case DOWN_ARROW:
            goDown();
            break;
          case LEFT_ARROW:
            goLeft();
            break;
          case RIGHT_ARROW:
            goRight();
            break;
          case ENTER:
            paused = true;
            break;
        }
        lastFrame = frameCount;
      }
    } else {
      if (keyCode == ENTER) {
        loop();
        playerLost = false;
        paused = false;
        start();
      }
    }
  } else {
    if (keyCode == ENTER) {
      paused = !paused;
    } else if (keyCode == 32) {
      networkViewEnabled = !networkViewEnabled;
    }
  }
}

// Generate Functions
let offset = 0;

function newFood() {
  if (playAI) {
    if (score + offset == foodList.length) {
      function gen() {
        let x = round(random(0, resolution - 1));
        let y = round(random(0, resolution - 1));

        for (let i in snake.body) {
          if (x == snake.body[i].x && y == snake.body[i].y) {
            gen();
            return;
          }
        }
        foodList.push({
          x: x,
          y: y
        })
      }
      gen();
    }
    for (let i = 0; i < snake.body.length; i++) {
      if (foodList[score + offset].x == snake.body[i].x && foodList[score + offset].y == snake.body[i].y) {
        offset++;
        i = 0;
      }
    }
    food.x = foodList[score + offset].x;
    food.y = foodList[score + offset].y;

  } else {
    food.x = round(random(0, resolution - 1));
    food.y = round(random(0, resolution - 1));
    for (let i in snake.body) {
      if (food.x == snake.body[i].x && food.y == snake.body[i].y) {
        newFood();
      }
    }
  }
}

function genFoodList() {
  console.log("Generating new foodList");
  foodList = [];
  for (let i = 0; i < 100; i++) {
    function gen() {
      let x = round(random(0, resolution - 1));
      let y = round(random(0, resolution - 1));

      // for (let i in snake.body) {
      //   if (x == snake.body[i].x && y == snake.body[i].y) {
      //     gen();
      //     return;
      //   }
      // }
      foodList.push({
        x: x,
        y: y
      })
    }
    gen();
  }
  console.log(foodList);
}
