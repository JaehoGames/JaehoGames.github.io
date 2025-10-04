// scripts/inventory.js

/**
 * 인벤토리 시스템을 초기화합니다.
 */
function initInventorySystem() {
    const openButton = document.getElementById('openInventoryButton');
    const closeDetailButton = document.getElementById('closeDetailedInventoryModal');
    const detailModal = document.getElementById('detailedInventoryModal');
    const expandButton = document.getElementById('expandInventoryBtn');

    if (openButton) openButton.addEventListener('click', toggleDetailedInventory);
    if (closeDetailButton) closeDetailButton.addEventListener('click', toggleDetailedInventory);
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) toggleDetailedInventory();
        });
    }
    if (expandButton) expandButton.addEventListener('click', expandInventory);
}

/**
 * 사이드바의 인벤토리 버튼 레이블을 업데이트합니다.
 */
function updateInventoryButtonLabel() {
    const buttonLabel = document.getElementById('inventoryButtonLabel');
    if (!buttonLabel) return;

    const inventory = stats.inventory || [];
    const maxSlots = stats.inventorySize || 5;
    buttonLabel.textContent = `인벤토리 (${inventory.length}/${maxSlots})`;
}

/**
 * 상세 인벤토리 모달을 토글합니다.
 */
function toggleDetailedInventory() {
    const modal = document.getElementById('detailedInventoryModal');
    if (!modal) return;

    const isVisible = modal.classList.contains('show');
    if (isVisible) {
        modal.classList.remove('show');
    } else {
        renderDetailedInventory();
        modal.classList.add('show');
    }
}

/**
 * 상세 인벤토리 UI를 렌더링합니다.
 */
function renderDetailedInventory() {
    const grid = document.getElementById('detailedInventoryGrid');
    const title = document.getElementById('detailedInventoryTitle');
    const inventory = stats.inventory || [];
    const maxSlots = stats.inventorySize || 5;

    if (!grid || !title) return;

    grid.innerHTML = ''; // 이전 내용 초기화
    title.textContent = `🎒 상세 인벤토리 (${inventory.length}/${maxSlots})`;

    if (inventory.length === 0) {
        grid.innerHTML = '<p class="empty-inventory-message">인벤토리가 비어있습니다.</p>';
        updateExpandInventoryButton(); // 인벤토리가 비어있어도 버튼 상태는 업데이트
        return;
    }
    updateExpandInventoryButton(); // 모달을 렌더링할 때 확장 버튼 상태도 업데이트
 
    inventory.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'detailed-inventory-item';
        itemEl.style.borderColor = item.gradeColor.includes('gradient') ? '#fff' : item.gradeColor;
 
        const finalSellPrice = calculateSellPrice(item);
        const { mutationInfoHTML, enhancementInfoHTML } = getItemInfoHTML(item);
 
        itemEl.innerHTML = `
            <div class="detailed-item-image-wrapper">
                <img src="${item.imagePath}" alt="${item.itemName}">
            </div>
            <div class="detailed-item-info">
                <div class="detailed-item-name">${item.itemName}</div>
                <div class="detailed-item-grade" style="color: ${item.gradeColor};">${item.gradeName}</div>
                ${enhancementInfoHTML}
                ${mutationInfoHTML}
            </div>
            <div class="detailed-item-actions">
                <button class="sell-button">판매 (+${finalSellPrice.toLocaleString()} 코인)</button>
                <button class="list-button">경매장 등록</button>
            </div>
        `;

        // 판매 버튼에 이벤트 리스너 추가
        itemEl.querySelector('.sell-button').addEventListener('click', () => {
            // 상세 인벤토리를 닫고 판매 확인 창을 띄웁니다.
            toggleDetailedInventory();
            // 약간의 딜레이를 주어 모달이 닫힌 후 confirm 창이 뜨도록 합니다.
            setTimeout(() => {
                sellItemFromInventory(index);
            }, 100);
        });

        // 경매장 등록 버튼에 이벤트 리스너 추가
        itemEl.querySelector('.list-button').addEventListener('click', () => {
            openListingPriceModal(index);
        });

        grid.appendChild(itemEl);
    });
}

/**
 * 인벤토리에서 아이템을 판매합니다.
 * @param {number} index - 판매할 아이템의 인벤토리 인덱스
 */
function sellItemFromInventory(index) {
    const item = stats.inventory[index];
    if (!item) return;

    const sellCoins = calculateSellPrice(item);
    const enhancementLevel = item.enhancement || 0;
    const enhancementText = enhancementLevel > 0 ? `+${enhancementLevel} ` : '';
    const confirmMessage = `'${enhancementText}${item.itemName}'을(를) 판매하고 ${sellCoins.toLocaleString()} 코인을 얻으시겠습니까?`;

    if (confirm(confirmMessage)) {
        stats.coins += sellCoins;
        stats.inventory.splice(index, 1); // 인벤토리에서 아이템 제거

        updateInventoryButtonLabel(); // 버튼 UI 업데이트
        updateStatsDisplay();
        // 상세 인벤토리가 열려있다면 그것도 업데이트
        if (document.getElementById('detailedInventoryModal')?.classList.contains('show')) {
            renderDetailedInventory();
        }
        showNotification(`'${item.itemName}' 판매 완료! +${sellCoins.toLocaleString()} 코인`, '#2ecc71');
    }
}

/**
 * 아이템의 판매 가격을 계산합니다. (변이, 강화 보너스 포함)
 * @param {object} item - 가격을 계산할 아이템 객체
 * @returns {number} 최종 판매 가격
 */
function calculateSellPrice(item) {
    if (!item) return 0;

    const itemGradeData = grades[item.gradeKey] || cosmicGrades[item.gradeKey];
    if (!itemGradeData) return 0;

    let basePrice = itemGradeData.coins;

    // 1. 변이 보너스 적용
    const mutation = item.mutation;
    if (Array.isArray(mutation) && mutation.length > 0) {
        mutation.forEach(m => {
            const config = MUTATION_CONFIG[m.toUpperCase()];
            if (config && config.coinMultiplier) {
                basePrice *= config.coinMultiplier;
            }
        });
    } else if (mutation && MUTATION_CONFIG[mutation.toUpperCase()]) { // 레거시 단일 변이 호환
        const config = MUTATION_CONFIG[mutation.toUpperCase()];
        if (config && config.coinMultiplier) {
            basePrice *= config.coinMultiplier;
        }
    }

    // 2. 강화 보너스 적용 (강화 레벨당 15% 추가)
    const enhancementLevel = item.enhancement || 0;
    if (enhancementLevel > 0) {
        // 변이 가격이 적용된 basePrice에 강화 보너스를 곱합니다.
        basePrice *= (1 + (enhancementLevel * 0.15));
    }
    return Math.floor(basePrice); // 최종 가격은 정수로 반환
}

/**
 * 아이템의 변이 및 강화 정보를 표시할 HTML 문자열을 생성합니다.
 * @param {object} item - 정보를 생성할 아이템 객체
 * @returns {{mutationInfoHTML: string, enhancementInfoHTML: string}}
 */
function getItemInfoHTML(item) {
    let mutationInfoHTML = '';
    const mutation = item.mutation;
    if (Array.isArray(mutation) && mutation.length > 0) {
        const mutationDetails = mutation.map(m => {
            const config = MUTATION_CONFIG[m.toUpperCase()] || {};
            const emoji = m.toLowerCase() === 'gold' ? '💰' : (m.toLowerCase() === 'rainbow' ? '🌈' : (m.toLowerCase() === 'flame' ? '🔥' : (m.toLowerCase() === 'danyu' ? '💧' : (m.toLowerCase() === 'neon' ? '💎' : '✨'))));
            return `<span class="mutation-text-${m.toLowerCase()}">${emoji} ${config.name}</span>`;
        }).join(' & ');
        mutationInfoHTML = `<div class="detailed-item-mutation">${mutationDetails}</div>`;
    }

    let enhancementInfoHTML = '';
    const enhancementLevel = item.enhancement || 0;
    if (enhancementLevel > 0) {
        enhancementInfoHTML = `<div class="detailed-item-enhancement">⚔️ +${enhancementLevel} 강화</div>`;
    }

    return { mutationInfoHTML, enhancementInfoHTML };
}
/**
 * 다음 인벤토리 확장 비용을 계산합니다.
 * @returns {number}
 */
function getInventoryExpansionCost() {
    const baseCost = 500;
    // (현재 크기 - 기본 크기) 만큼이 확장 횟수
    const expansions = (stats.inventorySize || 5) - 5;
    return Math.floor(baseCost * Math.pow(1.5, expansions));
}

/**
 * 인벤토리 확장 버튼의 상태(비용, 활성화 여부)를 업데이트합니다.
 */
function updateExpandInventoryButton() {
    const btn = document.getElementById('expandInventoryBtn');
    if (!btn) return;

    const cost = getInventoryExpansionCost();
    btn.innerHTML = `
        <span class="expand-text">슬롯 추가</span>
        <span class="expand-cost">💰 ${cost.toLocaleString()}</span>
    `;
    btn.disabled = stats.coins < cost;
}

/**
 * 인벤토리를 확장합니다.
 */
function expandInventory() {
    const cost = getInventoryExpansionCost();
    if (stats.coins < cost) {
        showNotification('코인이 부족합니다.', '#e74c3c');
        return;
    }

    if (confirm(`인벤토리를 확장하시겠습니까? (${cost.toLocaleString()} 코인)`)) {
        stats.coins -= cost;
        stats.inventorySize++;
        
        updateStatsDisplay();
        updateInventoryButtonLabel();
        if (document.getElementById('detailedInventoryModal').classList.contains('show')) {
            renderDetailedInventory();
        }
        showNotification('인벤토리가 1칸 늘어났습니다!', '#9b59b6');
    }
}
