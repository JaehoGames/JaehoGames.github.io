// 가챠 핵심 로직 모듈

/**
 * 확률에 따라 랜덤 등급을 선택
 * @returns {string} 선택된 등급 키
 */
function getRandomGrade() {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [key, grade] of Object.entries(grades)) {
        cumulative += grade.probability;
        if (random <= cumulative) {
            return key;
        }
    }
    return 'common'; // 기본값
}

/**
 * 등급에서 랜덤 이미지를 선택
 * @param {string} gradeKey - 등급 키
 * @returns {string} 이미지 파일명
 */
function getRandomImage(gradeKey) {
    const grade = grades[gradeKey];
    if (!grade || !grade.images || grade.images.length === 0) {
        return 'placeholder.jpg'; // 기본 이미지
    }
    const randomIndex = Math.floor(Math.random() * grade.images.length);
    return grade.images[randomIndex];
}

/**
 * 이미지 로드 실패시 사용할 대체 이미지 생성
 * @param {string} color - 배경 색상
 * @param {string} text - 표시할 텍스트
 * @returns {string} Base64 인코딩된 이미지 데이터
 */
function createFallbackImage(color, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    // gradient 색상 처리
    if (color.includes('gradient')) {
        const gradient = ctx.createLinearGradient(0, 0, 180, 180);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.16, '#ff8800');
        gradient.addColorStop(0.33, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.66, '#0088ff');
        gradient.addColorStop(0.83, '#0000ff');
        gradient.addColorStop(1, '#8800ff');
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = color;
    }
    
    ctx.fillRect(0, 0, 180, 180);
    
    // 텍스트 그리기
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 90, 90);
    
    return canvas.toDataURL();
}

/**
 * 재호코인 획득 애니메이션
 * @param {number} coins - 획득한 코인 수
 */
function animateCoinsGained(coins) {
    const coinsDisplay = document.getElementById('coinsDisplay');
    const coinAnimation = document.createElement('div');
    
    coinAnimation.textContent = `+${coins} 코인`;
    coinAnimation.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ffd700;
        font-size: 1.5em;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        z-index: 100;
        pointer-events: none;
        animation: coinBounce 2s ease-out forwards;
    `;
    
    // CSS 애니메이션 동적 생성
    if (!document.getElementById('coinAnimationCSS')) {
        const style = document.createElement('style');
        style.id = 'coinAnimationCSS';
        style.textContent = `
            @keyframes coinBounce {
                0% {
                    transform: translate(-50%, -50%) scale(0) rotate(0deg);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -100px) scale(1.5) rotate(180deg);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -150px) scale(0.8) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.querySelector('.game-container').appendChild(coinAnimation);
    
    setTimeout(() => {
        coinAnimation.remove();
    }, 2000);
}

/**
 * 가챠 뽑기 메인 함수
 */
function pullGacha() {
    // DOM 요소들 가져오기
    const gachaBox = document.getElementById('gachaBox');
    const pullButton = document.getElementById('pullButton');
    const resultContainer = document.getElementById('resultContainer');
    const resultImage = document.getElementById('resultImage');
    const resultText = document.getElementById('resultText');
    const resultGrade = document.getElementById('resultGrade');
    const resultCoins = document.getElementById('resultCoins');
    
    // 필수 요소들이 존재하는지 확인
    if (!gachaBox || !pullButton || !resultContainer || !resultImage || !resultText || !resultGrade) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 음악 재생 (옵션)
    try {
        const bgMusic = document.getElementById("bgMusic");
        if (bgMusic) {
            bgMusic.play().catch(e => console.log('음악 재생 실패:', e));
        }
    } catch (e) {
        console.log('음악 재생 중 오류:', e);
    }
    
    // UI 상태 변경
    pullButton.disabled = true;
    pullButton.textContent = '🎲 뽑는 중...';
    resultContainer.classList.remove('show');
    gachaBox.classList.add('opening');

    // 2초 후 결과 표시
    setTimeout(() => {
        try {
            const resultGradeKey = getRandomGrade();
            const grade = grades[resultGradeKey];
            const imagePath = getRandomImage(resultGradeKey);
            const coinsGained = grade.coins || 0;

            // grades 데이터 검증
            if (!grade) {
                console.error('등급 데이터를 찾을 수 없습니다:', resultGradeKey);
                throw new Error('등급 데이터 오류');
            }

            // 통계 업데이트 (코인 포함)
            if (typeof stats !== 'undefined') {
                stats.total++;
                stats[resultGradeKey]++;
                stats.coins += coinsGained;  // 재호코인 추가
                if (typeof saveStatsToURL === 'function') {
                    saveStatsToURL();
                }
            }

            // 결과 이미지 설정
            resultImage.src = imagePath;
            resultImage.className = `result-image ${resultGradeKey}`;
            
            // 이미지 로드 실패시 대체 이미지 사용
            resultImage.onerror = function() {
                this.src = createFallbackImage(grade.color, grade.name);
            };

            // 결과 텍스트 설정
            resultText.textContent = `${grade.name} 등급!`;
            
            // 그라데이션 색상 처리
            if (grade.color.includes('gradient')) {
                resultText.style.background = grade.color;
                resultText.style.backgroundClip = 'text';
                resultText.style.webkitBackgroundClip = 'text';
                resultText.style.webkitTextFillColor = 'transparent';
                resultText.style.color = 'transparent';
            } else {
                resultText.style.color = grade.color;
                resultText.style.background = 'none';
                resultText.style.webkitTextFillColor = 'initial';
            }

            // 결과 표시 및 효과 적용
            resultContainer.classList.add('show');
            
            // 코인 획득 애니메이션
            animateCoinsGained(coinsGained);
            
            // 통계 표시 업데이트
            if (typeof updateStatsDisplay === 'function') {
                updateStatsDisplay();
            }
            
            // 특수 효과 적용
            if (typeof applySpecialEffects === 'function') {
                applySpecialEffects(resultGradeKey);
            }

            // 가챠 박스 애니메이션 종료
            setTimeout(() => {
                gachaBox.classList.remove('opening');
            }, 1000);
            
        } catch (error) {
            console.error('가챠 실행 중 오류:', error);
            // 오류 발생시 기본 상태로 복원
            resultText.textContent = '오류가 발생했습니다.';
            resultGrade.textContent = '다시 시도해주세요.';
            resultContainer.classList.add('show');
        }
        
        // 버튼 상태 복원
        pullButton.disabled = false;
        pullButton.textContent = '🎲 재호 뽑기';
    }, 2000);
}

// 상점 관련 함수들 (gacha.js 파일 끝에 추가)

/**
 * 확률 계산에 효과 적용 (기존 getRandomGrade 함수를 수정)
 */
function getRandomGradeWithEffects() {
    // 보장권 확인
    if (activeEffects.guaranteeRare > 0) {
        activeEffects.guaranteeRare--;
        // 레어 이상 등급 중에서 선택
        const rareGrades = ['rare', 'epic', 'legendary', 'mythic', 'divine', 'ultimate-jaeho'];
        const random = Math.random() * 100;
        
        if (random <= 0.01 && activeEffects.ultimateBoost > 0) return 'ultimate-jaeho';
        if (random <= 0.1) return 'divine';
        if (random <= 1.1) return 'mythic';
        if (random <= 4.1) return 'legendary';
        if (random <= 11.1) return 'epic';
        return 'rare';
    }
    
    // 얼티밋 부스트 확인
    if (activeEffects.ultimateBoost > 0) {
        const boostedUltimateChance = 0.01 * 10; // 10배 확률
        if (Math.random() * 100 <= boostedUltimateChance) {
            activeEffects.ultimateBoost--;
            return 'ultimate-jaeho';
        }
    }
    
    // 행운 포션 효과 적용
    let modifiedGrades = { ...grades };
    if (activeEffects.luckBoost > 0) {
        // 레어 이상 등급 확률 2배, 커먼/언커먼 확률 감소
        const rareAndAbove = ['rare', 'epic', 'legendary', 'mythic', 'divine', 'ultimate-jaeho'];
        const totalRareProb = rareAndAbove.reduce((sum, grade) => sum + grades[grade].probability, 0);
        const boostedRareProb = totalRareProb * 2;
        const reductionFactor = (100 - boostedRareProb) / (100 - totalRareProb);
        
        // 확률 재계산
        for (const [key, grade] of Object.entries(modifiedGrades)) {
            if (rareAndAbove.includes(key)) {
                modifiedGrades[key] = { ...grade, probability: grade.probability * 2 };
            } else {
                modifiedGrades[key] = { ...grade, probability: grade.probability * reductionFactor };
            }
        }
    }
    
    // 일반 확률 계산
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [key, grade] of Object.entries(modifiedGrades)) {
        cumulative += grade.probability;
        if (random <= cumulative) {
            return key;
        }
    }
    return 'common';
}

/**
 * 코인 계산에 효과 적용
 */
function calculateCoinsWithEffects(baseCoins) {
    let finalCoins = baseCoins;
    
    if (activeEffects.coinBoost > 0) {
        finalCoins *= 2;
        activeEffects.coinBoost--;
    }
    
    return finalCoins;
}

/**
 * 뽑기 속도 조절
 */
function getGachaSpeed() {
    if (activeEffects.speedBoost > 0) {
        activeEffects.speedBoost--;
        return 1000; // 절반 속도 (원래 2000ms -> 1000ms)
    }
    return 2000; // 기본 속도
}

/**
 * 미스터리 박스 효과 처리
 */
function applyMysteryBoxEffect() {
    const effects = ['luckBoost', 'speedBoost', 'coinBoost'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    const duration = Math.floor(Math.random() * 3) + 1; // 1-3회
    
    activeEffects[randomEffect] += duration;
    
    showNotification(`미스터리 박스 효과: ${getEffectName(randomEffect)} ${duration}회 획득!`, '#9b59b6');
}

/**
 * 효과 이름 반환
 */
function getEffectName(effectKey) {
    const names = {
        'luckBoost': '행운 부스트',
        'speedBoost': '신속 부스트', 
        'coinBoost': '코인 부스트',
        'guaranteeRare': '레어 보장',
        'ultimateBoost': '얼티밋 찬스'
    };
    return names[effectKey] || effectKey;
}

/**
 * 아이템 구매 함수
 */
function buyItem(itemId) {
    const item = shopItems[itemId];
    if (!item) return;
    
    // 코인 부족 체크
    if (stats.coins < item.price) {
        showNotification('재호코인이 부족합니다!', '#e74c3c');
        const button = document.querySelector(`[data-item="${itemId}"] .buy-button`);
        if (button) {
            button.classList.add('insufficient-coins');
            setTimeout(() => button.classList.remove('insufficient-coins'), 500);
        }
        return;
    }
    
    // 코인 차감
    stats.coins -= item.price;
    stats.itemsPurchased = (stats.itemsPurchased || 0) + 1;
    stats.coinsSpent = (stats.coinsSpent || 0) + item.price;
    
    // 효과 적용
    if (item.effect === 'mysteryBonus') {
        applyMysteryBoxEffect();
    } else {
        const duration = item.duration === 'random' ? Math.floor(Math.random() * 3) + 1 : item.duration;
        activeEffects[item.effect] = (activeEffects[item.effect] || 0) + duration;
        showNotification(`${item.name} 구매 완료! ${duration}회 사용 가능`, item.color);
    }
    
    // UI 업데이트
    updateStatsDisplay();
    updateActiveEffectsDisplay();
    updateShopButtons();
    saveStatsToURL();
    
    // 구매 성공 애니메이션
    const button = document.querySelector(`[data-item="${itemId}"] .buy-button`);
    if (button) {
        button.classList.add('purchase-success');
        setTimeout(() => button.classList.remove('purchase-success'), 600);
    }
}

/**
 * 알림 메시지 표시
 */
function showNotification(message, color = '#2ecc71') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-out 2.7s;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    notification.textContent = message;
    
    // 애니메이션 CSS 동적 추가
    if (!document.getElementById('notificationCSS')) {
        const style = document.createElement('style');
        style.id = 'notificationCSS';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

/**
 * 활성 효과 표시 업데이트
 */
function updateActiveEffectsDisplay() {
    const effectsList = document.getElementById('effectsList');
    if (!effectsList) return;
    
    const activeList = Object.entries(activeEffects)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => `
            <div class="effect-tag">
                <span>${shopItems[Object.keys(shopItems).find(id => shopItems[id].effect === key)]?.icon || '✨'}</span>
                <span>${getEffectName(key)} (${value})</span>
            </div>
        `);
    
    if (activeList.length === 0) {
        effectsList.innerHTML = '<p class="no-effects">활성 효과가 없습니다</p>';
    } else {
        effectsList.innerHTML = activeList.join('');
    }
}

/**
 * 상점 버튼 상태 업데이트
 */
function updateShopButtons() {
    Object.keys(shopItems).forEach(itemId => {
        const button = document.querySelector(`[data-item="${itemId}"] .buy-button`);
        if (button) {
            const item = shopItems[itemId];
            button.disabled = stats.coins < item.price;
            button.textContent = stats.coins < item.price ? '코인 부족' : '구매';
        }
    });
}