// scripts/fusion.js

let fusionSelections = []; // { invIndex: number, item: object }

/**
 * 재호 합성소 시스템을 초기화하고 이벤트 리스너를 설정합니다.
 */
function initFusionSystem() {
    // 모달 내의 이벤트 위임을 사용하여 리스너를 설정합니다.
    const fusionModal = document.getElementById('fusionModal');
    if (fusionModal) {
        fusionModal.addEventListener('click', (e) => {
            if (e.target.closest('.fusion-inventory-item')) {
                handleFusionInventoryClick(e);
            } else if (e.target.closest('.fusion-slot[data-slot-index]')) {
                handleFusionSlotClick(e);
            }
        });
    }

    const fuseButton = document.getElementById('fuseButton');
    if (fuseButton) {
        fuseButton.addEventListener('click', executeFusion);
    }
}

/**
 * 합성소 모달을 토글합니다.
 */
function toggleFusionModal() {
    const modal = document.getElementById('fusionModal');
    const isVisible = modal.classList.contains('show');

    if (isVisible) {
        modal.classList.remove('show');
    } else {
        fusionSelections = []; // 열 때마다 선택 초기화
        renderFusionUI();
        modal.classList.add('show');
    }
}

/**
 * 합성소 UI를 렌더링합니다.
 */
function renderFusionUI() {
    const inventoryGrid = document.getElementById('fusionInventoryGrid');
    const fusionSlotsContainer = document.getElementById('fusionSlots');
    
    inventoryGrid.innerHTML = '';
    stats.inventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'fusion-inventory-item';
        
        const isSelected = fusionSelections.some(sel => sel.invIndex === index);
        if (isSelected) {
            itemDiv.classList.add('selected');
        }

        itemDiv.innerHTML = `<img src="${item.imagePath}" alt="${item.itemName}"><div class="fusion-inventory-item-name">${item.itemName}</div>`;
        itemDiv.style.borderColor = item.gradeColor.includes('gradient') ? '#fff' : item.gradeColor;
        itemDiv.dataset.invIndex = index;
        inventoryGrid.appendChild(itemDiv);
    });

    fusionSlotsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'fusion-slot';
        slotDiv.dataset.slotIndex = i;

        if (fusionSelections[i]) {
            const item = fusionSelections[i].item;
            slotDiv.innerHTML = `<img src="${item.imagePath}" alt="${item.itemName}"><div class="fusion-slot-item-name">${item.itemName}</div>`;
            slotDiv.style.borderColor = item.gradeColor.includes('gradient') ? '#fff' : item.gradeColor;
        }
        fusionSlotsContainer.appendChild(slotDiv);
    }
    
    updateFusionState();
}

function handleFusionInventoryClick(e) {
    const target = e.target.closest('.fusion-inventory-item');
    if (!target || target.classList.contains('selected')) return;

    if (fusionSelections.length >= 3) {
        showNotification('조합 슬롯이 가득 찼습니다.', '#e74c3c');
        return;
    }

    const invIndex = parseInt(target.dataset.invIndex);
    const item = stats.inventory[invIndex];
    fusionSelections.push({ invIndex, item });
    renderFusionUI();
}

function handleFusionSlotClick(e) {
    const target = e.target.closest('.fusion-slot');
    if (!target || !target.dataset.slotIndex) return;

    const slotIndex = parseInt(target.dataset.slotIndex);
    if (fusionSelections[slotIndex]) {
        fusionSelections.splice(slotIndex, 1);
        renderFusionUI();
    }
}

function updateFusionState() {
    const fuseButton = document.getElementById('fuseButton');
    const resultSlot = document.getElementById('fusionResultSlot');
    resultSlot.innerHTML = '';
    resultSlot.style.borderStyle = 'dashed';
    fuseButton.disabled = true;

    if (fusionSelections.length !== 3) return;

    const firstGrade = fusionSelections[0].item.gradeKey;
    const allSameGrade = fusionSelections.every(sel => sel.item.gradeKey === firstGrade);
    
    const gradeIndex = gradeOrderForFusion.indexOf(firstGrade);
    const isFusable = gradeIndex > -1 && gradeIndex < gradeOrderForFusion.length - 1;

    if (allSameGrade && isFusable) {
        fuseButton.disabled = false;
        
        const nextGradeKey = gradeOrderForFusion[gradeIndex + 1];
        const nextGrade = grades[nextGradeKey];
        resultSlot.innerHTML = `<div style="color: ${nextGrade.color.includes('gradient') ? 'white' : nextGrade.color}; font-weight: bold; font-size: 0.9em; text-align: center;">${nextGrade.name}</div>`;
        resultSlot.style.borderColor = nextGrade.color.includes('gradient') ? '#fff' : nextGrade.color;
        resultSlot.style.borderStyle = 'solid';
    }
}

function executeFusion() {
    const fuseButton = document.getElementById('fuseButton');
    if (fuseButton.disabled) return;

    const indicesToRemove = fusionSelections.map(sel => sel.invIndex).sort((a, b) => b - a);
    indicesToRemove.forEach(index => {
        stats.inventory.splice(index, 1);
    });

    const gradeIndex = gradeOrderForFusion.indexOf(fusionSelections[0].item.gradeKey);
    const nextGradeKey = gradeOrderForFusion[gradeIndex + 1];
    const nextGrade = grades[nextGradeKey];
    const newItemData = getRandomImage(nextGradeKey); // {path, name}
    
    // 합성 결과물에는 변이가 적용되지 않음
    const newItem = { 
        gradeKey: nextGradeKey, imagePath: newItemData.path, itemName: newItemData.name, 
        gradeName: nextGrade.name, gradeColor: nextGrade.color, mutation: null 
    };

    stats.inventory.push(newItem);
    if (!stats.collectedItems) stats.collectedItems = {};
    stats.collectedItems[newItem.imagePath] = true;
    
    toggleFusionModal();
    updateInventoryDisplay();
    showNotification(`합성 성공! '${newItem.itemName}' 획득!`, '#2ecc71');
}