// js/main.js

// --- 라이브러리 및 설정 임포트 ---
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    doc, setDoc, getDoc, collection, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// 맵 데이터 로딩
import { groundLayer, objectLayer, tileCollisionLayer, objectCollisionLayer } from './map/map-data.js';
import { npcData } from './data/npc-data.js';

// --- DOM 요소 캐싱 (매번 찾으면 느리니까 변수에 저장) ---
const lobby = document.getElementById('lobby');
const message = document.getElementById('message');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const userInfoView = document.getElementById('user-info');

// 폼 전환 링크들
const showRegisterLink = document.getElementById('show-register-view');
const showLoginLink = document.getElementById('show-login-view');

// 입력 필드들
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerNicknameInput = document.getElementById('register-nickname');
const registerButton = document.getElementById('register-button');

// 게임 UI
const userNicknameSpan = document.getElementById('user-nickname');
const playButton = document.getElementById('play-button');
const logoutButton = document.getElementById('logout-button');
const canvas = document.getElementById('game-canvas');
const joystickContainer = document.getElementById('joystick-container');
const joystick = document.getElementById('joystick-stick');
const joystickBase = document.getElementById('joystick-base');
const rotateWarning = document.getElementById('rotate-warning');
const interactionButton = document.getElementById('interaction-button');

// --- UI 이벤트 핸들러 ---

// 회원가입 화면 보여주기
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    message.textContent = '';
});

// 로그인 화면으로 돌아가기
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    message.textContent = '';
});

// --- Firebase 인증 관련 로직 ---

// 에러 메시지를 한글로 예쁘게 변환
function handleAuthError(error) {
    console.error("Auth Error:", error.code, error.message);
    switch (error.code) {
        case 'auth/email-already-in-use': message.textContent = '이미 가입된 이메일입니다.'; break;
        case 'auth/weak-password': message.textContent = '비밀번호가 너무 쉽습니다 (6자리 이상).'; break;
        case 'auth/invalid-email': message.textContent = '이메일 형식이 올바르지 않습니다.'; break;
        case 'auth/user-not-found':
        case 'auth/wrong-password': 
        case 'auth/invalid-login-credentials': message.textContent = '아이디 혹은 비밀번호가 틀렸습니다.'; break;
        default: message.textContent = '알 수 없는 오류: ' + error.message;
    }
}

// 로그인 상태 변화 감지 (새로고침 해도 유지됨)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 로그인 성공 시 DB에서 닉네임 가져오기
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        userNicknameSpan.textContent = userDocSnap.exists() ? userDocSnap.data().nickname : '플레이어';
        
        // 화면 전환: 로비 -> 유저 정보
        loginView.classList.add('hidden');
        registerView.classList.add('hidden');
        userInfoView.classList.remove('hidden');
        message.textContent = '';
    } else {
        // 로그아웃 상태
        userInfoView.classList.add('hidden');
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
        message.textContent = '';
        
        // 게임 중이었다면 강제 종료
        if (gameRunning) {
            gameRunning = false;
            lobby.classList.remove('hidden');
            canvas.classList.add('hidden');
            joystickContainer.classList.add('hidden');
            interactionButton.classList.add('hidden');
            interactionButton.classList.remove('visible');
        }
    }
});

// 회원가입 버튼 클릭
registerButton.addEventListener('click', async () => {
    const username = registerUsernameInput.value.trim();
    let email = registerEmailInput ? registerEmailInput.value.trim() : '';
    const password = registerPasswordInput.value;
    const nickname = registerNicknameInput.value.trim();

    // 유효성 검사
    if (!username || !password || !nickname) { message.textContent = '아이디, 비밀번호, 닉네임은 필수입니다.'; return; }
    if (/\s/.test(username)) { message.textContent = '아이디에 공백은 안됩니다.'; return; }
    if (username.length < 4) { message.textContent = '아이디가 너무 짧아요 (4자 이상).'; return; }
    if (nickname.length < 2) { message.textContent = '닉네임은 두 글자 이상으로 해주세요.'; return; }

    // 이메일이 없으면 아이디 기반으로 생성
    if (!email) {
        email = `${username}@jaehorpg.com`;
    }

    message.textContent = '아이디 중복을 확인하는 중...';
    try {
        // 아이디 중복 체크 (Firestore 조회)
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) { message.textContent = '이미 누가 쓰고 있는 아이디네요.'; return; }
        
        // Firebase Auth 생성
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 추가 정보(닉네임 등) DB 저장
        await setDoc(doc(db, "users", userCredential.user.uid), { username, nickname, email });
        
        message.textContent = '가입 완료! 자동 로그인됩니다.';
    } catch (error) { handleAuthError(error); }
});

// 로그인 버튼 클릭
loginButton.addEventListener('click', async () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;
    
    if (!username || !password) { message.textContent = '아이디와 비밀번호를 입력해주세요.'; return; }

    try {
        let email;
        // 입력값이 이메일 형식인지 간단히 확인
        message.textContent = '아이디를 확인하는 중...'; // DB 조회 직전에 메시지 표시
        if (username.includes('@')) {
            email = username;
        } else {
            // 아이디로 이메일 찾기 (Firebase Auth는 이메일 기반이라서)
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                message.textContent = '없는 아이디입니다.';
                return;
            }
            email = querySnapshot.docs[0].data().email;
        }

        await signInWithEmailAndPassword(auth, email, password);
        // 성공 시 onAuthStateChanged가 화면을 전환하므로 별도 처리가 필요 없음
    } catch (error) { 
        handleAuthError(error); 
    }
});

logoutButton.addEventListener('click', () => { signOut(auth); });

// 플레이 버튼: 게임 시작 진입점
playButton.addEventListener('click', async () => { 
    message.textContent = '월드에 입장합니다...'; 
    await startGame(); 
});

// --- 게임 렌더링 설정 ---
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // 도트 게임이라 이거 안 끄면 흐릿하게 나옴 (중요!)

const TILE_SIZE = 32; // 기본 타일 크기
let zoomLevel = 4.0; // 확대 배율 (이제 동적으로 변함)
let scaledTileSize = TILE_SIZE * zoomLevel;
let npcs = []; // 게임에서 실제 사용할 NPC 상태 배열 (초기에는 비어있음)

// NPC 데이터로부터 게임 내 NPC 상태를 초기화하는 함수
function initializeNpcs() {
    npcs = npcData.map(data => ({
        ...data, // npc-data.js 에서 가져온 기본 정보 (id, spriteName, x, y, dialogue 등)
        width: data.width || 16, // 기본값 설정
        height: data.height || 16, // 기본값 설정
        // 아래는 애니메이션과 움직임을 위한 상태값들
        direction: 'down',
        isMoving: false,
        frameIndex: 0,
        frameTimer: 0
    }));
    console.log(`${npcs.length}명의 NPC가 월드에 배치되었습니다.`);
}

// --- 동적 줌 레벨 계산 ---
function calculateZoomLevel() {
    // 화면에 가로로 몇 개의 타일을 표시할지 기준을 정합니다. (이 값을 조절해 시야를 바꿀 수 있습니다)
    const desiredTilesHorizontal = 12;
    const baseViewWidth = desiredTilesHorizontal * TILE_SIZE;

    // 현재 캔버스(화면) 너비를 기준으로 줌 레벨을 계산합니다.
    zoomLevel = canvas.width / baseViewWidth;

    // 줌 레벨이 변경되었으므로, 캐시된 이미지들도 다시 만들어야 합니다.
    if (tilesetLoaded) preScaleTiles();
    if (objectTilesetLoaded) preScaleObjectTiles();
}
// 대화창 상태 관리
const dialogueState = {
    isActive: false,
    message: "",
    npc: null
};

// --- 기본 타일셋 로딩 및 캐싱 ---
const TILESET_COLS = 16;
const tileset = new Image();
tileset.src = 'assets/images/tileset.png';

let scaledTileCache = []; // 확대된 타일 이미지를 미리 저장해두는 배열
let tilesetLoaded = false;

// 타일셋 이미지를 미리 확대해서 캐시에 저장하는 함수
function preScaleTiles() {
    console.log("타일셋 로딩 완료. 미리 확대(Pre-scaling) 작업 시작...");
    const tileRows = tileset.height / TILE_SIZE;
    const totalTiles = TILESET_COLS * tileRows;

    // 캐시 배열을 초기화합니다.
    scaledTileCache.length = 0;

    // zoomLevel이 바뀌었으므로, scaledTileSize를 다시 계산합니다.
    scaledTileSize = TILE_SIZE * zoomLevel;

    for (let i = 0; i < totalTiles; i++) {
        // 1. 원본 크기로 한 조각 자르기
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = TILE_SIZE;
        tempCanvas.height = TILE_SIZE;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        
        const sx = (i % TILESET_COLS) * TILE_SIZE;
        const sy = Math.floor(i / TILESET_COLS) * TILE_SIZE;
        tempCtx.drawImage(tileset, sx, sy, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);

        // 2. 확대한 캔버스에 그리기 (매 프레임 확대 연산 안 하려고 미리 함)
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = scaledTileSize;
        scaledCanvas.height = scaledTileSize;
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCtx.imageSmoothingEnabled = false;
        scaledCtx.drawImage(tempCanvas, 0, 0, scaledTileSize, scaledTileSize);
        
        scaledTileCache[i] = scaledCanvas;
    }
    console.log(`${totalTiles}개 타일 캐싱 완료.`);
}

tileset.onload = () => {
    // 처음 로드될 때 한 번 실행
    preScaleTiles();
    tilesetLoaded = true; // 타일 로딩 및 캐싱이 완료되었음을 알림
};
tileset.onerror = () => console.log("타일셋 이미지를 못 찾겠어요.");

// --- 오브젝트 타일셋 & 충돌 마스크 생성 (여기가 중요함) ---
const OBJECT_TILE_SIZE = 64; // 원본 오브젝트 타일 크기
const OBJECT_TILESET_COLS = 16; 
const objectTileset = new Image();
objectTileset.crossOrigin = "Anonymous"; // 로컬/서버 이미지 보안 이슈 방지
objectTileset.src = 'assets/images/objects.png';

let scaledObjectTileCache = []; 
const objectCollisionMasks = []; // 픽셀 충돌 데이터 저장소 (true/false 배열)
let objectTilesetLoaded = false;

// 오브젝트 타일셋을 미리 확대해서 캐시에 저장하는 함수
function preScaleObjectTiles() {
    const tileRows = objectTileset.height / OBJECT_TILE_SIZE;
    const totalTiles = OBJECT_TILESET_COLS * tileRows;

    // 픽셀 데이터 읽기용 임시 캔버스를 함수 스코프에 선언
    let tempCanvas, tempCtx;

    scaledObjectTileCache.length = 0;
    // 인덱스 1부터 시작하도록 항상 0번 인덱스는 비워둡니다.
    scaledObjectTileCache.push(null);

    if (objectCollisionMasks.length === 0) { // 마스크는 한 번만 생성
        objectCollisionMasks.length = 0;
        objectCollisionMasks.push(null);
    }
    
    tempCanvas = document.createElement('canvas');
    tempCanvas.width = OBJECT_TILE_SIZE;
    tempCanvas.height = OBJECT_TILE_SIZE;
    tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true }); // 자주 읽을 거라 최적화 옵션 켬

    for (let i = 0; i < totalTiles; i++) {
        const sx = (i % OBJECT_TILESET_COLS) * OBJECT_TILE_SIZE;
        const sy = Math.floor(i / OBJECT_TILESET_COLS) * OBJECT_TILE_SIZE;

        // 1. 마스크 생성: 투명하지 않은 부분만 '충돌'로 인식
        if (objectCollisionMasks.length < totalTiles + 1) { // 마스크가 아직 생성되지 않았을 때만 (+1은 0번 인덱스 때문)
            tempCtx.clearRect(0, 0, OBJECT_TILE_SIZE, OBJECT_TILE_SIZE);
            tempCtx.drawImage(objectTileset, sx, sy, OBJECT_TILE_SIZE, OBJECT_TILE_SIZE, 0, 0, OBJECT_TILE_SIZE, OBJECT_TILE_SIZE);
            
            const imageData = tempCtx.getImageData(0, 0, OBJECT_TILE_SIZE, OBJECT_TILE_SIZE).data;
            const mask = new Array(OBJECT_TILE_SIZE);

            for (let y = 0; y < OBJECT_TILE_SIZE; y++) {
                const row = [];
                for (let x = 0; x < OBJECT_TILE_SIZE; x++) {
                    // Alpha값(투명도) 체크. 128 이상인 진한 부분만 벽으로 판정
                    const alpha = imageData[(y * OBJECT_TILE_SIZE + x) * 4 + 3];
                    row.push(alpha > 128);
                }
                mask[y] = row;
            }
            objectCollisionMasks.push(mask);
        }

        // 2. 렌더링용 캐시 생성
        const scaledObjectTileSize = OBJECT_TILE_SIZE * zoomLevel;
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = scaledObjectTileSize;
        scaledCanvas.height = scaledObjectTileSize;
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCtx.imageSmoothingEnabled = false;
        
        // tempCanvas를 다시 그릴 필요 없이, 원본 objectTileset에서 직접 그립니다.
        scaledCtx.drawImage(objectTileset, sx, sy, OBJECT_TILE_SIZE, OBJECT_TILE_SIZE, 0, 0, scaledObjectTileSize, scaledObjectTileSize);
        
        scaledObjectTileCache.push(scaledCanvas);
    }
}

objectTileset.onload = () => {
    console.log("오브젝트 로딩 완료. 충돌 마스크 및 캐시 생성 중...");
    preScaleObjectTiles(); // 처음 로드될 때 한 번 실행
    objectTilesetLoaded = true;
    console.log("오브젝트 처리 완료.");
};

objectTileset.onerror = () => console.log("오브젝트 이미지를 못 찾겠어요.");

// --- NPC 에셋 로딩 및 캐싱 ---
const npcAssetCache = {}; // 로드된 NPC 에셋(이미지, json)을 저장하는 곳

async function loadNpcAssets(spriteName) {
    // 이미 로드된 에셋이면 캐시에서 반환
    if (npcAssetCache[spriteName]) {
        return npcAssetCache[spriteName];
    }

    console.log(`NPC 에셋 로딩: ${spriteName}`);
    try {
        const path = `assets/npc/${spriteName}`;
        const sprite = new Image();
        sprite.src = `${path}/texture.png`;
        await sprite.decode(); // 이미지 로딩이 끝날 때까지 기다림

        const [animations, texture] = await Promise.all([
            fetch(`${path}/animations.json`).then(res => res.json()),
            fetch(`${path}/texture.json`).then(res => res.json())
        ]);

        const assets = { sprite, animations, texture, loaded: true };
        npcAssetCache[spriteName] = assets;
        console.log(`NPC 에셋 캐싱 완료: ${spriteName}`);
        return assets;

    } catch (error) {
        console.error(`'${spriteName}' NPC 에셋 로딩 실패:`, error);
        // 로딩 실패 시 에러 상태를 캐싱하여 반복적인 로딩 시도 방지
        npcAssetCache[spriteName] = { loaded: false };
        return npcAssetCache[spriteName];
    }
}


// --- 플레이어 상태 & 애니메이션 ---
const playerState = { 
    x: 100, y: 100, speed: 2, width: 16, height: 16, 
    joystick_dx: 0, joystick_dy: 0, 
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
    isMoving: false,
    direction: 'down', 
    animation: 'walk_down',
    frameIndex: 0,
    frameTimer: 0
};

// 플레이어 스프라이트 로딩
const playerSprite = new Image();
// 중요: 경로를 assets/player 로 맞췄음
playerSprite.src = 'assets/player/texture.png'; 

let animationsData = null;
let textureData = null;
let playerSpriteLoaded = false;

playerSprite.onload = () => {
    playerSpriteLoaded = true;
    console.log("플레이어 텍스처 로드됨.");
};
playerSprite.onerror = () => console.error("플레이어 이미지가 없어요! 경로(assets/player/texture.png) 확인하세요.");

// 애니메이션 설정 데이터 가져오기
Promise.all([
    fetch('assets/player/animations.json').then(res => {
        if (!res.ok) throw new Error(`animations.json 로드 실패: ${res.status}`);
        return res.json();
    }),
    fetch('assets/player/texture.json').then(res => {
        if (!res.ok) throw new Error(`texture.json 로드 실패: ${res.status}`);
        return res.json();
    })
]).then(([animations, texture]) => {
    animationsData = animations;
    textureData = texture;
    console.log("애니메이션 데이터 준비 완료.");
}).catch(error => console.error("애니메이션 데이터 로딩 중 에러:", error));


// 조이스틱 및 게임 루프 변수
let joystickActive = false, joystickStartX = 0, joystickStartY = 0;
let baseRect, maxRadius;
let gameRunning = false;
let lastTime = 0;
let nearbyNPC = null; // 상호작용 가능한 NPC 저장 변수

// --- 화면 방향 체크 (모바일 가로모드 강제) ---
function checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        rotateWarning.classList.remove('hidden');
        if (gameRunning) {
            canvas.classList.add('hidden');
            joystickContainer.classList.add('hidden');
            interactionButton.classList.add('hidden');
            interactionButton.classList.remove('visible');
        }
    } else {
        rotateWarning.classList.add('hidden');
        if (gameRunning) {
            canvas.classList.remove('hidden');
            joystickContainer.classList.remove('hidden');
            // interactionButton은 updateInteractionUI에서 관리하므로 여기선 joystick만 처리
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            calculateZoomLevel(); // 화면 크기가 바뀌었으니 줌 레벨 다시 계산
        }
    }
}

// --- 게임 시작 ---
async function startGame() {
    lobby.classList.add('hidden');
    gameRunning = true;
    canvas.width = window.innerWidth; // 게임 시작 시 캔버스 크기 설정
    canvas.height = window.innerHeight;
    checkOrientation();
    calculateZoomLevel(); // 게임 시작 시 줌 레벨 계산
    
    // 전체화면 시도
    try { await document.documentElement.requestFullscreen(); } 
    catch (err) { console.error("전체화면 실패(상관없음):", err); }
    
    // 시작 위치
    playerState.x = 4 * TILE_SIZE;
    playerState.y = 4 * TILE_SIZE;
    
    initializeNpcs(); // 게임 시작 시 NPC 초기화
    setupJoystick();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// 타일 그리기 함수
function drawTile(tileValue, worldX, worldY, cameraX, cameraY) {
    if (tileValue === 0) return; // 빈 땅은 안 그림
    const tileIndex = tileValue - 1; // 데이터는 1부터 시작해서 인덱스 조정

    if (tilesetLoaded && tileIndex >= 0 && scaledTileCache[tileIndex]) {
        const drawX = Math.floor((worldX - cameraX) * zoomLevel);
        const drawY = Math.floor((worldY - cameraY) * zoomLevel);
        const drawSize = Math.ceil(scaledTileSize);
        ctx.drawImage(scaledTileCache[tileIndex], drawX, drawY, drawSize, drawSize);
    } else {
        // 이미지 로딩 전이면 회색 박스로 대체
        const drawX = Math.floor((worldX - cameraX) * zoomLevel);
        const drawY = Math.floor((worldY - cameraY) * zoomLevel);
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(drawX, drawY, scaledTileSize, scaledTileSize);
    }
}

// 오브젝트 그리기 (나무, 바위 등)
function drawObjectTile(tileValue, worldX, worldY, cameraX, cameraY) {
    if (tileValue === 0) return;
    const tileIndex = tileValue;

    if (objectTilesetLoaded && tileIndex > 0 && scaledObjectTileCache[tileIndex]) {
        const objectScaledHeight = OBJECT_TILE_SIZE * zoomLevel;
        const tileScaledHeight = TILE_SIZE * zoomLevel;

        const drawX = Math.floor((worldX - cameraX) * zoomLevel);
        // 오브젝트는 타일보다 크니까 바닥 기준점을 맞춰서 위로 그림
        const drawY = Math.floor((worldY - cameraY) * zoomLevel) - (objectScaledHeight - tileScaledHeight);
        
        const drawSize = Math.ceil(OBJECT_TILE_SIZE * zoomLevel);
        ctx.drawImage(scaledObjectTileCache[tileIndex], drawX, drawY, drawSize, drawSize);
    } else {
        // 로딩 안됐을 때 대체 박스
        // ... (생략 가능하나 디버깅 위해 남겨둠)
    }
}

// 맵 전체 그리기 (땅바닥)
function drawMap(cameraX, cameraY) {
    // 화면에 보이는 영역만 계산 (최적화)
    const viewLeft = Math.floor(cameraX / TILE_SIZE);
    const viewTop = Math.floor(cameraY / TILE_SIZE);
    const viewRight = Math.ceil((cameraX + canvas.width / zoomLevel) / TILE_SIZE);
    const viewBottom = Math.ceil((cameraY + canvas.height / zoomLevel) / TILE_SIZE);

    for (let row = viewTop; row < viewBottom; row++) {
        for (let col = viewLeft; col < viewRight; col++) {
            if (row < 0 || row >= groundLayer.length || col < 0 || col >= groundLayer[0].length) continue;

            const groundTileValue = groundLayer[row][col];
            if (groundTileValue !== 0) {
                drawTile(groundTileValue, col * TILE_SIZE, row * TILE_SIZE, cameraX, cameraY);
            }
        }
    }
}

// 플레이어 그리기
function drawPlayer(cameraX, cameraY) {
    const scaledCollisionWidth = playerState.width * zoomLevel;
    const scaledCollisionHeight = playerState.height * zoomLevel;
    const drawX = Math.floor((playerState.x - cameraX) * zoomLevel);
    const drawY = Math.floor((playerState.y - cameraY) * zoomLevel);

    const useSprite = playerSpriteLoaded && animationsData && textureData && playerState.isMoving;

    if (useSprite) {
        // 방향에 따른 애니메이션 이름 결정
        let animationName;
        let flipHorizontally = (playerState.direction === 'up_right' || playerState.direction === 'down_right' || playerState.direction === 'left');

        // 대각선 처리
        if (playerState.direction.includes('up')) {
            animationName = 'walk_down'; // 위로 갈 때(화면 뒤쪽)는 뒷모습(down) 애니메이션
            flipHorizontally = false; 
        } else if (playerState.direction.includes('down')) {
            animationName = 'walk_up'; // 아래로 갈 때(화면 앞쪽)는 앞모습(up) 애니메이션
        } else if (playerState.direction.includes('left') || playerState.direction.includes('right')) {
            animationName = `walk_${playerState.direction}`.replace('left', 'right'); // 왼쪽은 오른쪽 뒤집어서 씀
        } else {
            animationName = `walk_${playerState.direction}`;
        }

        // 왼쪽/오른쪽 이동 시 애니메이션 이름 설정 및 뒤집기
        if (playerState.direction.includes('left') || playerState.direction.includes('right')) {
            animationName = animationName.replace('left', 'right'); // 왼쪽은 오른쪽 뒤집어서 씀
        }

        const animation = animationsData.animations[animationName];

        if (animation) {
            const frameIndex = Math.floor(playerState.frameIndex) % animation.length;
            const frameName = animation[frameIndex];
            const frame = textureData.frames[frameName];

            if (frame) {
                const { x, y, w, h } = frame.frame;
                const aspectRatio = w / h;
                const renderHeight = TILE_SIZE * 1.2; // 캐릭터가 타일보다 살짝 크게
                const renderWidth = renderHeight * aspectRatio;
                const scaledRenderWidth = renderWidth * zoomLevel;
                const scaledRenderHeight = renderHeight * zoomLevel;

                // 중앙 정렬
                const spriteDrawX = drawX - (scaledRenderWidth - scaledCollisionWidth) / 2;
                const spriteDrawY = drawY + scaledCollisionHeight - scaledRenderHeight;

                if (flipHorizontally) {
                    ctx.save();
                    ctx.scale(-1, 1); // 좌우 반전
                    ctx.drawImage(playerSprite, x, y, w, h, -spriteDrawX - scaledRenderWidth, spriteDrawY, scaledRenderWidth, scaledRenderHeight);
                    ctx.restore();
                } else {
                    ctx.drawImage(playerSprite, x, y, w, h, spriteDrawX, spriteDrawY, scaledRenderWidth, scaledRenderHeight);
                }
                return;
            }
        }
    }

    // 스프라이트 없으면 빨간 박스로 표시
    ctx.fillStyle = 'red';
    ctx.fillRect(drawX, drawY, scaledCollisionWidth, scaledCollisionHeight);
}

// NPC 그리기 함수 (drawPlayer와 거의 동일)
async function drawNpc(npc, cameraX, cameraY) {
    const assets = await loadNpcAssets(npc.spriteName);

    const scaledCollisionWidth = npc.width * zoomLevel;
    const scaledCollisionHeight = npc.height * zoomLevel;
    const drawX = Math.floor((npc.x - cameraX) * zoomLevel);
    const drawY = Math.floor((npc.y - cameraY) * zoomLevel);

    // 에셋 로딩에 실패했거나, 아직 움직이지 않을 때 (임시)
    if (!assets || !assets.loaded) {
        ctx.fillStyle = 'blue'; // 로딩 실패 시 파란 박스로 표시
        ctx.fillRect(drawX, drawY, scaledCollisionWidth, scaledCollisionHeight);
        return;
    }

    // TODO: NPC 움직임 및 방향에 따른 애니메이션 로직 추가 (지금은 정지 상태)
    const animationName = npc.isMoving ? `walk_${npc.direction}` : `idle_${npc.direction}`;
    const animation = assets.animations.animations[animationName];

    if (animation) {
        const frameIndex = Math.floor(npc.frameIndex) % animation.length;
        const frameName = animation[frameIndex];
        const frame = assets.texture.frames[frameName];

        if (frame) {
            const { x, y, w, h } = frame.frame;
            
            // 원본 스프라이트의 비율을 유지하면서 크기 조절
            // 캐릭터의 너비를 타일 크기에 맞추고, 높이는 비율에 따라 자동 조절
            const renderWidth = TILE_SIZE * 1.5; // 캐릭터가 타일보다 약간 넓게 보이도록 설정 (조절 가능)
            const renderHeight = renderWidth * (h / w);
            const scaledRenderWidth = renderWidth * zoomLevel;
            const scaledRenderHeight = renderHeight * zoomLevel;

            const spriteDrawX = drawX - (scaledRenderWidth - scaledCollisionWidth) / 2;
            const spriteDrawY = drawY + scaledCollisionHeight - scaledRenderHeight;

            // NPC는 좌우반전이 없다고 가정
            ctx.drawImage(assets.sprite, x, y, w, h, spriteDrawX, spriteDrawY, scaledRenderWidth, scaledRenderHeight);
            return;
        }
    }

    // 애니메이션 정보가 없으면 기본 이미지(첫 프레임)를 그리거나, 박스로 표시
    const firstFrame = Object.values(assets.texture.frames)[0];
    if (firstFrame) {
        const { x, y, w, h } = firstFrame.frame;

        // 위와 동일한 로직 적용
        const renderWidth = TILE_SIZE * 1.5;
        const renderHeight = renderWidth * (h / w);
        const scaledRenderWidth = renderWidth * zoomLevel;
        const scaledRenderHeight = renderHeight * zoomLevel;

        const spriteDrawX = drawX - (scaledRenderWidth - scaledCollisionWidth) / 2;
        const spriteDrawY = drawY + scaledCollisionHeight - scaledRenderHeight;
        ctx.drawImage(assets.sprite, x, y, w, h, spriteDrawX, spriteDrawY, scaledRenderWidth, scaledRenderHeight);
    } else {
        ctx.fillStyle = 'purple';
        ctx.fillRect(drawX, drawY, scaledCollisionWidth, scaledCollisionHeight);
    }
}

// 대화창 그리기
function drawDialogueBox() {
    if (!dialogueState.isActive) return;

    const boxHeight = 100;
    const boxY = canvas.height - boxHeight - 20;
    const boxX = 20;
    const boxWidth = canvas.width - 40;

    // 반투명 검은 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // 텍스트
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 줄바꿈 로직
    const text = dialogueState.message;
    const padding = 15;
    const maxWidth = boxWidth - padding * 2;
    const words = text.split(' ');
    let line = '';
    let textY = boxY + padding;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, boxX + padding, textY);
            line = words[n] + ' ';
            textY += 30; 
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, boxX + padding, textY);

    // 닫기 안내
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'right';
    ctx.fillText("버튼 또는 'E' 키를 눌러 닫기", boxWidth + 10, boxY + boxHeight - 25);
}

// --- 충돌 감지 (제일 중요한 부분) ---
function isColliding(x, y) {
    // 플레이어 위치 (정수형으로 변환)
    const playerLeft = Math.floor(x);
    const playerTop = Math.floor(y);
    const playerRight = Math.floor(x + playerState.width);
    const playerBottom = Math.floor(y + playerState.height);

    // 1. 지형(벽) 충돌 확인
    // 플레이어 네 모서리가 벽 타일에 닿았는지 체크
    const checkPoints = [
        { x: playerLeft, y: playerTop },
        { x: playerRight, y: playerTop },
        { x: playerLeft, y: playerBottom },
        { x: playerRight, y: playerBottom }
    ];

    for (const point of checkPoints) {
        const tileX = Math.floor(point.x / TILE_SIZE);
        const tileY = Math.floor(point.y / TILE_SIZE);

        if (tileY < 0 || tileY >= tileCollisionLayer.length || tileX < 0 || tileX >= tileCollisionLayer[0].length) {
            return true; // 맵 밖으로 못 나감
        }
        if (tileCollisionLayer[tileY][tileX] === 1) {
            return true; // 벽 타일임
        }
    }

    // 2. NPC 충돌 확인 (간단한 사각형 충돌)
    for (const npc of npcs) {
        if (x < npc.x + npc.width &&
            x + playerState.width > npc.x &&
            y < npc.y + npc.height &&
            y + playerState.height > npc.y) {
            return true;
        }
    }

    // 3. 오브젝트 픽셀 정밀 충돌 (Mask Check)
    if (!objectTilesetLoaded) return false;

    const checkRadius = 2; // 내 주변 2칸까지만 검사
    const playerTileX = Math.floor((x + playerState.width / 2) / TILE_SIZE);
    const playerTileY = Math.floor((y + playerState.height / 2) / TILE_SIZE);

    for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {
        for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
            if (row < 0 || row >= objectLayer.length || col < 0 || col >= objectLayer[0].length) continue;

            const tileValue = objectLayer[row][col];
            if (tileValue === 0) continue;
            
            // 충돌 레이어에 표시된 것만 픽셀 검사 (최적화)
            if (objectCollisionLayer[row][col] !== 1) continue;

            const mask = objectCollisionMasks[tileValue];
            if (!mask) continue;

            // 오브젝트 실제 위치 계산 (타일보다 크기가 커서 좌표 보정이 필요함)
            const objWorldX = col * TILE_SIZE;
            const objWorldY = (row * TILE_SIZE) - (OBJECT_TILE_SIZE - TILE_SIZE);

            // 겹치는 영역(Intersection) 구하기
            const intersectLeft = Math.max(playerLeft, objWorldX);
            const intersectTop = Math.max(playerTop, objWorldY);
            const intersectRight = Math.min(playerRight, objWorldX + OBJECT_TILE_SIZE);
            const intersectBottom = Math.min(playerBottom, objWorldY + OBJECT_TILE_SIZE);

            if (intersectLeft >= intersectRight || intersectTop >= intersectBottom) continue;

            // 겹치는 부분의 픽셀 하나하나 검사
            for (let py = intersectTop; py < intersectBottom; py++) {
                for (let px = intersectLeft; px < intersectRight; px++) {
                    const localX = Math.floor(px - objWorldX);
                    const localY = Math.floor(py - objWorldY);

                    if (localX >= 0 && localX < OBJECT_TILE_SIZE && 
                        localY >= 0 && localY < OBJECT_TILE_SIZE) {
                        // 마스크가 true(불투명)인 곳이면 충돌!
                        if (mask[localY][localX]) {
                            return true; 
                        }
                    }
                }
            }
        }
    }
    return false;
}

// --- 상호작용 UI 업데이트 ---
function updateInteractionUI() {
    if (dialogueState.isActive) {
        // 대화 중에는 항상 버튼이 보이게
        interactionButton.classList.remove('hidden');
        interactionButton.classList.add('visible');
        return;
    }

    const INTERACTION_DISTANCE = TILE_SIZE * 1.5;
    let foundNPC = null;

    for (const npc of npcs) {
        const playerCenterX = playerState.x + playerState.width / 2;
        const playerCenterY = playerState.y + playerState.height / 2;
        const npcCenterX = npc.x + npc.width / 2;
        const npcCenterY = npc.y + npc.height / 2;

        const distance = Math.sqrt(
            Math.pow(playerCenterX - npcCenterX, 2) + Math.pow(playerCenterY - npcCenterY, 2)
        );

        if (distance < INTERACTION_DISTANCE) {
            foundNPC = npc;
            break;
        }
    }

    nearbyNPC = foundNPC;

    if (nearbyNPC) {
        interactionButton.classList.remove('hidden');
        interactionButton.classList.add('visible');
    } else {
        interactionButton.classList.remove('visible');
        // 참고: transition이 끝나고 display:none으로 바꾸려면 transitionend 이벤트를 써야 하지만,
        // 여기서는 opacity 0으로도 충분하므로 그냥 둠.
    }
}


// --- 메인 게임 루프 ---
function gameLoop(currentTime) {
    if (!gameRunning || window.innerHeight > window.innerWidth) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // 델타타임 계산 (프레임 방어)
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // --- 업데이트 로직 ---
    // 1. 입력에 따른 이동 계산
    let dx = 0, dy = 0;
    if (playerState.joystick_dx !== 0 || playerState.joystick_dy !== 0) {
        dx = playerState.joystick_dx;
        dy = playerState.joystick_dy;
    } else {
        if (playerState.keys.ArrowUp) dy -= 1;
        if (playerState.keys.ArrowDown) dy += 1;
        if (playerState.keys.ArrowLeft) dx -= 1;
        if (playerState.keys.ArrowRight) dx += 1;
    }

    playerState.isMoving = (dx !== 0 || dy !== 0);

    // 2. 실제 이동 처리
    if (playerState.isMoving) {
        let moveDx = dx;
        let moveDy = dy;

        // 키보드 대각선 이동 시 속도 일정하게 (Normalize)
        if (!(playerState.joystick_dx !== 0 || playerState.joystick_dy !== 0) && dx !== 0 && dy !== 0) {
             const length = Math.sqrt(2);
             moveDx = dx / length;
             moveDy = dy / length;
        }

        // 방향 결정 (애니메이션용)
        const threshold = 0.2;
        if (dy < -threshold) {
            if (dx > threshold) playerState.direction = 'up_right';
            else if (dx < -threshold) playerState.direction = 'up_left';
            else playerState.direction = 'up';
        } else if (dy > threshold) {
            if (dx > threshold) playerState.direction = 'down_right';
            else if (dx < -threshold) playerState.direction = 'down_left';
            else playerState.direction = 'down';
        } else if (dx > threshold) {
            playerState.direction = 'right';
        } else if (dx < -threshold) {
            playerState.direction = 'left';
        }
        
        // 애니메이션 타이머 업데이트
        if (animationsData && textureData) {
            playerState.frameTimer += deltaTime;
            const frameDuration = animationsData.meta.frameDuration;
            if (playerState.frameTimer >= frameDuration) {
                playerState.frameTimer = 0;
                
                let animationName = `walk_${playerState.direction}`;
                if (playerState.direction.includes('left') || playerState.direction.includes('right')) {
                    animationName = animationName.replace('left', 'right');
                }

                const currentAnimation = animationsData.animations[animationName];
                if (currentAnimation) {
                    playerState.frameIndex = (playerState.frameIndex + 1) % currentAnimation.length;
                }
            }
        }

        // 충돌 체크 후 이동 (X축 Y축 따로 검사해야 벽에 비비면서 가짐)
        const nextX = playerState.x + moveDx * playerState.speed;
        const nextY = playerState.y + moveDy * playerState.speed;

        if (moveDx !== 0 && !isColliding(nextX, playerState.y)) {
            playerState.x = nextX;
        }
        if (moveDy !== 0 && !isColliding(playerState.x, nextY)) {
            playerState.y = nextY;
        }
    } else {
        // 멈췄을 땐 프레임 초기화
        playerState.frameIndex = 0;
        playerState.frameTimer = 0;
    }
    
    // 3. 상호작용 UI 업데이트
    updateInteractionUI();

    // --- 렌더링 로직 ---
    // 카메라 위치 계산 (플레이어가 화면 중앙에 오도록)
    const cameraX = playerState.x + playerState.width / 2 - (canvas.width / zoomLevel / 2);
    const cameraY = playerState.y + playerState.height / 2 - (canvas.height / zoomLevel / 2);

    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // --- 렌더링 파이프라인 최적화 ---
    // 1. 바닥(Ground) 레이어 그리기
    drawMap(cameraX, cameraY);

    // 2. 동적 객체들(플레이어, NPC)을 리스트로 준비
    const dynamicEntities = [{ ...playerState, type: 'player' }, ...npcs.map(npc => ({ ...npc, type: 'npc' }))];

    // 3. 오브젝트와 동적 객체를 Y 순서에 맞춰 함께 그리기 (Y-Sorting 최적화)
    const viewLeft = Math.floor(cameraX / TILE_SIZE);
    const viewTop = Math.floor(cameraY / TILE_SIZE);
    const viewRight = Math.ceil((cameraX + canvas.width / zoomLevel) / TILE_SIZE);
    const viewBottom = Math.ceil((cameraY + canvas.height / zoomLevel) / TILE_SIZE);

    for (let row = viewTop; row < viewBottom; row++) {
        // 현재 줄(row)에 그려져야 할 동적 객체들을 찾아서 정렬
        const entitiesInThisRow = dynamicEntities
            .filter(e => {
                const entityBottomY = e.y + (e.height || 0);
                const currentRowY = row * TILE_SIZE;
                const nextRowY = (row + 1) * TILE_SIZE;
                return entityBottomY > currentRowY && entityBottomY <= nextRowY;
            })
            .sort((a, b) => (a.y + a.height) - (b.y + b.height));

        // 현재 줄의 오브젝트 그리기
        for (let col = viewLeft; col < viewRight; col++) {
            if (row < 0 || row >= objectLayer.length || col < 0 || col >= objectLayer[0].length) continue;
            const objectTileValue = objectLayer[row][col];
            if (objectTileValue !== 0) {
                drawObjectTile(objectTileValue, col * TILE_SIZE, row * TILE_SIZE, cameraX, cameraY);
            }
        }

        // 해당 줄에 속한 동적 객체들 그리기
        entitiesInThisRow.forEach(entity => {
            if (entity.type === 'player') {
                drawPlayer(cameraX, cameraY);
            } else if (entity.type === 'npc') {
                drawNpc(entity, cameraX, cameraY); // 새로운 NPC 그리기 함수 호출
            }
        });
    }
    
    // 4. 최상단 UI 그리기
    drawDialogueBox();

    requestAnimationFrame(gameLoop);
}

// --- 입력 처리 (조이스틱, 키보드, 터치) ---

function setupJoystick() {
    baseRect = joystickBase.getBoundingClientRect();
    maxRadius = baseRect.width / 2 - joystick.offsetWidth / 2;
}

// 터치 핸들러
function handleTouchStart(e) { 
    // 조이스틱 영역에서만 반응하도록 수정
    if (e.target === joystickBase || e.target === joystick) {
        e.preventDefault(); 
        joystickActive = true; 
        joystick.style.transition = '0s'; 
        const touch = e.changedTouches[0]; 
        joystickStartX = touch.clientX; 
        joystickStartY = touch.clientY; 
    }
}

function handleTouchMove(e) {
    if (!joystickActive) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    let moveX = touch.clientX - joystickStartX;
    let moveY = touch.clientY - joystickStartY;
    
    // 조이스틱 범위 제한
    const distance = Math.sqrt(moveX * moveX + moveY * moveY);
    if (distance > maxRadius) { 
        moveX = (moveX / distance) * maxRadius; 
        moveY = (moveY / distance) * maxRadius; 
    }
    
    joystick.style.transform = `translate(${moveX}px, ${moveY}px)`;
    const angle = Math.atan2(moveY, moveX);
    playerState.joystick_dx = (distance < 10) ? 0 : Math.cos(angle);
    playerState.joystick_dy = (distance < 10) ? 0 : Math.sin(angle);
}

function handleTouchEnd(e) {
    if (!joystickActive) return;
    e.preventDefault();
    joystickActive = false;
    joystick.style.transition = '0.2s';
    joystick.style.transform = `translate(0px, 0px)`;
    playerState.joystick_dx = 0;
    playerState.joystick_dy = 0;
}

// 키보드 핸들러
function handleKeyDown(e) { 
    if (playerState.keys.hasOwnProperty(e.key)) { 
        e.preventDefault(); 
        playerState.keys[e.key] = true; 
    } 
    // 상호작용 키 처리
    if (e.code === 'KeyE' && gameRunning) {
        e.preventDefault();
        triggerInteraction();
    }

    // 색상 변경 테스트용 코드
    if (e.code === 'Digit1') {
        playerState.hueRotation = 0; // 기본 색상
        console.log('플레이어 색상: 기본');
    } else if (e.code === 'Digit2') {
        playerState.hueRotation = 120; // 초록색 계열
        console.log('플레이어 색상: 초록');
    }
}
function handleKeyUp(e) { 
    if (playerState.keys.hasOwnProperty(e.key)) { 
        e.preventDefault(); 
        playerState.keys[e.key] = false; 
    } 
}

// 상호작용 실행 함수
function triggerInteraction() {
    // 대화창이 이미 활성화되어 있으면 닫기
    if (dialogueState.isActive) {
        dialogueState.isActive = false;
        dialogueState.message = "";
        dialogueState.npc = null;
        return;
    }

    // 근처에 NPC가 있을 때만 대화 시작
    if (nearbyNPC) {
        dialogueState.isActive = true;
        dialogueState.message = nearbyNPC.dialogue;
        dialogueState.npc = nearbyNPC;
    }
}

// 이벤트 리스너 등록
joystickContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
interactionButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation(); // 조이스틱으로 이벤트가 전파되지 않게 막음
    triggerInteraction();
}, { passive: false });

window.addEventListener('touchmove', handleTouchMove, { passive: false });
window.addEventListener('touchend', handleTouchEnd, { passive: false });
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', checkOrientation);
