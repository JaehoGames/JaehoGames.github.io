// main.js
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc,
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- DOM Elements ---
const lobby = document.getElementById('lobby');
const message = document.getElementById('message');

// Views
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const userInfoView = document.getElementById('user-info');

// View switchers
const showRegisterLink = document.getElementById('show-register-view');
const showLoginLink = document.getElementById('show-login-view');

// Login Form
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

// Register Form
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerNicknameInput = document.getElementById('register-nickname');
const registerButton = document.getElementById('register-button');

// User Info
const userNicknameSpan = document.getElementById('user-nickname');
const playButton = document.getElementById('play-button');
const logoutButton = document.getElementById('logout-button');

// Game Elements
const canvas = document.getElementById('game-canvas');
const joystickContainer = document.getElementById('joystick-container');
const joystick = document.getElementById('joystick-stick');
const joystickBase = document.getElementById('joystick-base');
const rotateWarning = document.getElementById('rotate-warning');

// --- View Switching Logic ---
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    message.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    message.textContent = '';
});


// --- Auth Logic ---
function handleAuthError(error) {
    console.error("Authentication Error:", error.code, error.message);
    switch (error.code) {
        case 'auth/email-already-in-use':
            message.textContent = '이미 사용 중인 이메일입니다.';
            break;
        case 'auth/weak-password':
            message.textContent = '비밀번호는 6자리 이상이어야 합니다.';
            break;
        case 'auth/invalid-email':
            message.textContent = '잘못된 이메일 형식입니다.';
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            message.textContent = '아이디 또는 비밀번호가 일치하지 않습니다.';
            break;
        default:
            message.textContent = '오류가 발생했습니다: ' + error.message;
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in, get user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userNicknameSpan.textContent = userData.nickname;
        } else {
            // This case should not happen if registration is correct
            userNicknameSpan.textContent = '사용자'; 
        }

        // Show user info and hide auth forms
        loginView.classList.add('hidden');
        registerView.classList.add('hidden');
        userInfoView.classList.remove('hidden');
        message.textContent = '';

    } else {
        // User is signed out
        userInfoView.classList.add('hidden');
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
        message.textContent = '';
        // Ensure game is hidden if user logs out
        if (gameRunning) {
            gameRunning = false;
            lobby.classList.remove('hidden');
            canvas.classList.add('hidden');
            joystickContainer.classList.add('hidden');
        }
    }
});

registerButton.addEventListener('click', async () => {
    const username = registerUsernameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    const nickname = registerNicknameInput.value.trim();

    // --- Validation ---
    if (!username || !email || !password || !nickname) {
        message.textContent = '모든 필드를 입력해주세요.';
        return;
    }
    if (/\s/.test(username)) {
        message.textContent = '아이디에는 공백을 포함할 수 없습니다.';
        return;
    }
    if (username.length < 4) {
        message.textContent = '아이디는 4자 이상이어야 합니다.';
        return;
    }
    if (nickname.length < 2) {
        message.textContent = '닉네임은 2자 이상이어야 합니다.';
        return;
    }

    message.textContent = '회원가입 중...';

    try {
        // 1. Check if username is already taken
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            message.textContent = '이미 사용 중인 아이디입니다.';
            return;
        }

        // 2. Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Save user data (username, nickname, email) to Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            nickname: nickname,
            email: email
        });

        message.textContent = '회원가입 성공! 자동으로 로그인됩니다.';
        // onAuthStateChanged will handle the rest

    } catch (error) {
        handleAuthError(error);
    }
});

loginButton.addEventListener('click', async () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;

    if (!username || !password) {
        message.textContent = '아이디와 비밀번호를 입력해주세요.';
        return;
    }

    message.textContent = '로그인 중...';

    try {
        // 1. Find user by username in Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            message.textContent = '존재하지 않는 아이디입니다.';
            return;
        }

        // 2. Get the user's email
        const userData = querySnapshot.docs[0].data();
        const email = userData.email;

        // 3. Sign in with the retrieved email and provided password
        await signInWithEmailAndPassword(auth, email, password);
        
        // onAuthStateChanged will handle the UI update

    } catch (error) {
        handleAuthError(error);
    }
});

logoutButton.addEventListener('click', () => {
    signOut(auth);
});


playButton.addEventListener('click', async () => {
    message.textContent = '게임을 시작합니다.';
    await startGame();
});


// --- Canvas & Game Context ---
const ctx = canvas.getContext('2d');
const TILE_SIZE = 16;

// --- Map Data ---
// 타일셋과 맵을 직접 만드실 수 있도록 레이어 구조로 변경했습니다.
// 아래는 예시 데이터입니다. 직접 만드신 타일셋에 맞춰 이 숫자들을 수정하세요.
// 예시 타일 ID: 0=잔디, 1=물, 2=흙, 10=나무, 11=바위
const tileNames = {
    0: '잔디',
    1: '물',
    2: '흙',
    10: '나무',
    11: '바위'
};

// GroundLayer: 바닥 지형을 정의합니다.
const groundLayer = [
    [0, 0, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// ObjectLayer: 지형 위에 올라갈 사물들을 정의합니다. 0은 '빈 공간'을 의미합니다.
const objectLayer = [
    [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 11, 0, 0, 0, 0, 0, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// CollisionLayer: 플레이어가 통과할 수 없는 지역을 1로 정의합니다. (눈에 보이지 않음)
// 직접 맵을 수정하실 때, 이 배열도 함께 수정해야 합니다.
const collisionLayer = [
    [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 흙(2)도 충돌처리
    [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 흙(2)도 충돌처리
    [0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];


// --- Tileset ---
// 타일셋 이미지가 가로로 몇 개의 타일로 이루어져 있는지 설정합니다.
// 예를 들어, 256px 너비의 이미지에 16px 타일이 있다면 256 / 16 = 16 입니다.
const TILESET_COLS = 16; 
const tileset = new Image();
tileset.src = 'assets/images/tileset.png'; // 존재하지 않는 파일로 설정하면 텍스트가 보입니다.
let tilesetLoaded = false;
tileset.onload = () => { tilesetLoaded = true; };
// 이미지 로딩 실패 시 에러 핸들러 추가
tileset.onerror = () => { 
    console.log("타일셋 이미지를 불러올 수 없습니다. 텍스트 모드로 렌더링합니다.");
    tilesetLoaded = false; 
};


// --- Player, Input & Joystick State ---
const playerState = { 
    x: 100, y: 100, speed: 2, width: 16, height: 16,
    joystick_dx: 0, joystick_dy: 0,
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false }
};
let joystickActive = false, joystickStartX = 0, joystickStartY = 0;
let baseRect, maxRadius;
let gameRunning = false;


// --- Orientation Check ---
function checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        // Portrait mode
        rotateWarning.classList.remove('hidden');
        if (gameRunning) {
            canvas.classList.add('hidden');
            joystickContainer.classList.add('hidden');
        }
    } else {
        // Landscape mode
        rotateWarning.classList.add('hidden');
        if (gameRunning) {
            canvas.classList.remove('hidden');
            joystickContainer.classList.remove('hidden');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
}

// --- Game Logic ---
async function startGame() {
    lobby.classList.add('hidden');
    gameRunning = true;
    
    checkOrientation(); // Initial check

    try {
        await document.documentElement.requestFullscreen();
    } catch (err) {
        console.error("Fullscreen failed:", err);
    }
    
    playerState.x = window.innerWidth / 2;
    playerState.y = window.innerHeight / 2;
    setupJoystick();
    
    // 타일셋이 로드되지 않아도 게임 루프를 시작하도록 변경
    requestAnimationFrame(gameLoop);
}

function drawTile(tileValue, x, y) {
    if (tilesetLoaded) {
        const sx = (tileValue % TILESET_COLS) * TILE_SIZE;
        const sy = Math.floor(tileValue / TILESET_COLS) * TILE_SIZE;
        ctx.drawImage(tileset, sx, sy, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
    } else {
        // Fallback to drawing text
        const tileName = tileNames[tileValue];
        
        // 타일 배경 그리기
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        
        if (tileName) {
            ctx.fillStyle = 'white';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tileName, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }
    }
}

function drawMap() {
    // 1. Draw Ground Layer
    for (let row = 0; row < groundLayer.length; row++) {
        for (let col = 0; col < groundLayer[row].length; col++) {
            const tileValue = groundLayer[row][col];
            drawTile(tileValue, col * TILE_SIZE, row * TILE_SIZE);
        }
    }

    // 2. Draw Object Layer on top
    for (let row = 0; row < objectLayer.length; row++) {
        for (let col = 0; col < objectLayer[row].length; col++) {
            const tileValue = objectLayer[row][col];
            if (tileValue !== 0) {
                drawTile(tileValue, col * TILE_SIZE, row * TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(playerState.x, playerState.y, playerState.width, playerState.height);
}

function isColliding(x, y) {
    // Helper function to check a single point
    const isSolid = (px, py) => {
        const tileX = Math.floor(px / TILE_SIZE);
        const tileY = Math.floor(py / TILE_SIZE);
        // Check map boundaries
        if (tileY < 0 || tileY >= collisionLayer.length || tileX < 0 || tileX >= collisionLayer[0].length) {
            return true; // Treat out-of-bounds as solid
        }
        return collisionLayer[tileY][tileX] === 1;
    };

    // Check the four corners of the player's bounding box
    const topLeft = isSolid(x, y);
    const topRight = isSolid(x + playerState.width - 1, y);
    const bottomLeft = isSolid(x, y + playerState.height - 1);
    const bottomRight = isSolid(x + playerState.width - 1, y + playerState.height - 1);

    return topLeft || topRight || bottomLeft || bottomRight;
}

function gameLoop() {
    if (!gameRunning || window.innerHeight > window.innerWidth) {
        requestAnimationFrame(gameLoop);
        return; // Don't run game logic if paused or in portrait
    }

    let dx = 0, dy = 0;
    if (playerState.keys.ArrowUp) dy -= 1;
    if (playerState.keys.ArrowDown) dy += 1;
    if (playerState.keys.ArrowLeft) dx -= 1;
    if (playerState.keys.ArrowRight) dx += 1;

    if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length);
        dy = (dy / length);
    }

    if (playerState.joystick_dx !== 0 || playerState.joystick_dy !== 0) {
        dx = playerState.joystick_dx;
        dy = playerState.joystick_dy;
    }

    // --- New Movement and Collision Logic ---
    const currentX = playerState.x;
    const currentY = playerState.y;

    const nextX = currentX + dx * playerState.speed;
    const nextY = currentY + dy * playerState.speed;

    // Handle X-axis movement and collision
    if (dx !== 0) {
        if (!isColliding(nextX, currentY)) {
            playerState.x = nextX;
        }
    }

    // Handle Y-axis movement and collision
    if (dy !== 0) {
        // Check collision at the potentially updated X position to allow better cornering
        if (!isColliding(playerState.x, nextY)) {
            playerState.y = nextY;
        }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

// --- Input Handlers ---
function setupJoystick() {
    baseRect = joystickBase.getBoundingClientRect();
    maxRadius = baseRect.width / 2 - joystick.offsetWidth / 2;
}

function handleTouchStart(e) { e.preventDefault(); joystickActive = true; joystick.style.transition = '0s'; const touch = e.changedTouches[0]; joystickStartX = touch.clientX; joystickStartY = touch.clientY; }
function handleTouchMove(e) {
    e.preventDefault();
    if (!joystickActive) return;
    const touch = e.changedTouches[0];
    let moveX = touch.clientX - joystickStartX;
    let moveY = touch.clientY - joystickStartY;
    const distance = Math.sqrt(moveX * moveX + moveY * moveY);
    if (distance > maxRadius) { moveX = (moveX / distance) * maxRadius; moveY = (moveY / distance) * maxRadius; }
    joystick.style.transform = `translate(${moveX}px, ${moveY}px)`;
    const angle = Math.atan2(moveY, moveX);
    playerState.joystick_dx = (distance < 10) ? 0 : Math.cos(angle);
    playerState.joystick_dy = (distance < 10) ? 0 : Math.sin(angle);
}
function handleTouchEnd(e) { e.preventDefault(); if (!joystickActive) return; joystickActive = false; joystick.style.transition = '0.2s'; joystick.style.transform = `translate(0px, 0px)`; playerState.joystick_dx = 0; playerState.joystick_dy = 0; }
function handleKeyDown(e) { if (playerState.keys.hasOwnProperty(e.key)) { e.preventDefault(); playerState.keys[e.key] = true; } }
function handleKeyUp(e) { if (playerState.keys.hasOwnProperty(e.key)) { e.preventDefault(); playerState.keys[e.key] = false; } }

// Add all listeners
joystick.addEventListener('touchstart', handleTouchStart, { passive: false });
window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('touchend', handleTouchEnd, { passive: false });
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', checkOrientation); // Check orientation on resize