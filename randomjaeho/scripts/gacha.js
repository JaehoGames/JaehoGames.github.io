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
 * @returns {object} 아이템 객체 { path, name }
 */
function getRandomImage(gradeKey) {
    const grade = grades[gradeKey];
    if (!grade || !grade.images || grade.images.length === 0) {
        return { path: 'assets/images/ui/placeholder.jpg', name: '알 수 없음' }; // 기본 아이템
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
 * 뽑기 관련 UI의 상호작용 가능 여부를 설정합니다.
 * @param {boolean} interactable - 상호작용 가능 여부
 */
function setGachaInteractable(interactable) {
    const pullButton = document.getElementById('pullButton');
    const gachaBox = document.getElementById('gachaBox');
    
    pullButton.disabled = !interactable;
    gachaBox.style.pointerEvents = interactable ? 'auto' : 'none';
    gachaBox.style.cursor = interactable ? 'pointer' : 'default';
}

/**
 * 가챠 뽑기 메인 함수
 */
function pullGacha() {
    // 이 함수는 effects.js의 pullGachaWithEffects로 오버라이드됩니다.
    // 실제 로직은 그쪽을 확인해야 합니다.
    // 만약을 위해 경고를 남깁니다.
    console.warn("Direct call to pullGacha() detected. This function should be overridden.");
    // pullGachaWithEffects(event)를 호출해야 합니다.
    
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
            const item = getRandomImage(resultGradeKey);
            const imagePath = item.path;
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

/**
 * 미스터리 박스 효과 처리
 */
function applyMysteryBoxEffect() {
    const effects = ['speedBoost', 'coinBoost'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    const duration = Math.floor(Math.random() * 3) + 1; // 1-3회
    
    activeEffects[randomEffect] += duration;
    
    showNotification(`미스터리 박스 효과: ${getEffectName(randomEffect)} ${duration}회 획득!`, '#9b59b6');
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
    if (item.effect === 'expandInventory') { // 인벤토리 확장
        stats.inventorySize = (stats.inventorySize || 5) + 1;
        updateInventoryDisplay();
        showNotification('인벤토리가 1칸 영구적으로 늘어났습니다!', item.color);
    } else { // 일반적인 효과 아이템
        const duration = item.duration === 'random' ? Math.floor(Math.random() * 3) + 1 : item.duration;
        activeEffects[item.effect] = (activeEffects[item.effect] || 0) + duration;
        showNotification(`${item.name} 구매 완료! ${duration}회 사용 가능`, item.color);
    }
    
    // UI 업데이트
    if (typeof updateStatsDisplayEnhanced === 'function') {
        updateStatsDisplayEnhanced();
    } else if (typeof updateStatsDisplay === 'function') {
        updateStatsDisplay();
    }
    updateActiveEffectsDisplay();
    updateShopButtons();
    
    // 구매 성공 애니메이션
    const button = document.querySelector(`[data-item="${itemId}"] .buy-button`);
    if (button) {
        button.classList.add('purchase-success');
        setTimeout(() => button.classList.remove('purchase-success'), 600);
    }
}