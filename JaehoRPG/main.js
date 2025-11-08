const player = document.getElementById('player');
const joystick = document.getElementById('joystick-stick');
const joystickBase = document.getElementById('joystick-base');
const lobby = document.getElementById('lobby');
const playButton = document.getElementById('play-button');
const gameWorld = document.getElementById('game-world');
const joystickContainer = document.getElementById('joystick-container');

const playerState = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    speed: 5,
    dx: 0,
    dy: 0
};

let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;

let baseRect, baseCenterX, baseCenterY, maxRadius;

function setupJoystick() {
    baseRect = joystickBase.getBoundingClientRect();
    baseCenterX = baseRect.left + baseRect.width / 2;
    baseCenterY = baseRect.top + baseRect.height / 2;
    maxRadius = baseRect.width / 2 - joystick.offsetWidth / 2;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickActive = true;
    joystick.style.transition = '0s';
    joystickStartX = touch.clientX;
    joystickStartY = touch.clientY;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!joystickActive) return;

    const touch = e.changedTouches[0];
    let moveX = touch.clientX - joystickStartX;
    let moveY = touch.clientY - joystickStartY;

    const distance = Math.sqrt(moveX * moveX + moveY * moveY);

    if (distance > maxRadius) {
        moveX = (moveX / distance) * maxRadius;
        moveY = (moveY / distance) * maxRadius;
    }

    joystick.style.transform = `translate(${moveX}px, ${moveY}px)`;

    const angle = Math.atan2(moveY, moveX);
    playerState.dx = Math.cos(angle);
    playerState.dy = Math.sin(angle);
    
    if (distance < 10) {
        playerState.dx = 0;
        playerState.dy = 0;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!joystickActive) return;

    joystickActive = false;
    joystick.style.transition = '0.2s';
    joystick.style.transform = `translate(0px, 0px)`;

    playerState.dx = 0;
    playerState.dy = 0;
}

function gameLoop() {
    if (playerState.dx !== 0 || playerState.dy !== 0) {
        playerState.x += playerState.dx * playerState.speed;
        playerState.y += playerState.dy * playerState.speed;

        player.style.left = `${playerState.x}px`;
        player.style.top = `${playerState.y}px`;
    }

    requestAnimationFrame(gameLoop);
}

async function startGame() {
    lobby.classList.add('hidden');
    gameWorld.classList.remove('hidden');
    joystickContainer.classList.remove('hidden');

    try {
        await document.documentElement.requestFullscreen();
        await screen.orientation.lock('landscape');
    } catch (err) {
        console.error("전체 화면 또는 가로 모드 설정에 실패했습니다:", err);
    }
    
    // Recalculate joystick position after screen orientation change
    setTimeout(() => {
        setupJoystick();
        // Adjust player position for new screen dimensions
        playerState.x = window.innerWidth / 2;
        playerState.y = window.innerHeight / 2;

        joystick.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });

        requestAnimationFrame(gameLoop);
    }, 100); // Delay to allow screen to rotate
}

playButton.addEventListener('click', startGame);