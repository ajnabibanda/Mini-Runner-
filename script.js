const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');

const width = canvas.width;
const height = canvas.height;
const floorY = height - 60;

const player = {
  x: 100,
  y: floorY - 40,
  width: 34,
  height: 34,
  vy: 0,
  gravity: 0.9,
  jumpStrength: -16,
  grounded: true,
};

const obstacles = [];
let speed = 6;
let spawnTimer = 0;
let score = 0;
let running = false;
let gameOver = false;
let lastTime = 0;

function resetGame() {
  obstacles.length = 0;
  speed = 6;
  spawnTimer = 0;
  score = 0;
  gameOver = false;
  player.y = floorY - player.height;
  player.vy = 0;
  player.grounded = true;
  statusEl.textContent = 'Running...';
}

function spawnObstacle() {
  const size = 24 + Math.random() * 32;
  const gap = 180 + Math.random() * 120;
  obstacles.push({
    x: width + 20,
    y: floorY - size,
    width: size,
    height: size,
  });
  spawnTimer = 80 + Math.floor(Math.random() * 50);
}

function update(delta) {
  if (!running) return;
  if (gameOver) return;

  score += delta * 0.01;
  scoreEl.textContent = Math.floor(score);

  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y + player.height >= floorY) {
    player.y = floorY - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  spawnTimer -= 1;
  if (spawnTimer <= 0) spawnObstacle();

  obstacles.forEach((obs) => {
    obs.x -= speed;
  });

  while (obstacles.length && obstacles[0].x + obstacles[0].width < -20) {
    obstacles.shift();
  }

  if (score > 200) speed = 7;
  if (score > 500) speed = 8;
  if (score > 900) speed = 9;

  if (checkCollision()) {
    gameOver = true;
    statusEl.textContent = 'Game over. Press space to restart.';
  }
}

function checkCollision() {
  return obstacles.some((obs) => {
    return (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    );
  });
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#272727';
  ctx.fillRect(0, floorY, width, height - floorY);

  ctx.fillStyle = '#76c7ff';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#ff6b6b';
  obstacles.forEach((obs) => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(i * 150 + ((performance.now() / 15) % 150), floorY + 2, 100, 4);
  }

  if (!running) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f5f5f5';
    ctx.font = '22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press Space or Up to start', width / 2, height / 2);
  }
}

function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    if (!running) {
      running = true;
      resetGame();
      return;
    }

    if (gameOver) {
      resetGame();
      return;
    }

    if (player.grounded) {
      player.vy = player.jumpStrength;
      player.grounded = false;
    }
  }
});

requestAnimationFrame(loop);
