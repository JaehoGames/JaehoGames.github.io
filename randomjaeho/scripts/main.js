// main.js - 게임 초기화 및 상점 시스템 관리

const DEFAULT_BACKGROUND = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
window.isFlameEventForced = false; // 개발자용 화염 이벤트 강제 실행 플래그
let autoSaveInterval = null; // 자동 저장 인터벌 ID
let isGameInitialized = false;

/**
 * 안티치트 시스템 초기화
 */
function initializeAntiCheat() {
    loadPenaltyState();
    checkAndApplyLockout();
    // 10초마다 의심 점수를 감소시킵니다.
    setInterval(() => decaySuspicionScore(), 10000);
    console.log('Anti-cheat system initialized.');
}

/**
 * 게임의 모든 핵심 시스템을 초기화합니다.
 * 이 함수는 입장 화면이 성공적으로 완료된 후에 호출됩니다.
 */
function initializeGame() {
    try {
        cacheAllGameItems();
        initializeAntiCheat();
        initShopSystem();
        overrideFunctionsForShop();
        initGradePreview();
        initInventorySystem();
        initCosmicSpace();
        initFusionSystem();
        initPermanentLuckSystem();
        initCoinClickSound();
        // initFirebaseAuth(); // 호출 위치 변경
        initRankingSystem(); // 랭킹 시스템 초기화
        initFortuneTeller();
        initChoiceModalListeners();
        initDevPanel();
        isGameInitialized = true; // 게임 초기화 완료 플래그 설정
        initFlameEventSystem(); // 화염 이벤트 시스템 초기화
        initEventCountdown(); // 일반 이벤트 카운트다운 시스템 초기화

        // 5분마다 자동 저장 시작
        if (autoSaveInterval) clearInterval(autoSaveInterval);
        autoSaveInterval = setInterval(() => {
            if (currentUser) { // 로그인 상태일 때만 자동 저장
                saveGameData(false); // 알림 없이 조용히 저장
            }
        }, 5 * 60 * 1000); // 5분

        // 3분마다 주기적 퀴즈 실행
        setInterval(() => {
            // 퀴즈를 띄우지 않아야 할 조건들:
            // 1. 로그아웃 상태
            // 2. 코즈믹 시그널 미니게임 진행 중
            // 3. 이미 다른 퀴즈 모달(입장 퀴즈 또는 봇 방지 퀴즈)이 활성화된 상태
            if (!currentUser || 
                (typeof isCosmicMinigameActive === 'function' && isCosmicMinigameActive()) ||
                document.getElementById('entryQuizModal').style.display === 'flex' ||
                (document.getElementById('quizModal') && document.getElementById('quizModal').classList.contains('show'))
            ) {
                return;
            }
            console.log("주기적 봇 감지 퀴즈를 실행합니다.");
            triggerSecurityCaptcha('periodic');
        }, 1.5 * 60 * 1000); // 1분 30초

    } catch (error) {
        console.error("게임 초기화 중 심각한 오류 발생:", error);
        // 사용자에게 오류 메시지를 보여줄 수 있습니다.
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.innerHTML = `<div style="color: red; text-align: center; padding: 50px;"><h1>오류 발생</h1><p>게임을 초기화하는 데 실패했습니다. 페이지를 새로고침하거나 개발자에게 문의해주세요.</p></div>`;
        }
    }

    // 로그인/로그아웃 버튼 이벤트 리스너 추가
    document.getElementById('loginButton').addEventListener('click', showLoginModal);
    document.getElementById('logoutButton').addEventListener('click', signOutUser);

    // 개발자 패널 버튼 이벤트 리스너 추가
    const devPanelButton = document.getElementById('devPanelButton');
    if (devPanelButton) {
        devPanelButton.addEventListener('click', toggleDevPanel);
    }
}

/**
 * 등급별 이미지 미리보기 시스템 초기화
 */
function initGradePreview() {
    const gradeInfoElements = document.querySelectorAll('.grade-info[data-grade]');
    const modal = document.getElementById('imagePreviewModal');
    const modalContent = modal.querySelector('.image-preview-content');
    const closeButton = document.getElementById('closePreviewModal');
    const gradeNameEl = document.getElementById('previewGradeName');
    const grid = document.getElementById('imagePreviewGrid');

    gradeInfoElements.forEach(el => {
        el.addEventListener('click', () => {
            const gradeKey = el.dataset.grade;
            const gradeData = grades[gradeKey];

            if (!gradeData || !gradeData.images || gradeData.images.length === 0) {
                showNotification('이 등급에는 표시할 이미지가 없습니다.', '#e74c3c');
                return;
            }

            // 모달 내용 채우기
            gradeNameEl.textContent = gradeData.name;
            gradeNameEl.style.color = gradeData.color.includes('gradient') ? '#fff' : gradeData.color;
            grid.innerHTML = ''; // 이전 이미지들 제거

            // [수정] 뽑은 재호와 뽑지 않은 재호를 구분하여 표시
            gradeData.images.forEach(imagePath => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-image-container';
                const item = imagePath; // 이제 item은 {path, name} 객체입니다.

                if (stats.collectedItems && stats.collectedItems[item.path]) {
                    // 뽑은 재호: 이미지와 이름 표시
                    const img = document.createElement('img');
                    img.src = item.path;
                    img.alt = item.name;
                    img.onerror = function() {
                        this.src = createFallbackImage(gradeData.color, gradeData.name);
                    };
                    imgContainer.appendChild(img);
                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'preview-image-name';
                    nameDiv.textContent = item.name;
                    imgContainer.appendChild(nameDiv);
                } else {
                    // 뽑지 않은 재호: '???' 표시
                    imgContainer.classList.add('uncollected');
                    imgContainer.textContent = '???';
                }
                grid.appendChild(imgContainer);
            });

            // 모달 표시
            modal.classList.add('show');
        });
    });

    // 모달 닫기 이벤트
    const closeModal = () => modal.classList.remove('show');
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

let pendingGachaResult = null; // 획득한 재호 정보를 임시 저장

/**
 * 획득한 재호에 대한 선택 모달을 표시합니다.
 * @param {object} result - 획득한 아이템 정보
 */
function showGachaChoice(result) {
    pendingGachaResult = result;
    const { grade, imagePath, itemName, finalCoins, mutation } = result;

    const modal = document.getElementById('choiceModal');
    const choiceImage = document.getElementById('choiceImage');
    const choiceGradeText = document.getElementById('choiceGradeText');
    const choiceItemName = document.getElementById('choiceItemName');
    const choiceMutationText = document.getElementById('choiceMutationText');
    const keepButton = document.getElementById('keepButton');
    const discardButton = document.getElementById('discardButton');

    choiceImage.src = imagePath;
    choiceImage.style.borderColor = grade.color.includes('gradient') ? '#fff' : grade.color;
    choiceImage.className = ''; // 이전 변이 클래스 초기화
    if (Array.isArray(mutation)) {
        mutation.forEach(m => choiceImage.classList.add(MUTATION_CONFIG[m.toUpperCase()].className));
    } else if (mutation) {
        // 기존 단일 변이 호환성
        choiceImage.classList.add(MUTATION_CONFIG[mutation.toUpperCase()].className);
    }

    choiceGradeText.textContent = grade.name;
    choiceGradeText.style.color = grade.color.includes('gradient') ? '#fff' : grade.color;
    choiceItemName.textContent = itemName;

    choiceMutationText.style.display = mutation ? 'block' : 'none';
    if (Array.isArray(mutation)) {
        const mutationTexts = mutation.map(m => 
            `<span class="mutation-text-${m}">${MUTATION_CONFIG[m.toUpperCase()].name}</span>`
        ).join(' & ');
        choiceMutationText.innerHTML = `✨ ${mutationTexts} 변이! ✨`;
    } else if (mutation) {
        // 기존 단일 변이 호환성
        choiceMutationText.innerHTML = `✨ <span class="mutation-text-${mutation}">${MUTATION_CONFIG[mutation.toUpperCase()].name} 변이!</span> ✨`;
    }

    discardButton.innerHTML = `💰 코인으로 바꾸기 (+${finalCoins.toLocaleString()})`;

    // 인벤토리 공간 확인
    if (stats.inventory.length >= stats.inventorySize) {
        keepButton.disabled = true;
        keepButton.textContent = '🎒 인벤토리 가득 참';
    } else {
        keepButton.disabled = false;
        keepButton.textContent = '🎒 인벤토리에 넣기';
    }

    modal.classList.add('show');
}

/**
 * 선택 모달을 닫고 게임 상태를 초기화합니다.
 */
function closeChoiceModal() {
    const modal = document.getElementById('choiceModal');
    modal.classList.remove('show');
    pendingGachaResult = null;

    // 뽑기 버튼 활성화
    const pullButton = document.getElementById('pullButton');
    if (pullButton) {
        pullButton.disabled = false;
        pullButton.textContent = '🎲 가챠 뽑기';
    }
}

/**
 * 아이템을 보관하든 버리든 공통적으로 업데이트되어야 할 통계
 * @param {object} result - 획득한 아이템 정보
 */
function updateCommonStats(result) {
    const { gradeKey, imagePath, mutation } = result;

    stats.total++;
    stats[gradeKey]++;

    if (!stats.collectedItems) {
        stats.collectedItems = {};
    }
    // TODO: 변이 아이템도 도감에 별도로 기록할지 여부 결정
    if (!stats.collectedItems[imagePath]) {
        stats.collectedItems[imagePath] = true;
        stats.collectedCount = (stats.collectedCount || 0) + 1;
    }

    // 우주 등급 획득 시 코즈믹 키 지급
    if (gradeKey === 'cosmic' && !stats.hasCosmicKey) {
        stats.hasCosmicKey = true;
        showNotification('✨ 코즈믹 키를 획득했습니다! 우주 공간이 열립니다!', '#8e44ad');
    }

    // 활성 효과 차감
    if (activeEffects.coinBoost > 0) activeEffects.coinBoost--;
    if (activeEffects.speedBoost > 0) activeEffects.speedBoost--;
    if (activeEffects.guaranteeRare > 0) activeEffects.guaranteeRare--;
    if (activeEffects.ultimateBoost > 0) activeEffects.ultimateBoost--;

    updateStatsDisplay();
    updateActiveEffectsDisplay();
}

/**
 * 모든 등급의 아이템 목록을 가져와 캐시합니다.
 */
function cacheAllGameItems() {
    allGameItems = [];
    // 도감에 표시될 등급 순서 (우주 등급 포함)
    const gradeOrder = Object.keys(grades);
    const allGradeData = { ...grades, ...cosmicGrades };
    
    gradeOrder.forEach(gradeKey => {
        const grade = allGradeData[gradeKey];
        if (grade && grade.images) {
            grade.images.forEach(item => {
                allGameItems.push({
                    gradeKey: gradeKey,
                    gradeName: grade.name,
                    gradeColor: grade.color,
                    imagePath: item.path,
                    itemName: item.name
                });
            });
        }
    });
}

/**
 * 도감 모달을 토글합니다.
 */
function toggleCollection() {
    const modal = document.getElementById('collectionModal');
    const isVisible = modal.classList.contains('show');

    if (isVisible) {
        modal.classList.remove('show');
    } else {
        renderCollection('all'); // 열 때 '전체' 뷰로 초기화
        modal.classList.add('show');
    }
}

/**
 * 설정 UI 및 이벤트 리스너 초기화
 */
function initSettings() {
    const musicToggle = document.getElementById('musicToggle');
    const graphicsSetting = document.getElementById('graphicsSetting');
    const bgMusic = document.getElementById('bgmPlayer');

    if (!musicToggle || !graphicsSetting || !bgMusic) return;

    // 초기 상태 설정 (stats.settings 객체가 로드된 후 호출되어야 함)
    const settings = stats.settings || { music: false, graphics: 'high' };
    musicToggle.checked = settings.music;
    graphicsSetting.value = settings.graphics || 'high';

    // 그래픽 설정 초기 상태 적용
    function applyGraphicsSetting(quality) {
        document.body.classList.remove('graphics-high', 'graphics-medium', 'graphics-low');
        if (quality) {
            document.body.classList.add(`graphics-${quality}`);
        }
    }
    applyGraphicsSetting(settings.graphics);

    // 음악 초기 상태 적용
    if (settings.music) {
        if (bgMusic.paused) {
            fadeAudio(bgMusic, 'in', 1000);
        }
    } else {
        fadeAudio(bgMusic, 'out', 1000);
    }

    // 음악 토글
    musicToggle.addEventListener('change', (e) => {
        stats.settings.music = e.target.checked;
        if (e.target.checked) {
            if (bgMusic.paused || bgMusic.volume === 0) {
                fadeAudio(bgMusic, 'in', 1500);
            }
        } else {
            fadeAudio(bgMusic, 'out', 1000);
        }
    });

    // 그래픽 품질 변경
    graphicsSetting.addEventListener('change', (e) => {
        stats.settings.graphics = e.target.value;
        applyGraphicsSetting(stats.settings.graphics);
    });
}

/**
 * 개발자용 디버깅 함수들 (콘솔에서 사용 가능)
 */
if (typeof window !== 'undefined') {
    window.debugShop = {
        // 코인 추가
        addCoins: function(amount) {
            stats.coins += amount;
            updateStatsDisplay();
            showNotification(`${amount} 코인이 추가되었습니다!`, '#ffd700');
        },
        
        // 효과 추가
        addEffect: function(effectName, duration) {
            if (activeEffects.hasOwnProperty(effectName)) {
                activeEffects[effectName] += duration;
                updateActiveEffectsDisplay();
                showNotification(`${getEffectName(effectName)} ${duration}회 추가!`, '#9b59b6');
            }
        },
        
        // 모든 효과 클리어
        clearEffects: function() {
            Object.keys(activeEffects).forEach(key => {
                activeEffects[key] = 0;
            });
            updateActiveEffectsDisplay();
            showNotification('모든 효과가 클리어되었습니다!', '#e74c3c');
        },
        
        // 현재 상태 출력
        showStatus: function() {
            console.log('=== 현재 상점 시스템 상태 ===');
            console.log('코인:', stats.coins);
            console.log('활성 효과:', activeEffects);
            console.log('구매한 아이템:', stats.itemsPurchased || 0);
            console.log('사용한 코인:', stats.coinsSpent || 0);
        }
    };
}

/**
 * 보안 캡챠를 표시합니다. (주기적 또는 봇 감지용)
 * @param {'periodic' | 'anti-cheat'} type - 캡챠의 종류
 */
function triggerSecurityCaptcha(type = 'anti-cheat') {
    const modal = document.getElementById('entryQuizModal');
    if (!modal) return;
    modal.dataset.captchaType = type; // 캡챠 종류를 데이터 속성으로 저장

    const h2 = modal.querySelector('h2');
    const p = modal.querySelector('p');

    if (type === 'periodic') {
        h2.textContent = '🔒 자리 확인';
        p.textContent = '게임 진행을 위해 아래 문자를 입력해주세요.';
    } else { // 'anti-cheat'
        h2.textContent = '🤖 봇 감지';
        p.textContent = '매크로 사용이 의심됩니다. 아래 문자를 입력해주세요.';
    }

    showEntryQuiz(); // 새 문자열 생성 및 포커스
    modal.style.display = 'flex';
}

let currentQuizString = '';

/**
 * 입장 퀴즈를 처리합니다.
 */
function handleEntryQuizSubmit() {
    const modal = document.getElementById('entryQuizModal');
    const inputEl = document.getElementById('entryQuizInput');
    const errorEl = document.getElementById('entryQuizError');
    const gameContainer = document.getElementById('gameContainer');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingTip = document.getElementById('loadingTip');

    if (verifyEntryQuiz(currentQuizString, inputEl.value)) {
        modal.style.display = 'none';

        if (!isGameInitialized) {
            // 로딩 화면 표시
            loadingScreen.style.display = 'flex';
            loadingTip.textContent = `💡 팁: ${fortuneMessages[Math.floor(Math.random() * fortuneMessages.length)]}`;

            // 비동기적으로 게임을 초기화하고 로딩 화면을 숨깁니다.
            setTimeout(() => {
                initializeGame();

                // 게임 리소스가 모두 로드된 후 1초 대기
                setTimeout(() => {
                    // 로딩 화면 숨기기 및 게임 컨테이너 표시
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        gameContainer.style.display = 'flex';
                    }, 500); // opacity transition 시간과 일치
                }, 1000); // 1초(1000ms) 대기
            }, 100); // 약간의 딜레이를 주어 로딩 화면이 먼저 렌더링되도록 합니다.
        }
    } else {
        errorEl.textContent = '입력이 올바르지 않습니다. 다시 시도해주세요.';
        showEntryQuiz(); // 새로운 퀴즈 생성

        // 안티치트 퀴즈 실패 시 의심 점수 추가
        if (modal.dataset.captchaType === 'anti-cheat') {
            if (typeof penaltyState !== 'undefined') {
                penaltyState.suspicionScore += 25; // 오답 페널티
                if (typeof updateSuspicionGaugeUI === 'function') {
                    updateSuspicionGaugeUI();
                }
            }
        }
    }
}

/**
 * 게임 입장 퀴즈를 표시합니다.
 */
function showEntryQuiz() {
    currentQuizString = generateRandomString(6);
    document.getElementById('entryQuizString').textContent = currentQuizString;
    document.getElementById('entryQuizInput').value = '';
    document.getElementById('entryQuizInput').focus();
}

/**
 * 행운의 덕담 로테이션 시스템을 초기화합니다.
 */
function initFortuneTeller() {
    const container = document.getElementById('fortuneContainer');
    if (!container || !fortuneMessages || fortuneMessages.length === 0) return;

    // 덕담에 사용할 빛나는 색상 목록
    const fortuneColors = [
        '#ff9a9e', '#fecfef', '#8fd3f4', '#a8e063', '#fddb92', '#fff1eb'
    ];
    let lastColor = null;

    let availableMessages = [...fortuneMessages];

    function showNextMessage() {
        // 이전 메시지 숨기기
        const oldMessage = container.querySelector('.fortune-message');
        if (oldMessage) {
            oldMessage.classList.remove('visible');
            oldMessage.classList.add('hidden');
            // 애니메이션이 끝난 후 DOM에서 제거
            setTimeout(() => {
                oldMessage.remove();
            }, 500); // CSS 애니메이션 시간과 동일하게 설정
        }

        // 사용 가능한 메시지가 없으면 초기화
        if (availableMessages.length === 0) {
            availableMessages = [...fortuneMessages];
        }

        // 다음 메시지 선택 및 표시
        const randomIndex = Math.floor(Math.random() * availableMessages.length);
        const nextMessage = availableMessages.splice(randomIndex, 1)[0]; // 선택된 메시지를 배열에서 제거

        // 새로운 메시지 요소 생성
        const newMessage = document.createElement('p');
        newMessage.className = 'fortune-message visible';
        newMessage.textContent = nextMessage;

        // 이전과 다른 랜덤 색상 선택
        let newColor;
        do {
            newColor = fortuneColors[Math.floor(Math.random() * fortuneColors.length)];
        } while (fortuneColors.length > 1 && newColor === lastColor);
        lastColor = newColor;

        // 선택된 색상으로 빛나는 효과 적용
        newMessage.style.color = newColor;
        newMessage.style.textShadow = `0 0 8px ${newColor}, 0 0 15px rgba(255, 255, 255, 0.5)`;

        container.appendChild(newMessage);
    }

    showNextMessage(); // 첫 메시지 즉시 표시
    setInterval(showNextMessage, 3000); // 3초마다 반복
}
/**
 * 봇 방지 퀴즈 시스템 초기화
 */
function initQuizSystem() {
    const submitButton = document.getElementById('quizSubmitButton');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            if (quiz.userAnswer !== null) {
                handleQuizResult(quiz.userAnswer === quiz.correctAnswer, false, quiz.type);
            }
        });
    }
}

/**
 * 의심 지수 게이지 UI를 업데이트합니다.
 */
function updateSuspicionGaugeUI() {
    const gaugeFill = document.getElementById('suspicionGauge');
    const scoreText = document.getElementById('suspicionScoreText');
    if (!gaugeFill || !scoreText) return;

    // penaltyState는 antiCheat.js에 정의되어 있습니다.
    const currentScore = penaltyState.suspicionScore;
    const maxScore = antiCheatConfig.SUSPICION_SCORE_THRESHOLDS.QUIZ; // 게이지는 퀴즈 발동 점수까지 채워집니다.
    
    const percentage = Math.min(100, (currentScore / maxScore) * 100);
    
    gaugeFill.style.width = `${percentage}%`;
    
    // 점수 비율에 따라 게이지 색상이 녹색 -> 노란색 -> 빨간색으로 변합니다.
    gaugeFill.style.backgroundPosition = `${100 - percentage}% 0`;

    scoreText.textContent = `${Math.round(currentScore)} / ${maxScore}`;
}

/**
 * 선택 모달의 이벤트 리스너를 초기화합니다.
 */
function initChoiceModalListeners() {
    const keepButton = document.getElementById('keepButton');
    const discardButton = document.getElementById('discardButton');

    if (!keepButton || !discardButton) return;

    keepButton.addEventListener('click', () => {
        if (!pendingGachaResult) return;
        if (stats.inventory.length >= stats.inventorySize) {
            showNotification('인벤토리가 가득 차서 보관할 수 없습니다.', '#e74c3c');
            return;
        }

        const { gradeKey, imagePath, itemName, grade, mutation } = pendingGachaResult;
        
        stats.inventory.push({ 
            gradeKey, imagePath, itemName, 
            gradeName: grade.name, gradeColor: grade.color, 
            mutation: mutation 
        });
        updateCommonStats(pendingGachaResult);
        updateInventoryButtonLabel();
        showNotification(`'${itemName}'을(를) 인벤토리에 보관했습니다.`, '#3498db');
        closeChoiceModal();
    });

    discardButton.addEventListener('click', () => {
        if (!pendingGachaResult) return;
        const { finalCoins, baseCoins } = pendingGachaResult;
        stats.coins += finalCoins;
        animateCoinsGained(finalCoins, finalCoins > baseCoins); // 향상된 애니메이션 호출
        updateCommonStats(pendingGachaResult);
        closeChoiceModal();
    });
}

/**
 * 랭킹 데이터를 가져와 화면에 표시합니다.
 */
async function fetchAndRenderRankings(criteria = 'coins') {
    const listEl = document.getElementById('rankingList');
    listEl.innerHTML = '<div class="loading">🏆 랭킹을 불러오는 중...</div>';

    const fieldMap = {
        coins: 'stats.coins',
        total: 'stats.total'
    };
    const orderByField = fieldMap[criteria] || 'stats.coins';

    try {
        // 상위 50명 랭킹 가져오기
        const snapshot = await db.collection('users').orderBy(orderByField, 'desc').limit(50).get();
        listEl.innerHTML = '';

        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            const userStats = data.stats || {};
            const profile = data.profile || {};
            const isCurrentUser = currentUser && doc.id === currentUser.uid;

            let value;
            switch (criteria) {
                case 'total':
                    value = `${(userStats.total || 0).toLocaleString()}회`;
                    break;
                default: // coins
                    value = `<span>${(userStats.coins || 0).toLocaleString()}</span><img src="assets/images/jaeho.jpg" alt="코인" class="rank-coin-icon">`;
            }

            const itemEl = document.createElement('div');
            itemEl.className = 'ranking-item';
            if (isCurrentUser) itemEl.classList.add('is-me');
            if (rank <= 3) itemEl.classList.add(`top-rank-${rank}`);

            itemEl.innerHTML = `
                <div class="rank-number">${rank}</div>
                <div class="rank-nickname">${profile.nickname || '이름없음'}</div>
                <div class="rank-coins">${value}</div>
            `;
            listEl.appendChild(itemEl);
            rank++;
        });

    } catch (error) {
        console.error("랭킹 로드 실패:", error);
        listEl.innerHTML = '<div class="loading" style="color: #e74c3c;">랭킹을 불러오는 데 실패했습니다.</div>';
    }
}

/**
 * 랭킹 시스템을 초기화합니다.
 */
function initRankingSystem() {
    fetchAndRenderRankings('coins'); // 페이지 로드 시 기본 '코인 랭킹'을 불러옵니다.

    const tabsContainer = document.querySelector('.ranking-tabs');
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.ranking-tab')) {
            document.querySelectorAll('.ranking-tab').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            fetchAndRenderRankings(e.target.dataset.criteria);
        }
    });
}

/**
 * 기존 함수들을 상점 시스템과 연동하도록 오버라이드
 */
function overrideFunctionsForShop() {
    // updateStatsDisplay 함수를 향상된 버전으로 교체  
    window.updateStatsDisplay = updateStatsDisplayEnhanced;
    
    // 코인 애니메이션 함수 교체
    window.animateCoinsGained = animateCoinsGainedEnhanced;
    
    // 리셋 함수 교체
    window.resetGame = resetGameWithShop;
}

/**
 * 코인 아이콘 클릭 이벤트 초기화
 */
function initCoinClickSound() {
    const coinIcon = document.querySelector('.coin-icon');
    const coinSound = document.getElementById('coinClickSound');
    
    if (coinIcon && coinSound) {
        coinIcon.addEventListener('click', () => {
            coinSound.currentTime = 0; // 소리를 처음부터 다시 재생
            coinSound.play().catch(e => console.log("사운드 재생 실패:", e));
        });
    }
}
/**
 * 페이지 로드 완료시 상점 시스템 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    // 가장 먼저 Firebase 인증 초기화
    initFirebaseAuth();

    // 일반적인 경우: 입장 퀴즈 표시
    showEntryQuiz();
    document.getElementById('entryQuizSubmit').addEventListener('click', handleEntryQuizSubmit);
    document.getElementById('entryQuizInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleEntryQuizSubmit();
        }
    });
});

/**
 * 화염 이벤트가 활성화 상태인지 확인합니다.
 * @returns {boolean}
 */
function isFlameEventActive() {
    // 개발자 강제 실행 확인
    if (window.isFlameEventForced) {
        return true;
    }

    const kstNow = getKSTDate(new Date());
    const hours = kstNow.getHours();
    const minutes = kstNow.getMinutes();

    // 매 2시간마다 정각부터 10분간 (0, 2, 4, ..., 22시)
    return hours % 2 === 0 && minutes < 10;
}

/**
 * 현재 시간을 한국 표준시(KST) Date 객체로 변환합니다.
 * @param {Date} date - 변환할 Date 객체
 * @returns {Date} KST Date 객체
 */
function getKSTDate(date) {
    const kstOffset = 9 * 60;
    const localOffset = -date.getTimezoneOffset();
    const kstNow = new Date(date.getTime() + (kstOffset - localOffset) * 60 * 1000);
    return kstNow;
}
function updateFlameEventUI() {
    const flameCountdownContainer = document.getElementById('flameEventCountdown');
    const flameCountdownTextEl = document.getElementById('flameCountdownText');
    const flameCountdownTimerEl = document.getElementById('flameCountdownTimer');
    const eventCountdownContainer = document.getElementById('eventCountdown'); // Get regular event countdown container
    const countdownTextEl = document.getElementById('countdownText'); // Get regular event countdown text
    const countdownTimerEl = document.getElementById('countdownTimer'); // Get regular event countdown timer

    if (!flameCountdownContainer || !flameCountdownTextEl || !flameCountdownTimerEl ||
        !eventCountdownContainer || !countdownTextEl || !countdownTimerEl) {
        return;
    }

    const now = new Date();
    const kstNow = getKSTDate(now);

    // 화염 이벤트 활성화 여부 확인
    const isFlameActive = isFlameEventActive();
    let timeLeft, endTime;

    document.body.classList.toggle('flame-event-active', isFlameActive);
    if (isFlameActive) {
        startFlameParticleEffect();
        // 화염 이벤트 타이머 표시, 일반 타이머 숨김
        flameCountdownContainer.style.display = 'flex'; // Use flex to center content
        eventCountdownContainer.style.display = 'none';
        if (window.isFlameEventForced) {
            // Firestore에 저장된 종료 시간을 사용
            endTime = window.flameEventForcedEndTime ? window.flameEventForcedEndTime.toDate() : new Date(now.getTime() + 10 * 60 * 1000);
        } else {
            // 매 2시간마다 정각부터 10분간
            const currentHour = kstNow.getHours();
            const nextEventEndMinute = 10; // 정각부터 10분까지
            endTime = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate(), currentHour, nextEventEndMinute, 0);
        }

        timeLeft = endTime.getTime() - now.getTime();

        if (timeLeft <= 0) {
            flameCountdownTextEl.textContent = '화염 이벤트';
            flameCountdownTimerEl.textContent = '종료!';
            return;
        }

        flameCountdownTextEl.textContent = '🔥 화염 이벤트 종료까지';

    } else {
        stopFlameParticleEffect();
        // 화염 이벤트가 아닐 때: 다음 화염 이벤트까지 카운트다운
        flameCountdownContainer.style.display = 'flex';
        eventCountdownContainer.style.display = 'flex'; // Use flex to center content

        const currentHour = kstNow.getHours();
        const nextEventHour = (Math.floor(currentHour / 2) + 1) * 2;
        
        endTime = new Date(kstNow.getTime());
        if (nextEventHour >= 24) {
            endTime.setDate(endTime.getDate() + 1);
            endTime.setHours(0, 0, 0, 0);
        } else {
            endTime.setHours(nextEventHour, 0, 0, 0);
        }
        
        timeLeft = endTime.getTime() - now.getTime();
        flameCountdownTextEl.textContent = '다음 화염 이벤트까지';
    }

    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    flameCountdownTimerEl.textContent =
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`;
}
/** 화염 이벤트 시스템 초기화 */
function initFlameEventSystem() {
    setInterval(updateFlameEventUI, 1000); // 1초마다 이벤트 상태 체크
    updateFlameEventUI(); // 초기 실행
}
/**
 * 닉네임이 없으면 모달을 표시하고, 있으면 UI를 업데이트합니다.
 * @param {object} profile - 사용자 프로필 객체
 */
function handleNickname(profile) {
    if (!profile || !profile.nickname) {
        showNicknameModal();
    } else {
        updateUserProfileDisplay(profile.nickname, currentUser.photoURL);
    }
}

/**
 * 닉네임 입력 모달을 표시합니다.
 * @param {string} [currentNickname=''] - 현재 닉네임 (수정 시 사용)
 */
function showNicknameModal(currentNickname = '') {
    const modal = document.getElementById('nicknameModal');
    const nicknameInput = document.getElementById('nicknameInput');
    const errorEl = document.getElementById('nicknameError');
    const titleEl = modal.querySelector('h2');

    if (currentNickname) {
        titleEl.textContent = '닉네임 변경';
        nicknameInput.value = currentNickname;
    }
    
    errorEl.textContent = ''; // 이전 오류 메시지 초기화
    modal.classList.add('show');
}

/**
 * 닉네임 입력 모달을 닫습니다.
 */
function closeNicknameModal() {
    document.getElementById('nicknameModal').classList.remove('show');
}

/**
 * 사용자 프로필 UI를 업데이트합니다.
 * @param {string} nickname - 표시할 닉네임
 * @param {string} photoURL - 프로필 사진 URL
 */
function updateUserProfileDisplay(nickname, photoURL) {
    const userProfile = document.getElementById('userProfile');
    userProfile.innerHTML = `
        <img src="${photoURL}" alt="프로필 사진">
        <span>${nickname}</span>
    `;
}

/**
 * 닉네임을 Firestore에 저장합니다.
 */
async function saveNickname() {
    const nicknameInput = document.getElementById('nicknameInput');
    const errorEl = document.getElementById('nicknameError');
    const nickname = nicknameInput.value.trim();

    if (nickname.length < 2 || nickname.length > 10) {
        errorEl.textContent = '닉네임은 2자 이상 10자 이하로 입력해주세요.';
        return;
    }
    errorEl.textContent = '';

    if (currentUser) {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        try {
            await userDocRef.set({
                profile: { nickname: nickname }
            }, { merge: true });

            closeNicknameModal();
            updateUserProfileDisplay(nickname, currentUser.photoURL);
            showNotification('닉네임이 저장되었습니다!', '#2ecc71');
        } catch (error) {
            console.error("닉네임 저장 실패:", error);
            showNotification('닉네임 저장에 실패했습니다.', '#e74c3c');
        }
    }
}

/**
 * 로그인 모달을 표시합니다.
 */
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    const container = document.getElementById('previousLoginsContainer'); // 이전 로그인 목록 컨테이너
    container.innerHTML = '<p>Google 계정으로 로그인을 진행해주세요.</p>'; // 안내 문구 변경

    document.getElementById('addAccountButton').onclick = () => signInWithGoogle();
    modal.classList.add('show');
}

/**
 * 로그인 모달을 닫습니다.
 */
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('show');
}