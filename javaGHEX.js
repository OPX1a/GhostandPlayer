const player = document.getElementById('player');
const ghost = document.getElementById('ghost');
const timerDisplay = document.getElementById('timer');
const gameOverScreen = document.getElementById('game-over-screen');
const finalTimeDisplay = document.getElementById('final-time');

const MIN_X = 0;
const MAX_X = 400;
const MIN_Y = 0;
const MAX_Y = 400;

const MOVE_SPEED = 50;
const BASE_GHOST_SPEED = 1.3;
let GHOST_SPEED = BASE_GHOST_SPEED;
const HIT_DISTANCE = 25; 

let playerX = 200;
let playerY = 200;
let playerZ = 0;  
let jumpVelocity = 0;
let isJumping = false;
let isGameOver = false;
const gravity = 1.2;

let ghostX = 0;
let ghostY = 0;

let startTime = Date.now();
let survivalTime = 0;

const PROPS = [
    [100,100,'🎃',1],[300,100,'🎃',1],[100,300,'🎃',1],[300,300,'🎃',1],
    [200,50,'🌲',1],[50,250,'🌲',1],[350,200,'🌲',1],[200,350,'🏚️',1],
    [150,200,'🪦',1],[250,150,'🪦',1],[350,50,'🏚️',1],[50,150,'🎃',1],
    [0,0,'🕸️',0],[400,0,'🕸️',0],[400,400,'🕸️',0],[0,400,'🕸️',0],
    [150,50,'🕯️',0],[350,350,'💀',0],[250,300,'🧹',0],[50,350,'🕯️',0],[300,200,'🧙',0]
];
const propsEl = document.getElementById('props');
const fogEl = document.getElementById('fog');
PROPS.forEach(([x,y,e]) => {
    const s = document.createElement('span');
    s.className = 'prop';
    s.textContent = e;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    propsEl.appendChild(s);
});

const candiesEl = document.getElementById('candies');
const candyCountEl = document.getElementById('candy-count');
const finalCandyEl = document.getElementById('final-candy');
const CANDY = ['🍬','🍭','🍫','🍪'];
let candyCount = 0, candyX = -1, candyY = -1;
function spawnCandy() {
    let x, y;
    do {
        x = Math.floor(Math.random() * 9) * 50;
        y = Math.floor(Math.random() * 9) * 50;
    } while ((x === playerX && y === playerY) || PROPS.some(([px, py]) => px === x && py === y));
    candyX = x; candyY = y;
    candiesEl.innerHTML = '';
    const s = document.createElement('span');
    s.className = 'prop candy';
    s.textContent = CANDY[Math.floor(Math.random() * CANDY.length)];
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    candiesEl.appendChild(s);
}
function checkCandy() {
    if (playerX === candyX && playerY === candyY) {
        candyCount++;
        candyCountEl.textContent = candyCount;
        GHOST_SPEED = BASE_GHOST_SPEED + candyCount * 0.06;
        spawnCandy();
    }
}
spawnCandy();

function isBlocked(x, y) {
    if (isJumping) return false;
    return PROPS.some(([px, py, , solid]) => solid && px === x && py === y);
}
function tryMove(nx, ny) {
    if (isGameOver || isBlocked(nx, ny)) return;
    playerX = nx; playerY = ny;
    updatePlayerPosition();
    checkCandy();
}

const lightningEl = document.querySelector('.lightning');
(function storm() {
    setTimeout(() => {
        lightningEl.classList.add('flash');
        setTimeout(() => lightningEl.classList.remove('flash'), 180);
        storm();
    }, 4000 + Math.random() * 8000);
})();

function updatePlayerPosition() {
    fogEl.style.setProperty('--px', (playerX + 22) + 'px');
    fogEl.style.setProperty('--py', (playerY + 22) + 'px');
    player.style.left = playerX + 'px';
    player.style.top = (playerY - playerZ) + 'px';
}

function updateGhostPosition() {
    ghost.style.left = ghostX + 'px';
    ghost.style.top = ghostY + 'px';
}

function moveTop() {
    if (isGameOver) return;
    tryMove(playerX, Math.max(MIN_Y, playerY - MOVE_SPEED));
}

function moveDown() {
    if (isGameOver) return;
    tryMove(playerX, Math.min(MAX_Y, playerY + MOVE_SPEED));
}

function moveLeft() {
    if (isGameOver) return;
    tryMove(Math.max(MIN_X, playerX - MOVE_SPEED), playerY);
}

function moveRight() {
    if (isGameOver) return;
    tryMove(Math.min(MAX_X, playerX + MOVE_SPEED), playerY);
}

function jump() {
    if (!isJumping && !isGameOver) {
        isJumping = true;
        jumpVelocity = 18; 
    }
}

window.addEventListener('keydown', (event) => {
    if (isGameOver) return;

    const key = event.key.toLowerCase();
    
    if (key === 'w' || key === 'arrowup') moveTop();
    if (key === 's' || key === 'arrowdown') moveDown();
    if (key === 'a' || key === 'arrowleft') moveLeft();
    if (key === 'd' || key === 'arrowright') moveRight();
    if (event.code === 'Space') {
        event.preventDefault();
        jump();
    }
});

function restartGame() {
    isGameOver = false;
    playerX = 200;
    playerY = 200;
    playerZ = 0;
    ghostX = 0;
    ghostY = 0;
    isJumping = false;
    startTime = Date.now();
    candyCount = 0;
    candyCountEl.textContent = 0;
    GHOST_SPEED = BASE_GHOST_SPEED;
    spawnCandy();
    
    gameOverScreen.classList.add('hidden');
    updatePlayerPosition();
    updateGhostPosition();
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (isGameOver) return;

    survivalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    timerDisplay.textContent = survivalTime;

    const dx = playerX - ghostX;
    const dy = playerY - ghostY;
    const distance = Math.hypot(dx, dy);

    if (distance < HIT_DISTANCE && playerZ < 20) {
        isGameOver = true;
        finalTimeDisplay.textContent = survivalTime;
        finalCandyEl.textContent = candyCount;
        gameOverScreen.classList.remove('hidden');
        return;
    }

    if (distance > 1) {
        ghostX += (dx / distance) * GHOST_SPEED;
        ghostY += (dy / distance) * GHOST_SPEED;
        updateGhostPosition();
    }

    if (isJumping) {
        playerZ += jumpVelocity;
        jumpVelocity -= gravity; 

        if (playerZ <= 0) {
            playerZ = 0;
            isJumping = false;
            jumpVelocity = 0;
        }
        updatePlayerPosition();
    }

    requestAnimationFrame(gameLoop);
}

updatePlayerPosition();
updateGhostPosition();
gameLoop();