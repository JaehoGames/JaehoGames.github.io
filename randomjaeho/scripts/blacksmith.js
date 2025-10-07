// scripts/blacksmith.js

/**
 * 대장간 시스템 관련 변수
 */
let selectedEnhancementItem = null; // { item: {...}, originalIndex: 0 }

const ENHANCEMENT_CONFIG = {
    // 강화 레벨: [성공 확률(%), 비용, 실패 시 파괴 여부]
    0: { chance: 95, cost: 100, destroyOnFail: false },
    1: { chance: 90, cost: 200, destroyOnFail: false },
    2: { chance: 80, cost: 400, destroyOnFail: false },
    3: { chance: 70, cost: 800, destroyOnFail: true },
    4: { chance: 60, cost: 1600, destroyOnFail: true },
    5: { chance: 50, cost: 3200, destroyOnFail: true },
    6: { chance: 40, cost: 6400, destroyOnFail: true },
    7: { chance: 30, cost: 12800, destroyOnFail: true },
    8: { chance: 20, cost: 25600, destroyOnFail: true },
    9: { chance: 10, cost: 51200, destroyOnFail: true },
    MAX_LEVEL: 10
};

/**
 * 대장간 시스템 초기화
 */
function initBlacksmithSystem() {
    const blacksmithButton = document.getElementById('blacksmithButton');
    const closeButton = document.getElementById('closeBlacksmithModal');
    const modal = document.getElementById('blacksmithModal');
    const enhanceButton = document.getElementById('enhanceButton');
    const enhancementSlot = document.getElementById('enhancementSlot');

    if (!blacksmithButton || !closeButton || !modal || !enhanceButton) return;

    blacksmithButton.addEventListener('click', openBlacksmithModal);
    closeButton.addEventListener('click', closeBlacksmithModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBlacksmithModal();
        }
    });
    enhanceButton.addEventListener('click', enhanceItem);
    enhancementSlot.addEventListener('click', () => {
        if (selectedEnhancementItem) {
            deselectItemForEnhancement();
        }
    });
}

/**
 * 대장간 모달 열기
 */
function openBlacksmithModal() {
    const modal = document.getElementById('blacksmithModal');
    if (!modal) return;

    modal.classList.add('show');
    renderBlacksmithInventory();
    resetEnhancementSlot();
}

/**
 * 대장간 모달 닫기
 */
function closeBlacksmithModal() {
    const modal = document.getElementById('blacksmithModal');
    if (!modal) return;

    modal.classList.remove('show');
    selectedEnhancementItem = null; // 선택된 아이템 초기화
}

/**
 * 대장간 인벤토리 렌더링
 */
function renderBlacksmithInventory() {
    const grid = document.getElementById('blacksmithInventoryGrid');
    if (!grid) return;

    grid.innerHTML = '';
    if (stats.inventory.length === 0) {
        grid.innerHTML = '<p class="empty-inventory-message">인벤토리가 비어있습니다.</p>';
        return;
    }

    stats.inventory.forEach((item, index) => {
        // 잠긴 아이템만 강화 불가
        const isEnhanceable = !item.locked;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'fusion-inventory-item'; // 합성소 스타일 재사용
        if (!isEnhanceable) {
            itemDiv.classList.add('disabled');
            itemDiv.style.cursor = 'not-allowed';
        }

        const enhancementLevel = item.enhancement || 0;
        const enhancementText = enhancementLevel > 0 ? `+${enhancementLevel}` : '';

        itemDiv.innerHTML = `
            <img src="${item.imagePath}" alt="${item.itemName}" style="border: 2px solid ${item.gradeColor};">
            <div class="fusion-inventory-item-name">${enhancementText} ${item.itemName}</div>
        `;

        if (isEnhanceable) {
            itemDiv.addEventListener('click', () => selectItemForEnhancement(item, index));
        }

        grid.appendChild(itemDiv);
    });
}

/**
 * 강화할 아이템 선택
 * @param {object} item - 선택된 아이템 객체
 * @param {number} index - 인벤토리에서의 아이템 인덱스
 */
function selectItemForEnhancement(item, index) {
    if (selectedEnhancementItem) {
        showNotification('이미 강화 슬롯에 아이템이 있습니다.', '#f39c12');
        return;
    }

    selectedEnhancementItem = { item: { ...item }, originalIndex: index };

    // 인벤토리에서 아이템 숨기기
    const inventoryItems = document.querySelectorAll('#blacksmithInventoryGrid .fusion-inventory-item');
    if (inventoryItems[index]) {
        inventoryItems[index].style.display = 'none';
    }

    updateEnhancementSlot();
}

/**
 * 강화 슬롯에서 아이템 제거
 */
function deselectItemForEnhancement() {
    if (!selectedEnhancementItem) return;

    // 인벤토리에서 아이템 다시 표시
    const inventoryItems = document.querySelectorAll('#blacksmithInventoryGrid .fusion-inventory-item');
    if (inventoryItems[selectedEnhancementItem.originalIndex]) {
        inventoryItems[selectedEnhancementItem.originalIndex].style.display = 'block';
    }

    resetEnhancementSlot();
}

/**
 * 강화 슬롯 및 정보 UI 업데이트
 */
function updateEnhancementSlot() {
    const slot = document.getElementById('enhancementSlot');
    const infoDiv = document.getElementById('enhancementInfo');
    const enhanceButton = document.getElementById('enhanceButton');
    const sellPriceEl = document.getElementById('currentSellPrice');

    if (!selectedEnhancementItem) {
        resetEnhancementSlot();
        return;
    }

    const { item } = selectedEnhancementItem;
    const currentLevel = item.enhancement || 0;
    const config = ENHANCEMENT_CONFIG[currentLevel];
    const currentSellPrice = calculateSellPrice(item); // 판매가 계산

    slot.innerHTML = `<img src="${item.imagePath}" alt="${item.itemName}">`;

    if (currentLevel >= ENHANCEMENT_CONFIG.MAX_LEVEL) {
        infoDiv.style.display = 'block';
        document.getElementById('currentEnhancementLevel').textContent = `${currentLevel} (최대)`;
        document.getElementById('successChance').textContent = '강화 불가';
        document.getElementById('enhancementCost').textContent = 'N/A';
        sellPriceEl.textContent = currentSellPrice.toLocaleString();
        document.querySelector('.failure-warning').style.display = 'none';
        enhanceButton.disabled = true;
    } else {
        infoDiv.style.display = 'block';
        document.getElementById('currentEnhancementLevel').textContent = currentLevel;
        document.getElementById('successChance').textContent = `${config.chance}%`;
        document.getElementById('enhancementCost').textContent = `${config.cost.toLocaleString()}`;
        sellPriceEl.textContent = currentSellPrice.toLocaleString();
        document.querySelector('.failure-warning').style.display = config.destroyOnFail ? 'block' : 'none';
        enhanceButton.disabled = stats.coins < config.cost;
    }
}

/**
 * 강화 슬롯 초기화
 */
function resetEnhancementSlot() {
    const slot = document.getElementById('enhancementSlot');
    const infoDiv = document.getElementById('enhancementInfo');
    const enhanceButton = document.getElementById('enhanceButton');

    selectedEnhancementItem = null;
    slot.innerHTML = '<span>강화할 아이템을<br>인벤토리에서 선택</span>';
    infoDiv.style.display = 'none';
    enhanceButton.disabled = true;
}

/**
 * 아이템 강화 시도
 */
function enhanceItem() {
    if (!selectedEnhancementItem) return;

    const { item, originalIndex } = selectedEnhancementItem;
    const currentLevel = item.enhancement || 0;

    if (currentLevel >= ENHANCEMENT_CONFIG.MAX_LEVEL) {
        showNotification('이미 최대 강화 레벨입니다.', '#f39c12');
        return;
    }

    const config = ENHANCEMENT_CONFIG[currentLevel];

    if (stats.coins < config.cost) {
        showNotification('코인이 부족합니다.', '#e74c3c');
        return;
    }

    // 강화 비용 지불
    stats.coins -= config.cost;
    updateStatsDisplay();

    const isSuccess = (Math.random() * 100) < config.chance;

    if (isSuccess) {
        // 강화 성공
        const newItem = { ...item, enhancement: currentLevel + 1 };
        stats.inventory[originalIndex] = newItem; // 실제 인벤토리 데이터 업데이트
        selectedEnhancementItem.item = newItem; // 선택된 아이템 정보도 업데이트

        showNotification(`🎉 강화 성공! +${newItem.enhancement} ${item.itemName}`, '#2ecc71');
        updateEnhancementSlot(); // UI 업데이트

    } else {
        // 강화 실패
        if (config.destroyOnFail) {
            // 아이템 파괴
            stats.inventory.splice(originalIndex, 1);
            showNotification(`💥 강화 실패... '${item.itemName}'이(가) 파괴되었습니다.`, '#e74c3c');
            resetEnhancementSlot();
            renderBlacksmithInventory(); // 인벤토리 새로고침
        } else {
            // 강화 레벨 유지
            showNotification(`💧 강화 실패... 하지만 아이템은 보존되었습니다.`, '#f39c12');
            // UI는 변경할 필요 없음
        }
    }

    // 강화 시도 후 결과를 즉시 저장하여 새로고침 방지
    saveGameData(false);

    // 강화 시도 후 버튼 상태 업데이트
    const nextLevel = selectedEnhancementItem ? (selectedEnhancementItem.item.enhancement || 0) : 0;
    if (nextLevel < ENHANCEMENT_CONFIG.MAX_LEVEL) {
        const nextConfig = ENHANCEMENT_CONFIG[nextLevel];
        document.getElementById('enhanceButton').disabled = stats.coins < nextConfig.cost;
    } else {
        document.getElementById('enhanceButton').disabled = true;
    }
}