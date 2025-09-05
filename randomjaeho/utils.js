// 유틸리티 함수 모듈

/**
 * URL에서 통계 데이터를 로드
 */
function loadStatsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const statsData = urlParams.get('stats');
    
    if (statsData) {
        try {
            const decodedStats = JSON.parse(atob(statsData));
            stats = { ...stats, ...decodedStats };
            updateStatsDisplay();
        } catch (e) {
            console.log('통계 데이터 로드 실패');
        }
    }
}

/**
 * URL에 통계 데이터를 저장
 */
function saveStatsToURL() {
    const encodedStats = btoa(JSON.stringify(stats));
    const newURL = new URL(window.location);
    newURL.searchParams.set('stats', encodedStats);
    window.history.replaceState({}, '', newURL);
}

/**
 * 공유 가능한 URL 생성
 * @returns {string} 공유 URL
 */
function generateShareableURL() {
    const encodedStats = btoa(JSON.stringify(stats));
    const shareURL = new URL(window.location);
    shareURL.searchParams.set('stats', encodedStats);
    return shareURL.toString();
}

/**
 * 재호코인 표시 업데이트 (애니메이션 포함)
 * @param {number} newAmount - 새로운 코인 양
 */
function updateCoinsDisplay(newAmount) {
    const coinAmount = document.getElementById('coinAmount');
    if (!coinAmount) return;
    
    const currentAmount = parseInt(coinAmount.textContent) || 0;
    const difference = newAmount - currentAmount;
    
    if (difference === 0) return;
    
    // 숫자 카운트업 애니메이션
    const duration = Math.min(1000, Math.abs(difference) * 2);
    const steps = 60;
    const stepAmount = difference / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.round(currentAmount + (stepAmount * currentStep));
        coinAmount.textContent = currentValue.toLocaleString();
        
        if (currentStep >= steps) {
            clearInterval(interval);
            coinAmount.textContent = newAmount.toLocaleString();
        }
    }, duration / steps);
    
    // 변화가 있을 때 강조 효과
    if (difference > 0) {
        coinAmount.style.color = '#00ff00';
        setTimeout(() => {
            coinAmount.style.color = '#ffd700';
        }, 500);
    }
}

/**
 * 통계 표시 업데이트
 */
function updateStatsDisplay() {
    document.getElementById('totalSpins').textContent = stats.total;
    document.getElementById('ultimateJaehoCount').textContent = stats['ultimate-jaeho'];
    document.getElementById('divineCount').textContent = stats.divine;
    document.getElementById('mythicCount').textContent = stats.mythic;
    document.getElementById('legendaryCount').textContent = stats.legendary;
    document.getElementById('epicCount').textContent = stats.epic;
    document.getElementById('rareCount').textContent = stats.rare;
    
    // 재호코인 표시 업데이트
    updateCoinsDisplay(stats.coins || 0);
}

/**
 * 게임 초기화
 */
function resetGame() {
    if (confirm('정말로 모든 통계를 초기화하시겠습니까?')) {
        stats = {
            total: 0,
            'ultimate-jaeho': 0,
            divine: 0,
            mythic: 0,
            legendary: 0,
            epic: 0,
            rare: 0,
            uncommon: 0,
            common: 0,
            coins: 0
        };
        
        document.getElementById('resultContainer').classList.remove('show');
        updateStatsDisplay();
        saveStatsToURL();
    }
}

/**
 * 공유 URL 복사
 */
function copyShareURL() {
    const shareURL = generateShareableURL();
    
    // 클립보드 API 시도
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareURL).then(() => {
            showCopyMessage('✅ 복사됨!', '#2ecc71');
        }).catch(() => {
            showURLModal(shareURL);
        });
    } else {
        // 클립보드 API가 지원되지 않으면 모달로 표시
        showURLModal(shareURL);
    }
}

/**
 * 복사 완료 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} color - 메시지 색상
 */
function showCopyMessage(message, color) {
    const button = event.target;
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.textContent = message;
    button.style.background = `linear-gradient(45deg, ${color}, ${color})`;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground;
    }, 2000);
}

/**
 * URL 표시 모달 생성
 * @param {string} url - 표시할 URL
 */
function showURLModal(url) {
    // URL 표시용 모달 생성
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 90%;
        text-align: center;
        color: black;
    `;
    
    modalContent.innerHTML = `
        <h3>저장 링크</h3>
        <p>아래 링크를 복사하여 저장하세요:</p>
        <textarea style="width: 100%; height: 60px; margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;" readonly>${url}</textarea>
        <br>
        <button style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">확인</button>
    `;
    
    const closeButton = modalContent.querySelector('button');
    closeButton.onclick = () => modal.remove();
    
    // 텍스트 영역 클릭시 전체 선택
    const textarea = modalContent.querySelector('textarea');
    textarea.onclick = () => textarea.select();
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 배경 클릭시 닫기
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// 상점 관련 유틸리티 함수들 (utils.js 파일 끝에 추가)

/**
 * 향상된 코인 표시 업데이트 (부스트 효과 포함)
 */
function updateCoinsDisplayEnhanced(newAmount, isBoost = false) {
    const coinAmount = document.getElementById('coinAmount');
    if (!coinAmount) return;
    
    const currentAmount = parseInt(coinAmount.textContent.replace(/,/g, '')) || 0;
    const difference = newAmount - currentAmount;
    
    if (difference === 0) return;
    
    // 숫자 카운트업 애니메이션
    const duration = Math.min(1500, Math.abs(difference) * 3);
    const steps = 60;
    const stepAmount = difference / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.round(currentAmount + (stepAmount * currentStep));
        coinAmount.textContent = currentValue.toLocaleString();
        
        if (currentStep >= steps) {
            clearInterval(interval);
            coinAmount.textContent = newAmount.toLocaleString();
        }
    }, duration / steps);
    
    // 부스트 효과일 때 특별한 색상
    if (isBoost && difference > 0) {
        coinAmount.style.color = '#f39c12';
        coinAmount.style.textShadow = '0 0 10px #f39c12';
        setTimeout(() => {
            coinAmount.style.color = '#ffd700';
            coinAmount.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        }, 1000);
    } else if (difference > 0) {
        coinAmount.style.color = '#00ff00';
        setTimeout(() => {
            coinAmount.style.color = '#ffd700';
        }, 500);
    }
}

/**
 * 향상된 코인 획득 애니메이션 (부스트 표시)
 */
function animateCoinsGainedEnhanced(coins, isBoost = false) {
    const coinsDisplay = document.getElementById('coinsDisplay');
    const coinAnimation = document.createElement('div');
    
    const displayText = isBoost ? `+${coins} 코인 (2x 부스트!)` : `+${coins} 코인`;
    const color = isBoost ? '#f39c12' : '#ffd700';
    
    coinAnimation.textContent = displayText;
    coinAnimation.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: ${color};
        font-size: ${isBoost ? '1.8em' : '1.5em'};
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        z-index: 100;
        pointer-events: none;
        animation: ${isBoost ? 'coinBoostBounce' : 'coinBounce'} 2s ease-out forwards;
        ${isBoost ? 'text-decoration: underline;' : ''}
    `;
    
    // 부스트용 CSS 애니메이션 추가
    if (isBoost && !document.getElementById('coinBoostAnimationCSS')) {
        const style = document.createElement('style');
        style.id = 'coinBoostAnimationCSS';
        style.textContent = `
            @keyframes coinBoostBounce {
                0% {
                    transform: translate(-50%, -50%) scale(0) rotate(0deg);
                    opacity: 1;
                }
                25% {
                    transform: translate(-50%, -80px) scale(1.2) rotate(90deg);
                    opacity: 1;
                    color: #f39c12;
                }
                50% {
                    transform: translate(-50%, -100px) scale(1.8) rotate(180deg);
                    opacity: 1;
                    color: #e67e22;
                }
                75% {
                    transform: translate(-50%, -120px) scale(1.5) rotate(270deg);
                    opacity: 0.8;
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
 * 상점 데이터를 포함한 통계 저장
 */
function saveStatsToURLWithShop() {
    const fullData = {
        stats: stats,
        activeEffects: activeEffects,
        shopData: {
            itemsPurchased: stats.itemsPurchased || 0,
            coinsSpent: stats.coinsSpent || 0
        }
    };
    
    try {
        const encodedData = btoa(JSON.stringify(fullData));
        const newURL = new URL(window.location);
        newURL.searchParams.set('gamedata', encodedData);
        window.history.replaceState({}, '', newURL);
    } catch (e) {
        console.log('데이터 저장 실패');
    }
}

/**
 * 상점 데이터를 포함한 통계 로드
 */
function loadStatsFromURLWithShop() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 새로운 통합 데이터 형식 시도
    const gameData = urlParams.get('gamedata');
    if (gameData) {
        try {
            const decodedData = JSON.parse(atob(gameData));
            if (decodedData.stats) {
                stats = { ...stats, ...decodedData.stats };
            }
            if (decodedData.activeEffects) {
                activeEffects = { ...activeEffects, ...decodedData.activeEffects };
            }
            if (decodedData.shopData) {
                stats.itemsPurchased = decodedData.shopData.itemsPurchased || 0;
                stats.coinsSpent = decodedData.shopData.coinsSpent || 0;
            }
            updateStatsDisplay();
            updateActiveEffectsDisplay();
            return;
        } catch (e) {
            console.log('통합 데이터 로드 실패, 기존 방식으로 시도');
        }
    }
    
    // 기존 stats 데이터 로드
    const statsData = urlParams.get('stats');
    if (statsData) {
        try {
            const decodedStats = JSON.parse(atob(statsData));
            stats = { ...stats, ...decodedStats };
        } catch (e) {
            console.log('통계 데이터 로드 실패');
        }
    }
    
    // 기존 shop 데이터 로드
    const shopData = urlParams.get('shop');
    if (shopData) {
        try {
            const decodedShop = JSON.parse(atob(shopData));
            activeEffects = { ...activeEffects, ...decodedShop.activeEffects };
            stats.itemsPurchased = decodedShop.itemsPurchased || 0;
            stats.coinsSpent = decodedShop.coinsSpent || 0;
        } catch (e) {
            console.log('상점 데이터 로드 실패');
        }
    }
    
    updateStatsDisplay();
    updateActiveEffectsDisplay();
}

/**
 * 상점 포함 게임 초기화
 */
function resetGameWithShop() {
    if (confirm('정말로 모든 통계와 상점 효과를 초기화하시겠습니까?')) {
        stats = {
            total: 0,
            'ultimate-jaeho': 0,
            divine: 0,
            mythic: 0,
            legendary: 0,
            epic: 0,
            rare: 0,
            uncommon: 0,
            common: 0,
            coins: 0,
            itemsPurchased: 0,
            coinsSpent: 0
        };
        
        activeEffects = {
            luckBoost: 0,
            speedBoost: 0,
            coinBoost: 0,
            guaranteeRare: 0,
            ultimateBoost: 0
        };
        
        document.getElementById('resultContainer').classList.remove('show');
        updateStatsDisplay();
        updateActiveEffectsDisplay();
        updateShopButtons();
        saveStatsToURLWithShop();
        
        // localStorage 클리어
        try {
            localStorage.removeItem('randomJaehoShop');
        } catch (e) {
            // localStorage 사용 불가능한 환경에서는 무시
        }
        
        showNotification('게임이 초기화되었습니다!', '#e74c3c');
    }
}

/**
 * 상점 포함 공유 URL 생성
 */
function generateShareableURLWithShop() {
    const fullData = {
        stats: stats,
        activeEffects: activeEffects,
        shopData: {
            itemsPurchased: stats.itemsPurchased || 0,
            coinsSpent: stats.coinsSpent || 0
        }
    };
    
    const encodedData = btoa(JSON.stringify(fullData));
    const shareURL = new URL(window.location.origin + window.location.pathname);
    shareURL.searchParams.set('gamedata', encodedData);
    return shareURL.toString();
}

/**
 * 상점 포함 공유 URL 복사
 */
function copyShareURLWithShop() {
    const shareURL = generateShareableURLWithShop();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareURL).then(() => {
            showCopyMessage('✅ 저장 링크 복사 완료!', '#2ecc71');
        }).catch(() => {
            showURLModal(shareURL);
        });
    } else {
        showURLModal(shareURL);
    }
}

/**
 * 향상된 통계 표시 업데이트 (상점 정보 포함)
 */
function updateStatsDisplayEnhanced() {
    // 기본 통계 업데이트
    document.getElementById('totalSpins').textContent = stats.total;
    document.getElementById('ultimateJaehoCount').textContent = stats['ultimate-jaeho'];
    document.getElementById('divineCount').textContent = stats.divine;
    document.getElementById('mythicCount').textContent = stats.mythic;
    document.getElementById('legendaryCount').textContent = stats.legendary;
    document.getElementById('epicCount').textContent = stats.epic;
    document.getElementById('rareCount').textContent = stats.rare;
    
    // 코인 표시 업데이트
    updateCoinsDisplayEnhanced(stats.coins || 0);
    
    // 상점 통계가 있다면 표시 (옵션)
    const shopStats = document.getElementById('shopStats');
    if (shopStats) {
        shopStats.innerHTML = `
            <div class="shop-stat">구매한 아이템: ${stats.itemsPurchased || 0}개</div>
            <div class="shop-stat">사용한 코인: ${(stats.coinsSpent || 0).toLocaleString()}개</div>
        `;
    }
}