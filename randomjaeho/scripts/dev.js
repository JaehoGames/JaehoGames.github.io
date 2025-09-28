// scripts/dev.js

/**
 * 개발자 패널 관련 기능
 */
function toggleDevPanel() {
    const devPage = document.getElementById('devPanelPage');
    const gameContainer = document.getElementById('gameContainer');

    if (devPage.style.display === 'none' || devPage.style.display === '') {
        devPage.style.display = 'flex';
        gameContainer.style.display = 'none';
        populateUserList(); // 패널을 열 때마다 유저 목록을 새로고침
    } else {
        devPage.style.display = 'none';
        gameContainer.style.display = 'flex';
    }
}

function initDevPanel() {
    // 이벤트 리스너 연결
    document.getElementById('sendItemGiftButton')?.addEventListener('click', sendItemGift);
    document.getElementById('sendCoinGiftButton')?.addEventListener('click', () => sendCurrencyGift('coins'));
    document.getElementById('sendFragmentGiftButton')?.addEventListener('click', () => sendCurrencyGift('cosmicFragments'));
    document.getElementById('closeDevPanelButton')?.addEventListener('click', toggleDevPanel);
    document.getElementById('targetUserSelect')?.addEventListener('change', (e) => inspectUser(e.target.value));
    document.getElementById('updateInventorySizeButton')?.addEventListener('click', updateUserInventorySize);
    document.getElementById('updateProbabilitiesButton')?.addEventListener('click', updateUserProbabilities);
    document.getElementById('updateMutationProbabilitiesButton')?.addEventListener('click', updateUserMutationProbabilities);
    document.getElementById('sendAnnouncementButton')?.addEventListener('click', sendAnnouncement);
    document.getElementById('resetProbabilitiesButton')?.addEventListener('click', resetProbabilitiesToDefault);
    document.getElementById('resetMutationProbabilitiesButton')?.addEventListener('click', resetMutationProbabilitiesToDefault);
    document.getElementById('forceRealEventButton')?.addEventListener('click', toggleRealEvent);
    document.getElementById('forceFlameEventButton')?.addEventListener('click', toggleFlameEvent);
    document.getElementById('refreshRepliesButton')?.addEventListener('click', fetchLatestAnnouncementReplies);

    // 아이템 선물 드롭다운 채우기
    const itemSelect = document.getElementById('giftItemSelect');
    if (itemSelect) {
        const allGradeData = { ...grades, ...cosmicGrades };
        Object.keys(allGradeData).forEach(gradeKey => {
            const grade = allGradeData[gradeKey];
            if (grade && grade.images) {
                grade.images.forEach(item => {
                    const option = document.createElement('option');
                    const itemData = {
                        gradeKey: gradeKey,
                        gradeName: grade.name,
                        gradeColor: grade.color,
                        imagePath: item.path,
                        itemName: item.name
                    };
                    option.value = JSON.stringify(itemData);
                    option.textContent = `[${grade.name}] ${item.name}`;
                    itemSelect.appendChild(option);
                });
            }
        });
    }
}

/**
 * Firestore에서 모든 유저 목록을 가져와 개발자 패널의 드롭다운을 채웁니다.
 */
async function populateUserList() {
    const selectEl = document.getElementById('targetUserSelect');
    const messageEl = document.getElementById('devPanelMessage');
    document.getElementById('userInspectorCard').style.display = 'none'; // 유저 선택 시 검사기 숨김
    if (!selectEl) return;

    selectEl.innerHTML = '<option>유저 목록을 불러오는 중...</option>';
    selectEl.disabled = true;
    messageEl.textContent = '';

    updateOnlineUsersList(); // 온라인 유저 목록도 함께 새로고침
    fetchLatestAnnouncementReplies(); // 공지 답장 목록도 함께 새로고침
    try {
        const usersSnapshot = await db.collection('users').get();
        selectEl.innerHTML = '<option value="">유저를 선택하세요...</option>';
        
        // '모든 유저' 옵션 추가
        const allUsersOption = document.createElement('option');
        allUsersOption.value = 'all';
        allUsersOption.textContent = '👑 모든 유저';
        selectEl.appendChild(allUsersOption);
        
        const users = [];
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            // 닉네임이 없는 경우를 대비하여 displayName이나 UID로 대체
            const nickname = data.profile?.nickname || data.profile?.displayName || `UID: ${doc.id.substring(0, 8)}`;
            users.push({ uid: doc.id, nickname: nickname });
        });

        // 닉네임으로 유저 목록 정렬
        users.sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko'));

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.uid;
            option.textContent = `${user.nickname} (${user.uid.substring(0, 6)}...)`;
            selectEl.appendChild(option);
        });

    } catch (error) {
        console.error("Error fetching user list:", error);
        selectEl.innerHTML = '<option value="">유저 목록 로드 실패</option>';
        messageEl.textContent = '유저 목록 로드에 실패했습니다.';
        messageEl.style.color = '#e74c3c';
    } finally {
        selectEl.disabled = false;
    }
}

/**
 * 개발자 패널에 현재 접속중인 유저 목록을 표시합니다.
 */
async function updateOnlineUsersList() {
    const listEl = document.getElementById('onlineUserList');
    const countEl = document.getElementById('onlineUserCount');
    if (!listEl || !countEl) return;

    listEl.innerHTML = '<p>유저 정보를 불러오는 중...</p>';
    countEl.textContent = '...';

    try {
        // 최근 5분 이내에 활동한 유저를 '온라인'으로 간주
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const snapshot = await db.collection('users')
                                 .where('lastLogin', '>', fiveMinutesAgo)
                                 .orderBy('lastLogin', 'desc')
                                 .get();

        if (snapshot.empty) {
            listEl.innerHTML = '<p style="color: #7f8c8d;">현재 접속중인 유저가 없습니다.</p>';
            countEl.textContent = '0';
            return;
        }

        listEl.innerHTML = ''; // 로딩 메시지 제거
        countEl.textContent = snapshot.size;

        snapshot.forEach(doc => {
            const userData = doc.data();
            const profile = userData.profile || {};
            const nickname = profile.nickname || profile.displayName || '이름없음';
            const photoURL = profile.photoURL || 'assets/images/jaeho.jpg';
            const lastSeen = formatTimeAgo(userData.lastLogin);

            const itemEl = document.createElement('div');
            itemEl.className = 'online-user-item';
            itemEl.innerHTML = `
                <div class="online-user-info">
                    <img src="${photoURL}" alt="${nickname}">
                    <div class="online-user-details">
                        <span class="online-user-nickname">${nickname}</span>
                        <span class="online-user-lastseen">${lastSeen}</span>
                    </div>
                </div>
            `;
            listEl.appendChild(itemEl);
        });

    } catch (error) {
        console.error("온라인 유저 목록 로드 실패:", error);
        listEl.innerHTML = '<p style="color: #e74c3c;">온라인 유저 목록을 불러오는 데 실패했습니다.</p>';
        countEl.textContent = '오류';
    }
}

async function inspectUser(uid) {
    const inspectorCard = document.getElementById('userInspectorCard');
    const inspectorNickname = document.getElementById('inspectorNickname');
    const messageEl = document.getElementById('inspectorPanelMessage');

    if (!uid) {
        inspectorCard.style.display = 'none';
        return;
    }

    inspectorCard.style.display = 'block';
    messageEl.textContent = '';

    // 인벤토리 관련 DOM 요소들을 가져옵니다.
    const inventorySection = document.getElementById('devUserInventoryGrid').closest('.dev-section');

    if (uid === 'all') {
        // '모든 유저' 선택 시
        inspectorNickname.textContent = '모든 유저 (기본값)';
        if (inventorySection) inventorySection.style.display = 'none'; // 인벤토리 섹션 숨기기

        // 확률 렌더링 (기본값으로)
        const probGrid = document.getElementById('devProbabilityGrid');
        probGrid.innerHTML = '';
        Object.keys(grades).forEach(gradeKey => {
            const grade = grades[gradeKey];
            const group = document.createElement('div');
            group.className = 'dev-form-group';
            group.innerHTML = `
                <label for="prob-${gradeKey}" style="color: ${grade.color.includes('gradient') ? 'white' : grade.color};">${grade.name}</label>
                <input type="number" id="prob-${gradeKey}" value="${grade.probability}" step="0.001" min="0">
            `;
            probGrid.appendChild(group);
        });

        // 변이 확률 렌더링 (기본값으로)
        const goldProbInput = document.getElementById('prob-mutation-gold');
        const rainbowProbInput = document.getElementById('prob-mutation-rainbow');
        const flameProbInput = document.getElementById('prob-mutation-flame');
        if (goldProbInput) goldProbInput.value = MUTATION_CONFIG.GOLD.probability;
        if (rainbowProbInput) rainbowProbInput.value = MUTATION_CONFIG.RAINBOW.probability;
        if (flameProbInput) flameProbInput.value = MUTATION_CONFIG.FLAME.probability;

        return; // 개별 유저 정보 로드는 여기서 중단
    }

    // 특정 유저 선택 시 (기존 로직)
    if (inventorySection) inventorySection.style.display = 'block'; // 인벤토리 섹션 보이기

    inspectorNickname.textContent = '로딩 중...';

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            throw new Error("해당 유저를 찾을 수 없습니다.");
        }

        const userData = userDoc.data();
        const userStats = userData.stats || {};
        const userProfile = userData.profile || {};

        inspectorNickname.textContent = userProfile.nickname || userProfile.displayName || '이름없음';

        // 인벤토리 렌더링
        const inventoryGrid = document.getElementById('devUserInventoryGrid');
        const inventoryCountEl = document.getElementById('devInventoryCount');
        const inventorySizeInput = document.getElementById('devInventorySize');
        const inventory = userStats.inventory || [];
        const inventorySize = userStats.inventorySize || 5;

        inventorySizeInput.value = inventorySize;
        inventoryCountEl.textContent = `${inventory.length}/${inventorySize}`;
        inventoryGrid.innerHTML = inventory.length > 0 ? '' : '<p style="color: #7f8c8d; grid-column: 1 / -1;">인벤토리가 비어있습니다.</p>';
        
        inventory.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'dev-inventory-item';
            itemDiv.style.border = `2px solid ${item.gradeColor}`;
            const lockIcon = item.locked ? '<div class="dev-inventory-lock-icon">🔒</div>' : '';
            itemDiv.innerHTML = `
                <img src="${item.imagePath}" alt="${item.itemName}">
                <div class="dev-inventory-item-name">${item.itemName}</div>
                ${lockIcon}
            `;
            inventoryGrid.appendChild(itemDiv);
        });

        // 확률 렌더링
        const probGrid = document.getElementById('devProbabilityGrid');
        probGrid.innerHTML = '';
        const customProbs = userStats.customProbabilities || {};

        Object.keys(grades).forEach(gradeKey => {
            const grade = grades[gradeKey];
            const currentProb = customProbs[gradeKey] ?? grade.probability;
            
            const group = document.createElement('div');
            group.className = 'dev-form-group';
            group.innerHTML = `
                <label for="prob-${gradeKey}" style="color: ${grade.color};">${grade.name}</label>
                <input type="number" id="prob-${gradeKey}" value="${currentProb}" step="0.001" min="0">
            `;
            probGrid.appendChild(group);
        });

        // 변이 확률 렌더링
        const customMutationProbs = userStats.customMutationProbabilities || {};
        const goldProbInput = document.getElementById('prob-mutation-gold');
        const rainbowProbInput = document.getElementById('prob-mutation-rainbow');
        const flameProbInput = document.getElementById('prob-mutation-flame');

        if (goldProbInput) {
            goldProbInput.value = customMutationProbs.gold ?? MUTATION_CONFIG.GOLD.probability;
        }
        if (rainbowProbInput) {
            rainbowProbInput.value = customMutationProbs.rainbow ?? MUTATION_CONFIG.RAINBOW.probability;
        }
        if (flameProbInput) {
            flameProbInput.value = customMutationProbs.flame ?? MUTATION_CONFIG.FLAME.probability;
        }

    } catch (error) {
        console.error("유저 정보 로드 실패:", error);
        messageEl.textContent = `유저 정보 로드 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

async function updateUserInventorySize() {
    const uid = document.getElementById('targetUserSelect').value;
    const newSize = parseInt(document.getElementById('devInventorySize').value);
    const messageEl = document.getElementById('inspectorPanelMessage');

    if (!uid || uid === 'all') {
        messageEl.textContent = '개별 유저를 선택해야 인벤토리 크기를 변경할 수 있습니다.';
        messageEl.style.color = '#e74c3c';
        return;
    }

    if (isNaN(newSize) || newSize < 0) {
        messageEl.textContent = '올바른 인벤토리 크기를 입력하세요.';
        messageEl.style.color = '#e74c3c';
        return;
    }

    try {
        await db.collection('users').doc(uid).update({ 'stats.inventorySize': newSize });
        messageEl.textContent = '인벤토리 크기가 성공적으로 업데이트되었습니다.';
        messageEl.style.color = '#2ecc71';
        inspectUser(uid); // 정보 새로고침
    } catch (error) {
        messageEl.textContent = `업데이트 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

async function sendItemGift() {
    const uid = document.getElementById('targetUserSelect').value;
    const itemSelect = document.getElementById('giftItemSelect');
    const messageEl = document.getElementById('devPanelMessage');

    if (!uid) {
        messageEl.textContent = '선물할 유저를 선택하세요.';
        messageEl.style.color = '#e74c3c';
        return;
    }

    try {
        const itemData = JSON.parse(itemSelect.value);

        if (uid === 'all') {
            // 모든 유저에게 보내기
            if (!confirm(`정말로 모든 유저에게 '${itemData.itemName}' 아이템을 보내시겠습니까? 이 작업은 되돌릴 수 없으며, 유저가 많을 경우 시간이 오래 걸릴 수 있습니다.`)) {
                return;
            }
            
            messageEl.textContent = '모든 유저에게 아이템을 보내는 중...';
            messageEl.style.color = '#f39c12';

            const usersSnapshot = await db.collection('users').get();
            const batch = db.batch();
            let successCount = 0;
            let failCount = 0;

            usersSnapshot.forEach(doc => {
                const userStats = doc.data().stats || {};
                const currentInventory = userStats.inventory || [];
                const inventorySize = userStats.inventorySize || 5;

                if (currentInventory.length < inventorySize) {
                    currentInventory.push({
                        gradeKey: itemData.gradeKey,
                        imagePath: itemData.imagePath,
                        itemName: itemData.itemName,
                        gradeName: itemData.gradeName,
                        gradeColor: itemData.gradeColor,
                        mutation: null // 선물은 변이 없음
                    });
                    successCount++;
                } else {
                    failCount++;
                }
            });

            await batch.commit();
            messageEl.textContent = `작업 완료: ${successCount}명에게 성공적으로 보냈습니다. (실패/인벤토리 가득참: ${failCount}명)`;
            messageEl.style.color = '#2ecc71';

        } else {
            // 특정 유저에게 보내기 (기존 로직)
            const userDocRef = db.collection('users').doc(uid);
            await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists) {
                    throw new Error("해당 유저를 찾을 수 없습니다.");
                }
                const userStats = userDoc.data().stats || {};
                const currentInventory = userStats.inventory || [];
                const inventorySize = userStats.inventorySize || 5;

                if (currentInventory.length >= inventorySize) {
                    throw new Error("대상의 인벤토리가 가득 찼습니다.");
                }
                
                currentInventory.push({
                    gradeKey: itemData.gradeKey,
                    imagePath: itemData.imagePath,
                    itemName: itemData.itemName,
                    gradeName: itemData.gradeName,
                    gradeColor: itemData.gradeColor,
                    mutation: null // 선물은 변이 없음
                });

                transaction.update(userDocRef, { "stats.inventory": currentInventory });
            });
            messageEl.textContent = `'${itemData.itemName}'을(를) 성공적으로 보냈습니다.`;
            messageEl.style.color = '#2ecc71';
        }

    } catch (error) {
        console.error("아이템 선물 보내기 실패:", error);
        messageEl.textContent = `선물 보내기 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

async function updateUserProbabilities() {
    const uid = document.getElementById('targetUserSelect').value;
    const messageEl = document.getElementById('inspectorPanelMessage');

    const newProbs = {};
    let totalProb = 0;
    try {
        Object.keys(grades).forEach(gradeKey => {
            const input = document.getElementById(`prob-${gradeKey}`);
            const probValue = parseFloat(input.value);
            if (isNaN(probValue) || probValue < 0) {
                throw new Error(`'${grades[gradeKey].name}' 등급에 유효하지 않은 확률 값입니다.`);
            }
            newProbs[gradeKey] = probValue;
            totalProb += probValue;
        });
        if (Math.abs(totalProb - 100) > 0.001) {
            throw new Error(`확률의 총합이 100이 되어야 합니다. (현재: ${totalProb.toFixed(4)})`);
        }

        if (uid === 'all') {
            if (!confirm(`정말로 모든 유저의 등급별 확률을 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                return;
            }
            messageEl.textContent = '모든 유저의 등급별 확률을 업데이트하는 중...';
            messageEl.style.color = '#f39c12';
            const usersSnapshot = await db.collection('users').get();
            const batch = db.batch();
            usersSnapshot.forEach(doc => batch.update(doc.ref, { 'stats.customProbabilities': newProbs }));
            await batch.commit();
            messageEl.textContent = `작업 완료: ${usersSnapshot.size}명의 유저에게 등급별 확률을 적용했습니다.`;
            messageEl.style.color = '#2ecc71';
        } else if (uid) { // 특정 유저에게 적용
            await db.collection('users').doc(uid).update({ 'stats.customProbabilities': newProbs });
            messageEl.textContent = '사용자 정의 확률이 성공적으로 저장되었습니다.';
            messageEl.style.color = '#2ecc71';
        } else {
            messageEl.textContent = '유저를 선택해야 확률을 변경할 수 있습니다.';
            messageEl.style.color = '#e74c3c';
        }

    } catch (error) {
        console.error("확률 업데이트 실패:", error);
        messageEl.textContent = `확률 저장 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

async function updateUserMutationProbabilities() {
    const uid = document.getElementById('targetUserSelect').value;
    const messageEl = document.getElementById('inspectorPanelMessage');

    const goldProbInput = document.getElementById('prob-mutation-gold');
    const rainbowProbInput = document.getElementById('prob-mutation-rainbow');
    const flameProbInput = document.getElementById('prob-mutation-flame');

    try {
        const goldProb = parseFloat(goldProbInput.value);
        const rainbowProb = parseFloat(rainbowProbInput.value);
        const flameProb = parseFloat(flameProbInput.value);

        if (isNaN(goldProb) || isNaN(rainbowProb) || isNaN(flameProb) || goldProb < 0 || rainbowProb < 0 || flameProb < 0) {
            throw new Error('유효하지 않은 확률 값입니다. 0 이상의 숫자를 입력하세요.');
        }

        const newMutationProbs = { gold: goldProb, rainbow: rainbowProb, flame: flameProb };

        if (uid === 'all') {
            // 모든 유저에게 변이 확률 적용
            if (!confirm(`정말로 모든 유저의 변이 확률을 골드 ${goldProb}%, 레인보우 ${rainbowProb}%, 화염 ${flameProb}%로 설정하시겠습니까?`)) {
                return;
            }
            messageEl.textContent = '모든 유저의 변이 확률을 업데이트하는 중...';
            messageEl.style.color = '#f39c12';

            const usersSnapshot = await db.collection('users').get();
            const batch = db.batch();
            usersSnapshot.forEach(doc => {
                batch.update(doc.ref, { 'stats.customMutationProbabilities': newMutationProbs });
            });
            await batch.commit();
            messageEl.textContent = `작업 완료: ${usersSnapshot.size}명의 유저에게 변이 확률을 적용했습니다.`;
            messageEl.style.color = '#2ecc71';

        } else if (uid) { // 특정 유저에게 적용
            // 특정 유저에게 적용
            await db.collection('users').doc(uid).update({ 'stats.customMutationProbabilities': newMutationProbs });
            messageEl.textContent = '사용자 정의 변이 확률이 성공적으로 저장되었습니다.';
            messageEl.style.color = '#2ecc71';
        } else {
            messageEl.textContent = '유저를 선택해야 변이 확률을 변경할 수 있습니다.';
            messageEl.style.color = '#e74c3c';
        }

    } catch (error) {
        console.error("변이 확률 업데이트 실패:", error);
        messageEl.textContent = `변이 확률 저장 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

/**
 * 개발자 패널의 등급별 확률 입력 필드를 기본값으로 되돌립니다.
 */
function resetProbabilitiesToDefault() {
    const messageEl = document.getElementById('inspectorPanelMessage');
    try {
        Object.keys(grades).forEach(gradeKey => {
            const input = document.getElementById(`prob-${gradeKey}`);
            if (input) {
                input.value = grades[gradeKey].probability;
            }
        });
        messageEl.textContent = '등급별 확률이 기본값으로 재설정되었습니다. (저장 필요)';
        messageEl.style.color = '#3498db';
    } catch (error) {
        messageEl.textContent = `기본값 복원 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

/**
 * 개발자 패널의 변이 확률 입력 필드를 기본값으로 되돌립니다.
 */
function resetMutationProbabilitiesToDefault() {
    const messageEl = document.getElementById('inspectorPanelMessage');
    try {
        document.getElementById('prob-mutation-gold').value = MUTATION_CONFIG.GOLD.probability;
        document.getElementById('prob-mutation-rainbow').value = MUTATION_CONFIG.RAINBOW.probability;
        document.getElementById('prob-mutation-flame').value = MUTATION_CONFIG.FLAME.probability;
        messageEl.textContent = '변이 확률이 기본값으로 재설정되었습니다. (저장 필요)';
        messageEl.style.color = '#3498db';
    } catch (error) {
        messageEl.textContent = `기본값 복원 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

async function sendAnnouncement() {
    const messageInput = document.getElementById('announcementMessage');
    const message = messageInput.value.trim();
    const messageEl = document.getElementById('announcementPanelMessage');

    if (!message) {
        messageEl.textContent = '공지 내용을 입력하세요.';
        messageEl.style.color = '#e74c3c';
        return;
    }

    try {
        const announcementRef = db.collection('globals').doc('announcement');
        await announcementRef.set({
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageEl.textContent = '공지를 성공적으로 보냈습니다.';
        messageEl.style.color = '#2ecc71';
        messageInput.value = ''; // Clear textarea
    } catch (error) {
        console.error("공지 보내기 실패:", error);
        messageEl.textContent = `공지 보내기 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

async function sendCurrencyGift(currencyType) {
    const uid = document.getElementById('targetUserSelect').value;
    const amount = parseInt(document.getElementById('giftAmount').value);
    const messageEl = document.getElementById('devPanelMessage');

    if (!uid) {
        messageEl.textContent = '선물할 유저를 선택하세요.';
        messageEl.style.color = '#e74c3c';
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        messageEl.textContent = '올바른 수량을 입력하세요.';
        messageEl.style.color = '#e74c3c';
        return;
    }

    const currencyName = currencyType === 'coins' ? '코인' : '파편';

    if (uid === 'all') {
        // 모든 유저에게 보내기
        if (!confirm(`정말로 모든 유저에게 ${currencyName} ${amount.toLocaleString()}개를 보내시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        messageEl.textContent = `모든 유저에게 ${currencyName}을(를) 보내는 중...`;
        messageEl.style.color = '#f39c12';

        try {
            const usersSnapshot = await db.collection('users').get();
            const batch = db.batch();
            const fieldToUpdate = `stats.${currencyType}`;

            usersSnapshot.forEach(doc => {
                batch.update(doc.ref, { [fieldToUpdate]: firebase.firestore.FieldValue.increment(amount) });
            });

            await batch.commit();
            messageEl.textContent = `작업 완료: ${usersSnapshot.size}명에게 ${currencyName}을(를) 성공적으로 보냈습니다.`;
            messageEl.style.color = '#2ecc71';
        } catch (error) {
            console.error("전체 재화 선물 보내기 실패:", error);
            messageEl.textContent = `전체 선물 보내기 실패: ${error.message}`;
            messageEl.style.color = '#e74c3c';
        }
    } else {
        // 특정 유저에게 보내기 (기존 로직)
        try {
            const userDocRef = db.collection('users').doc(uid);
            const fieldToUpdate = `stats.${currencyType}`;
            await userDocRef.update({
                [fieldToUpdate]: firebase.firestore.FieldValue.increment(amount)
            });
            messageEl.textContent = `${currencyName} ${amount.toLocaleString()}개를 성공적으로 보냈습니다.`;
            messageEl.style.color = '#2ecc71';
        } catch (error) {
            console.error("재화 선물 보내기 실패:", error);
            messageEl.textContent = `선물 보내기 실패: ${error.message}`;
            messageEl.style.color = '#e74c3c';
        }
    }
}

/**
 * 가장 최근 공지와 그에 대한 답장들을 불러와 개발자 패널에 표시합니다.
 */
async function fetchLatestAnnouncementReplies() {
    const repliesListEl = document.getElementById('announcementRepliesList');
    const latestAnnEl = document.getElementById('latestAnnouncementText');
    if (!repliesListEl || !latestAnnEl) return;

    repliesListEl.innerHTML = '<p>답장을 불러오는 중...</p>';
    latestAnnEl.textContent = '최신 공지 답장 목록';

    try {
        // 최근 답장 20개를 시간순으로 직접 가져옵니다.
        const repliesSnapshot = await db.collection('announcement_replies')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        if (repliesSnapshot.empty) {
            repliesListEl.innerHTML = '<p style="color: #7f8c8d;">이 공지에 대한 답장이 아직 없습니다.</p>';
            return;
        }

        repliesListEl.innerHTML = ''; // 이전 목록 초기화
        repliesSnapshot.forEach(doc => {
            const reply = doc.data();
            const replyEl = document.createElement('div');
            replyEl.className = 'reply-item';

            // 답장이 어떤 공지에 대한 것인지 컨텍스트를 추가합니다.
            const originalMessageHTML = reply.originalMessage
                ? `<p class="original-announcement-context">Re: "${reply.originalMessage}"</p>`
                : '';

            replyEl.innerHTML = `
                ${originalMessageHTML}
                <div class="reply-header">
                    <span class="reply-nickname">${reply.nickname}</span>
                    <span class="reply-timestamp">${formatTimeAgo(reply.createdAt)}</span>
                </div>
                <p class="reply-message">${reply.message}</p>
            `;
            repliesListEl.appendChild(replyEl);
        });

    } catch (error) {
        console.error("공지 답장 로드 실패:", error);
        latestAnnEl.textContent = '최신 공지 답장 목록';
        repliesListEl.innerHTML = '<p style="color: #e74c3c;">답장을 불러오는 데 실패했습니다.</p>';
    }
}

/**
 * 개발자 패널에서 실제 이벤트를 강제로 시작/종료합니다.
 */
async function toggleRealEvent() {
    const messageEl = document.getElementById('devPanelMessage');
    const eventStateRef = db.collection('globals').doc('eventState');

    try {
        const doc = await eventStateRef.get();
        const currentStatus = doc.exists ? doc.data().isLive : false;
        const newStatus = !currentStatus;

        await eventStateRef.set({ isLive: newStatus }, { merge: true });

        messageEl.textContent = `실제 이벤트가 성공적으로 ${newStatus ? '시작' : '종료'}되었습니다.`;
        messageEl.style.color = '#2ecc71';

    } catch (error) {
        console.error("실제 이벤트 상태 변경 실패:", error);
        messageEl.textContent = `이벤트 상태 변경 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}

/**
 * 개발자 패널에서 화염 이벤트를 강제로 시작/종료합니다.
 */
async function toggleFlameEvent() {
    const messageEl = document.getElementById('devPanelMessage');
    const eventStateRef = db.collection('globals').doc('eventState');

    try {
        const doc = await eventStateRef.get();
        const currentStatus = doc.exists ? doc.data().flameEventForced : false;
        const newStatus = !currentStatus;
 
        if (newStatus) {
            // 이벤트 시작: 종료 시간을 10분 후로 설정하여 저장
            const endTime = new Date(Date.now() + 10 * 60 * 1000);
            await eventStateRef.set({ 
                flameEventForced: true,
                flameEventForcedEndTime: firebase.firestore.Timestamp.fromDate(endTime)
            }, { merge: true });
        } else {
            // 이벤트 종료: 관련 필드 초기화
            await eventStateRef.set({ flameEventForced: false, flameEventForcedEndTime: null }, { merge: true });
        }
 
        messageEl.textContent = `화염 이벤트가 성공적으로 ${newStatus ? '시작' : '종료'}되었습니다.`;
        messageEl.style.color = '#2ecc71';
    } catch (error) {
        console.error("화염 이벤트 상태 변경 실패:", error);
        messageEl.textContent = `이벤트 상태 변경 실패: ${error.message}`;
        messageEl.style.color = '#e74c3c';
    }
}