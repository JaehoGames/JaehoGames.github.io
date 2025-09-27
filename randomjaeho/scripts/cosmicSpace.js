// scripts/cosmicSpace.js

/**
 * 우주 공간 관련 변수
 */
const cosmicGameConfig = {
    winLevel: 5, // 승리 레벨
    sequenceInterval: 600, // 신호 표시 간격 (ms)
    levelSpeedUpFactor: 0.95 // 레벨마다 빨라지는 속도
};
let cosmicGameState = {
    level: 1,
    sequence: [],
    playerSequence: [],
    gameActive: false,
    playerTurn: false,
    currentSpeed: cosmicGameConfig.sequenceInterval
};

/**
 * 우주 공간 시스템 초기화
 */
function initCosmicSpace() {
    const container = document.getElementById('cosmicSpaceContainer');
    const exitButton = document.getElementById('exitCosmicSpaceButton');
    if (!container || !exitButton) return;

    container.addEventListener('click', () => {
        if (stats.hasCosmicKey) {
            enterCosmicSpace();
        } else {
            showNotification("'코즈믹 키'를 보유하고 있어야 입장할 수 있습니다.", '#f39c12');
        }
    });

    exitButton.addEventListener('click', exitCosmicSpace);

    initCosmicMinigame(); // 우주 미니게임 초기화
    updateCosmicSpaceUI(); // 초기 상태 설정
}

/**
 * 우주 공간 UI 업데이트
 */
function updateCosmicSpaceUI() {
    const container = document.getElementById('cosmicSpaceContainer');
    const lockIcon = document.getElementById('cosmicLockIcon');
    const label = document.getElementById('cosmicSpaceLabel');
    if (!container || !lockIcon || !label) return;

    if (stats.hasCosmicKey) {
        container.classList.remove('development');
        container.classList.add('unlocked');
        lockIcon.textContent = '🔑';
        label.textContent = '우주 공간 입장';
        container.style.cursor = 'pointer';
    } else {
        container.classList.remove('unlocked');
        container.classList.add('development'); // 잠금 상태일 때 '개발중' 스타일 재사용
        lockIcon.textContent = '🔒';
        label.textContent = '우주 공간';
        container.style.cursor = 'not-allowed';
    }
}

/**
 * 우주 공간 진입
 */
function enterCosmicSpace() {
    const modal = document.getElementById('cosmicGachaModal');
    if (!modal) return;
    resetCosmicMinigameUI(); // 미니게임 UI 초기화
    updatePermanentLuckUI(); // UI 업데이트
    modal.classList.add('show');
}

/**
 * 우주 공간에서 나가기
 */
function exitCosmicSpace() {
    const modal = document.getElementById('cosmicGachaModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * 우주 공간 미니게임 초기화
 */
function initCosmicMinigame() {
    document.getElementById('startCosmicGameButton').addEventListener('click', startCosmicMinigame);
    document.getElementById('restartCosmicGameButton').addEventListener('click', resetCosmicMinigameUI);
    document.getElementById('cosmicSignalPad').addEventListener('click', handleSignalClick);
}

/**
 * 미니게임 UI를 초기 화면으로 리셋
 */
function resetCosmicMinigameUI() {
    document.getElementById('cosmicGameIntro').style.display = 'block';
    document.getElementById('cosmicGameArea').style.display = 'none';
    document.getElementById('cosmicGameResult').style.display = 'none';
}

/**
 * 미니게임 시작
 */
function startCosmicMinigame() {
    document.getElementById('cosmicGameIntro').style.display = 'none';
    document.getElementById('cosmicGameResult').style.display = 'none';
    document.getElementById('cosmicGameArea').style.display = 'block';

    // 게임 상태 초기화
    cosmicGameState.level = 1;
    cosmicGameState.sequence = [];
    cosmicGameState.playerSequence = [];
    cosmicGameState.gameActive = true;
    cosmicGameState.playerTurn = false;
    cosmicGameState.currentSpeed = cosmicGameConfig.sequenceInterval;

    nextLevel();
}

/**
 * 다음 레벨로 진행
 */
function nextLevel() {
    cosmicGameState.playerSequence = [];
    cosmicGameState.playerTurn = false;
    cosmicGameState.currentSpeed *= cosmicGameConfig.levelSpeedUpFactor;

    document.getElementById('cosmicGameLevel').textContent = cosmicGameState.level;
    document.getElementById('cosmicGameStatus').textContent = '신호를 기억하세요...';

    // 새로운 신호 추가
    cosmicGameState.sequence.push(Math.floor(Math.random() * 4));

    playSequence();
}

/**
 * 저장된 순서대로 신호를 보여줌
 */
function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i >= cosmicGameState.sequence.length) {
            clearInterval(interval);
            cosmicGameState.playerTurn = true;
            document.getElementById('cosmicGameStatus').textContent = '따라 입력하세요!';
            return;
        }
        
        const buttonId = cosmicGameState.sequence[i];
        const button = document.querySelector(`.signal-button[data-id="${buttonId}"]`);
        
        // 신호 활성화
        button.classList.add('active');
        setTimeout(() => {
            button.classList.remove('active');
        }, cosmicGameState.currentSpeed / 2);

        i++;
    }, cosmicGameState.currentSpeed);
}

/**
 * 플레이어의 신호 버튼 클릭 처리
 */
function handleSignalClick(e) {
    if (!cosmicGameState.playerTurn || !e.target.matches('.signal-button')) return;

    const clickedId = parseInt(e.target.dataset.id);
    
    // 플레이어 클릭 시각적 효과
    e.target.classList.add('player-active');
    setTimeout(() => e.target.classList.remove('player-active'), 150);

    cosmicGameState.playerSequence.push(clickedId);
    const currentIndex = cosmicGameState.playerSequence.length - 1;

    // 입력이 틀렸을 경우
    if (cosmicGameState.playerSequence[currentIndex] !== cosmicGameState.sequence[currentIndex]) {
        endCosmicMinigame(false);
        return;
    }
    // 현재 레벨의 순서를 모두 맞췄을 경우
    if (cosmicGameState.playerSequence.length === cosmicGameState.sequence.length) {
        if (cosmicGameState.level >= cosmicGameConfig.winLevel) {
            endCosmicMinigame(true); // 최종 승리
        } else {
            cosmicGameState.level++;
            setTimeout(nextLevel, 1000); // 1초 후 다음 레벨
        }
    }
}

/**
 * 게임 종료 처리
 * @param {boolean} isSuccess - 성공 여부
 */
function endCosmicMinigame(isSuccess) {
    cosmicGameState.gameActive = false;
    cosmicGameState.playerTurn = false;

    document.getElementById('cosmicGameArea').style.display = 'none';
    document.getElementById('cosmicGameResult').style.display = 'block';

    const title = document.getElementById('cosmicGameResultTitle');
    const message = document.getElementById('cosmicGameResultMessage');

    if (isSuccess) {
        const reward = Math.floor(Math.random() * 6) + 5; // 5 ~ 10 코즈믹 파편
        stats.cosmicFragments = (stats.cosmicFragments || 0) + reward;
        updatePermanentLuckUI(); // 파편 획득 후 UI 업데이트
        title.textContent = '🎉 성공! 🎉';
        message.textContent = `코즈믹 시그널 해독 완료! 보상으로 코즈믹 파편 ${reward}개를 획득했습니다!`;
        showNotification(`+${reward} 코즈믹 파편 획득!`, '#3498db');
    } else {
        title.textContent = '💥 실패 💥';
        message.textContent = `아쉽지만, 레벨 ${cosmicGameState.level}에서 신호 순서가 틀렸습니다. 다시 도전해보세요!`;
    }
}

/**
 * 영구 행운 강화 시스템 초기화
 */
function initPermanentLuckSystem() {
    const upgradeButton = document.getElementById('upgradeLuckButton');
    if (upgradeButton) {
        upgradeButton.addEventListener('click', upgradePermanentLuck);
    }
}

/**
 * 영구 행운 강화 비용을 계산합니다.
 * @returns {number}
 */
function getLuckUpgradeCost() {
    const luckLevel = stats.permanentLuck || 0;
    if (luckLevel >= PERMANENT_LUCK_CONFIG.MAX_LEVEL) {
        return Infinity; // Max level reached
    }
    return PERMANENT_LUCK_CONFIG.COSTS[luckLevel];
}

/**
 * 영구 행운을 강화합니다.
 */
function upgradePermanentLuck() {
    const luckLevel = stats.permanentLuck || 0;
    if (luckLevel >= PERMANENT_LUCK_CONFIG.MAX_LEVEL) {
        showNotification('이미 최대 레벨입니다.', '#f39c12');
        return;
    }

    const cost = getLuckUpgradeCost();
    if ((stats.cosmicFragments || 0) < cost) {
        showNotification('코즈믹 파편이 부족합니다.', '#e74c3c');
        return;
    }

    stats.cosmicFragments -= cost;
    stats.permanentLuck = (stats.permanentLuck || 0) + 1;

    showNotification(`✨ 영구 행운 레벨이 ${stats.permanentLuck}(으)로 올랐습니다!`, '#f1c40f');
    
    updatePermanentLuckUI();
    updateProbabilityDisplay(); // 확률 표시 즉시 업데이트
}

/**
 * 영구 행운 강화 UI를 업데이트합니다.
 */
function updatePermanentLuckUI() {
    const fragmentsAmountEl = document.getElementById('cosmicFragmentsAmount');
    const luckLevelEl = document.getElementById('permanentLuckLevel');
    const upgradeCostEl = document.getElementById('luckUpgradeCost');
    const upgradeButton = document.getElementById('upgradeLuckButton');

    if (!fragmentsAmountEl || !luckLevelEl || !upgradeCostEl || !upgradeButton) return;

    const cost = getLuckUpgradeCost();
    const luckLevel = stats.permanentLuck || 0;

    fragmentsAmountEl.textContent = (stats.cosmicFragments || 0).toLocaleString();
    luckLevelEl.textContent = `${luckLevel} / ${PERMANENT_LUCK_CONFIG.MAX_LEVEL}`;
    
    if (cost === Infinity) {
        // '강화 (비용: 1,000💠)' 형태의 버튼 텍스트를 '최대 레벨 달성!'으로 변경
        upgradeButton.textContent = '최대 레벨 달성!';
        upgradeButton.disabled = true;
    } else {
        upgradeButton.innerHTML = `강화 (비용: <span id="luckUpgradeCost">${cost.toLocaleString()}</span>💠)`;
        upgradeButton.disabled = (stats.cosmicFragments || 0) < cost;
    }
}

/**
 * 코즈믹 미니게임이 현재 활성 상태인지 확인합니다.
 * @returns {boolean}
 */
function isCosmicMinigameActive() {
    return cosmicGameState.gameActive;
}