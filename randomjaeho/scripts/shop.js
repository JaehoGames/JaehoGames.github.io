// scripts/shop.js

/**
 * 상점 시스템을 초기화합니다.
 */
function initShopSystem() {
    const shopModal = document.getElementById('shopModal');
    if (shopModal) {
        // 모달 외부 클릭 시 닫기
        shopModal.addEventListener('click', function(e) {
            if (e.target === shopModal) {
                toggleShop();
            }
        });
    }
    initShopHoverEffects();
    updateActiveEffectsDisplay();
    updateShopButtons();
}

/**
 * 기존 함수들을 상점 시스템과 연동하도록 오버라이드합니다.
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
 * 상점 모달을 토글합니다.
 */
function toggleShop() {
    const shopModal = document.getElementById('shopModal');
    if (!shopModal) return;

    if (shopModal.classList.contains('show')) {
        shopModal.classList.remove('show');
    } else {
        shopModal.classList.add('show');
        // 상점 열 때 UI 업데이트
        updateActiveEffectsDisplay();
        updateShopButtons();
    }
}

/**
 * 아이템을 구매합니다.
 * @param {string} itemId - 구매할 아이템의 ID
 */
function buyItem(itemId) {
    const item = shopItems[itemId];
    if (!item) return;

    if (stats.coins < item.price) {
        showNotification('재호코인이 부족합니다!', '#e74c3c');
        const button = document.querySelector(`[data-item="${itemId}"] .buy-button`);
        if (button) {
            button.classList.add('insufficient-coins');
            setTimeout(() => button.classList.remove('insufficient-coins'), 500);
        }
        return;
    }

    stats.coins -= item.price;
    stats.itemsPurchased = (stats.itemsPurchased || 0) + 1;
    stats.coinsSpent = (stats.coinsSpent || 0) + item.price;

    if (item.effect === 'expandInventory') {
        stats.inventorySize = (stats.inventorySize || 5) + 1;
        updateInventoryDisplay();
        showNotification('인벤토리가 1칸 영구적으로 늘어났습니다!', item.color);
    } else {
        const duration = item.duration === 'random' ? Math.floor(Math.random() * 3) + 1 : item.duration;
        activeEffects[item.effect] = (activeEffects[item.effect] || 0) + duration;
        showNotification(`${item.name} 구매 완료! ${duration}회 사용 가능`, item.color);
        animateEffectActivation(item.effect, duration);
    }

    updateStatsDisplayEnhanced();
    updateActiveEffectsDisplay();
    updateShopButtons();
    playPurchaseEffect(itemId);
}

/**
 * 활성화된 효과 목록 UI를 업데이트합니다.
 */
function updateActiveEffectsDisplay() {
    const effectsList = document.getElementById('effectsList');
    if (!effectsList) return;

    const activeList = Object.entries(activeEffects)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => {
            const itemKey = Object.keys(shopItems).find(id => shopItems[id].effect === key);
            const item = shopItems[itemKey];
            return `
            <div class="effect-tag">
                <span>${item?.icon || '✨'}</span>
                <span>${getEffectName(key)} (${value})</span>
            </div>`;
        })
        .join('');

    effectsList.innerHTML = activeList.length > 0 ? activeList : '<p class="no-effects">활성 효과가 없습니다</p>';
}

/**
 * 상점의 구매 버튼 상태를 업데이트합니다.
 */
function updateShopButtons() {
    Object.keys(shopItems).forEach(itemId => {
        const button = document.querySelector(`[data-item="${itemId}"] .buy-button`);
        if (button) {
            const item = shopItems[itemId];
            button.disabled = stats.coins < item.price;
        }
    });
}

/**
 * 효과 키에 해당하는 이름을 반환합니다.
 * @param {string} effectKey - 효과 키
 * @returns {string} 효과 이름
 */
function getEffectName(effectKey) {
    const names = {
        'speedBoost': '신속 부스트',
        'coinBoost': '코인 부스트',
        'guaranteeRare': '레어 보장',
        'ultimateBoost': '얼티밋 찬스'
    };
    return names[effectKey] || effectKey;
}

/**
 * 상점 아이템 호버 효과를 초기화합니다.
 */
function initShopHoverEffects() {
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.item-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.item-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

/**
 * 효과 활성화 시 애니메이션을 재생합니다.
 * @param {string} effectType - 효과 타입
 * @param {number} duration - 지속 시간
 */
function animateEffectActivation(effectType, duration) {
    const effectsContainer = document.getElementById('effectsList');
    if (!effectsContainer) return;

    setTimeout(() => {
        const effectTags = effectsContainer.querySelectorAll('.effect-tag');
        effectTags.forEach(tag => {
            if (tag.textContent.includes(getEffectName(effectType))) {
                tag.style.animation = 'none';
                tag.offsetHeight; // 리플로우 강제
                tag.style.animation = 'newEffectGlow 1s ease-out';
            }
        });
    }, 100);
}

/**
 * 아이템 구매 성공 시 특수 효과를 재생합니다.
 * @param {string} itemId - 구매한 아이템 ID
 */
function playPurchaseEffect(itemId) {
    const item = shopItems[itemId];
    if (!item) return;

    const colors = {
        ultimateChance: ['#0066ff', '#00aaff', '#ffffff'],
        guaranteedRare: ['#3498db', '#2980b9'],
        luckPotion: ['#2ecc71', '#27ae60'],
        mysteryBox: ['#9b59b6', '#8e44ad', '#e67e22']
    };

    createFireworks(colors[itemId] ? 15 : 5, colors[itemId] || [item.color]);

    try {
        const audio = new Audio('assets/audio/purchase.wav');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } catch (e) {}
}

/**
 * 향상된 통계 표시 업데이트 (상점 정보 포함)
 */
function updateStatsDisplayEnhanced() {
    document.getElementById('totalSpins').textContent = stats.total;
    document.getElementById('ancientCount').textContent = stats.ancient || 0;
    document.getElementById('ultimateJaehoCount').textContent = stats['ultimate-jaeho'] || 0;
    document.getElementById('divineCount').textContent = stats.divine || 0;
    document.getElementById('cosmicCount').textContent = stats.cosmic || 0;
    document.getElementById('mythicCount').textContent = stats.mythic || 0;
    document.getElementById('legendaryCount').textContent = stats.legendary || 0;
    document.getElementById('epicCount').textContent = stats.epic || 0;
    document.getElementById('rareCount').textContent = stats.rare || 0;
    document.getElementById('transcendenceCount').textContent = stats.transcendence || 0;
    
    updateCoinsDisplayEnhanced(stats.coins || 0);
    
    if (typeof updateExpandInventoryButton === 'function') {
        updateExpandInventoryButton();
    }
}

/**
 * 향상된 코인 표시 업데이트 (부스트 효과 포함)
 */
function updateCoinsDisplayEnhanced(newAmount, isBoost = false) {
    const coinAmount = document.getElementById('coinAmount');
    if (!coinAmount) return;
    
    coinAmount.textContent = newAmount.toLocaleString();
}

/**
 * 향상된 코인 획득 애니메이션 (부스트 표시)
 */
function animateCoinsGainedEnhanced(coins, isBoost = false) {
    const displayText = isBoost ? `+${coins.toLocaleString()} 코인 (2x 부스트!)` : `+${coins.toLocaleString()} 코인`;
    const color = isBoost ? '#f39c12' : '#ffd700';
    showCoinAnimation(displayText, color, isBoost); // utils.js에 정의된 함수 호출
}

/**
 * 게임 전체를 초기화합니다 (상점 관련 포함).
 */
function resetGameWithShop(showConfirm = true) {
    const performReset = () => {
        stats = { ...stats, total: 0, ancient: 0, 'ultimate-jaeho': 0, divine: 0, mythic: 0, legendary: 0, epic: 0, rare: 0, uncommon: 0, common: 0, coins: 0, inventory: [], itemsPurchased: 0, coinsSpent: 0, collectedItems: {}, hasCosmicKey: false, inventorySize: 5, cosmicFragments: 0, permanentLuck: 0 };
        activeEffects = { speedBoost: 0, coinBoost: 0 };
        penaltyState = { unlockTime: 0, detectionCount: 0, lastDetectionTime: 0, luckDebuff: { active: false, expiryTime: 0 } };
        
        document.getElementById('resultContainer').classList.remove('show');
        
        updateStatsDisplayEnhanced();
        updateActiveEffectsDisplay();
        updateShopButtons();
        updateProbabilityDisplay();
        updateInventoryDisplay();
        updateCosmicSpaceUI();
        if (showConfirm) showNotification('게임이 초기화되었습니다!', '#e74c3c');
    };

    if (showConfirm) {
        if (confirm('정말로 모든 게임 데이터(통계, 아이템, 수집 기록)를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            performReset();
            saveGameData(false);
        }
    } else {
        performReset();
    }
}