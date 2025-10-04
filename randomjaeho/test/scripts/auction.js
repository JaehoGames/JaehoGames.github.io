// scripts/auction.js

const AUCTION_CONFIG = {
    FEE_PERCENTAGE: 5, // 거래 수수료 5%
    LISTING_DURATION_HOURS: 24 // 등록 지속 시간 (24시간)
};

/**
 * 경매장 시스템 초기화
 */
function initAuctionHouse() {
    document.getElementById('auctionHouseButton')?.addEventListener('click', toggleAuctionHouse);
    document.getElementById('closeAuctionHouseModal')?.addEventListener('click', toggleAuctionHouse);
    document.getElementById('auctionHouseModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'auctionHouseModal') toggleAuctionHouse();
    });

    // 탭 전환 이벤트
    document.querySelectorAll('.auction-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.target.dataset.tab;
            // 'my-listings' 같은 형식을 'MyListings'로 변환
            const contentIdSuffix = targetTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
            const contentId = `auction${contentIdSuffix}Content`;

            document.querySelectorAll('.auction-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            document.querySelectorAll('.auction-tab-content').forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(contentId);
            if (targetContent) targetContent.classList.add('active');

            if (targetTab === 'browse') {
                fetchAndRenderListings();
            } else if (targetTab === 'my-listings') {
                fetchAndRenderMyListings();
            }
        });
    });

    // 검색 버튼
    document.getElementById('auctionSearchButton')?.addEventListener('click', () => {
        const name = document.getElementById('auctionSearchInput').value;
        const grade = document.getElementById('auctionGradeFilter').value;
        fetchAndRenderListings({ name, grade });
    });

    // 등급 필터 옵션 채우기
    const gradeFilter = document.getElementById('auctionGradeFilter');
    if (gradeFilter) {
        Object.keys(grades).forEach(gradeKey => {
            const option = document.createElement('option');
            option.value = gradeKey;
            option.textContent = grades[gradeKey].name;
            gradeFilter.appendChild(option);
        });
    }
}

/**
 * 경매장 모달 토글
 */
function toggleAuctionHouse() {
    const modal = document.getElementById('auctionHouseModal');
    if (!modal) return;

    const isVisible = modal.classList.contains('show');
    if (isVisible) {
        modal.classList.remove('show');
    } else {
        if (!currentUser) {
            showNotification('경매장은 로그인 후 이용 가능합니다.', '#f39c12');
            return;
        }
        modal.classList.add('show');
        // 기본적으로 '둘러보기' 탭을 활성화하고 데이터를 불러옵니다.
        document.querySelector('.auction-tab[data-tab="browse"]').click();
    }
}

/**
 * 경매장 목록을 Firestore에서 가져와 렌더링
 * @param {object} [filters] - { name: string, grade: string }
 */
async function fetchAndRenderListings(filters = {}) {
    const grid = document.getElementById('auctionGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading">목록을 불러오는 중...</div>';

    try {
        let query = db.collection('auction_house').orderBy('createdAt', 'desc');

        if (filters.grade) {
            query = query.where('item.gradeKey', '==', filters.grade);
        }
        // 이름 필터는 클라이언트 사이드에서 처리 (Firestore는 부분 문자열 검색 미지원)

        const snapshot = await query.limit(100).get();
        let listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (filters.name) {
            const searchTerm = filters.name.toLowerCase();
            listings = listings.filter(l => l.item.itemName.toLowerCase().includes(searchTerm));
        }

        if (listings.length === 0) {
            grid.innerHTML = '<p class="empty-inventory-message">등록된 물품이 없습니다.</p>';
            return;
        }

        grid.innerHTML = '';
        listings.forEach(listing => {
            const itemEl = createAuctionItemElement(listing, 'browse');
            grid.appendChild(itemEl);
        });

    } catch (error) {
        console.error("경매장 목록 로드 실패:", error);
        grid.innerHTML = '<p class="empty-inventory-message" style="color: #e74c3c;">목록을 불러오는 데 실패했습니다.</p>';
    }
}

/**
 * 내 등록 물품 목록을 가져와 렌더링
 */
async function fetchAndRenderMyListings() {
    const grid = document.getElementById('myListingsGrid');
    if (!grid || !currentUser) return;
    grid.innerHTML = '<div class="loading">내 목록을 불러오는 중...</div>';

    try {
        const snapshot = await db.collection('auction_house')
            .where('sellerId', '==', currentUser.uid)
            // .orderBy('createdAt', 'desc') // 복합 색인이 필요하므로 이 부분을 주석 처리합니다.
            .get();

        if (snapshot.empty) {
            grid.innerHTML = '<p class="empty-inventory-message">등록한 물품이 없습니다.</p>';
            return;
        }
        
        // 클라이언트 측에서 직접 정렬합니다.
        const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        listings.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        
        grid.innerHTML = '';
        listings.forEach(listing => {
            const itemEl = createAuctionItemElement(listing, 'my-listings');
            grid.appendChild(itemEl);
        });

    } catch (error) {
        console.error("내 등록 물품 로드 실패:", error);
        grid.innerHTML = '<p class="empty-inventory-message" style="color: #e74c3c;">목록을 불러오는 데 실패했습니다.</p>';
    }
}

/**
 * 경매 아이템 UI 요소를 생성
 * @param {object} listing - 리스팅 데이터
 * @param {'browse' | 'my-listings'} type - 탭 타입
 * @returns {HTMLElement}
 */
function createAuctionItemElement(listing, type) {
    const item = listing.item;
    const itemEl = document.createElement('div');
    itemEl.className = 'auction-item';
    itemEl.style.borderColor = item.gradeColor.includes('gradient') ? '#fff' : item.gradeColor;

    const { mutationInfoHTML, enhancementInfoHTML } = getItemInfoHTML(item);

    itemEl.innerHTML = `
        <img src="${item.imagePath}" alt="${item.itemName}" class="auction-item-image">
        <div class="auction-item-name">${enhancementInfoHTML} ${item.itemName}</div>
        ${mutationInfoHTML}
        <div class="auction-item-seller">판매자: ${listing.sellerNickname}</div>
        <div class="auction-item-price">💰 ${listing.price.toLocaleString()}</div>
        <div class="auction-item-actions"></div>
    `;

    const actionsContainer = itemEl.querySelector('.auction-item-actions');
    if (type === 'browse') {
        const buyButton = document.createElement('button');
        buyButton.className = 'buy-button';
        buyButton.textContent = '구매';
        if (listing.sellerId === currentUser?.uid) {
            buyButton.disabled = true;
            buyButton.textContent = '내 물품';
        }
        buyButton.onclick = () => buyAuctionItem(listing.id, listing.price);
        actionsContainer.appendChild(buyButton);
    } else { // my-listings
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = '등록 취소';
        cancelButton.onclick = () => cancelListing(listing.id);
        actionsContainer.appendChild(cancelButton);
    }

    return itemEl;
}

/**
 * 아이템 등록 가격 설정 모달 열기
 * @param {number} index - 인벤토리 아이템 인덱스
 */
function openListingPriceModal(index) {
    if (!currentUser) {
        showNotification('로그인 후 이용 가능합니다.', '#f39c12');
        return;
    }

    const item = stats.inventory[index];
    if (!item) return;

    const modal = document.getElementById('listItemPriceModal');
    const content = modal.querySelector('.modal-content');
    const baseSellPrice = calculateSellPrice(item);

    content.innerHTML = `
        <div class="modal-header">
            <h2>경매장 등록</h2>
            <button class="close-modal-button" onclick="closeListingPriceModal()">✕</button>
        </div>
        <div style="text-align: center; padding: 20px;">
            <img src="${item.imagePath}" style="width: 100px; height: 100px; border-radius: 10px; border: 2px solid ${item.gradeColor};">
            <h4>${item.itemName}</h4>
            <p>판매 가격을 입력하세요. (참고 상점 판매가: ${baseSellPrice.toLocaleString()})</p>
            <input type="number" id="listingPriceInput" placeholder="판매 가격" min="1" style="width: 100%; padding: 10px; font-size: 1.2em; text-align: center; margin-bottom: 15px;">
            <p style="font-size: 0.9em; color: #7f8c8d;">거래 성사 시 수수료 ${AUCTION_CONFIG.FEE_PERCENTAGE}%가 차감됩니다.</p>
            <button id="confirmListButton" class="buy-button" style="width: 100%;">등록하기</button>
        </div>
    `;

    modal.classList.add('show');

    document.getElementById('confirmListButton').onclick = async () => {
        const price = parseInt(document.getElementById('listingPriceInput').value);
        if (isNaN(price) || price <= 0) {
            showNotification('올바른 가격을 입력하세요.', '#e74c3c');
            return;
        }

        try {
            document.getElementById('confirmListButton').disabled = true;
            document.getElementById('confirmListButton').textContent = '등록 중...';

            // 아이템을 인벤토리에서 제거하고 경매장에 추가
            const itemToList = stats.inventory.splice(index, 1)[0];
            if (!itemToList) throw new Error("아이템을 찾을 수 없습니다.");

            // 만료 시간 설정
            const expirationTime = new Date();
            expirationTime.setHours(expirationTime.getHours() + AUCTION_CONFIG.LISTING_DURATION_HOURS);

            await db.collection('auction_house').add({
                sellerId: currentUser.uid, // sellerId 필드 추가
                sellerNickname: document.querySelector('#userProfile span')?.textContent || '이름없음',
                item: itemToList,
                price: price,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showNotification(`'${itemToList.itemName}'을(를) 경매장에 등록했습니다.`, '#2ecc71');
            closeListingPriceModal();
            toggleDetailedInventory(); // 상세 인벤토리 닫기
            updateInventoryButtonLabel(); // 인벤토리 버튼 레이블 업데이트
            saveGameData(false); // 변경된 인벤토리 상태 저장

        } catch (error) {
            console.error("경매장 등록 실패:", error);
            showNotification(`등록에 실패했습니다: ${error.message}`, '#e74c3c');
            // 실패 시 아이템을 인벤토리로 복구 (필요 시)
            stats.inventory.splice(index, 0, item);
            // 버튼 상태 복구
            document.getElementById('confirmListButton').disabled = false;
            document.getElementById('confirmListButton').textContent = '등록하기';
        }
    };
}

function closeListingPriceModal() {
    document.getElementById('listItemPriceModal')?.classList.remove('show');
}

/**
 * 경매장에서 아이템 구매
 * @param {string} listingId - 리스팅 문서 ID
 * @param {number} price - 아이템 가격
 */
async function buyAuctionItem(listingId, price) {
    if (!currentUser) return;
    if (stats.inventory.length >= stats.inventorySize) {
        showNotification('인벤토리가 가득 차서 구매할 수 없습니다.', '#e74c3c');
        return;
    }
    if (stats.coins < price) {
        showNotification('코인이 부족합니다.', '#e74c3c');
        return;
    }

    if (!confirm(`💰${price.toLocaleString()} 코인을 지불하고 아이템을 구매하시겠습니까?`)) return;

    const listingRef = db.collection('auction_house').doc(listingId);

    try {
        await db.runTransaction(async (transaction) => {
            const listingDoc = await transaction.get(listingRef);
            if (!listingDoc.exists) {
                throw new Error("이미 판매되었거나 존재하지 않는 물품입니다.");
            }

            const listingData = listingDoc.data();
            const sellerRef = db.collection('users').doc(listingData.sellerId);
            const buyerRef = db.collection('users').doc(currentUser.uid);

            // 1. 리스팅 삭제
            transaction.delete(listingRef);

            // 2. 구매자에게 아이템 추가 및 코인 차감
            transaction.update(buyerRef, {
                'stats.inventory': firebase.firestore.FieldValue.arrayUnion(listingData.item),
                'stats.coins': firebase.firestore.FieldValue.increment(-price)
            });

            // 3. 판매자에게 수수료를 뗀 코인 지급
            const earnedCoins = Math.floor(price * (1 - AUCTION_CONFIG.FEE_PERCENTAGE / 100));
            transaction.update(sellerRef, {
                'stats.coins': firebase.firestore.FieldValue.increment(earnedCoins)
            });
        });

        showNotification('아이템을 성공적으로 구매했습니다!', '#2ecc71');
        fetchAndRenderListings(); // 목록 새로고침

    } catch (error) {
        console.error("구매 실패:", error);
        showNotification(`구매에 실패했습니다: ${error.message}`, '#e74c3c');
    }
}

/**
 * 등록된 아이템 취소
 * @param {string} listingId - 리스팅 문서 ID
 */
async function cancelListing(listingId) {
    if (!currentUser) return;
    if (stats.inventory.length >= stats.inventorySize) {
        showNotification('인벤토리가 가득 차서 등록을 취소할 수 없습니다.', '#e74c3c');
        return;
    }

    if (!confirm('이 물품의 등록을 취소하시겠습니까?')) return;

    const listingRef = db.collection('auction_house').doc(listingId);
    const userRef = db.collection('users').doc(currentUser.uid);

    try {
        await db.runTransaction(async (transaction) => {
            const listingDoc = await transaction.get(listingRef);
            if (!listingDoc.exists) throw new Error("이미 판매되었거나 존재하지 않는 물품입니다.");

            const itemToReturn = listingDoc.data().item;
            transaction.delete(listingRef);
            transaction.update(userRef, {
                'stats.inventory': firebase.firestore.FieldValue.arrayUnion(itemToReturn)
            });
        });

        showNotification('등록을 취소하고 아이템을 인벤토리로 돌려받았습니다.', '#3498db');
        fetchAndRenderMyListings(); // 내 목록 새로고침

    } catch (error) {
        console.error("등록 취소 실패:", error);
        showNotification(`등록 취소에 실패했습니다: ${error.message}`, '#e74c3c');
    }
}