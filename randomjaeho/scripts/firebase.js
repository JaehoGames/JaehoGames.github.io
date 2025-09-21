// scripts/firebase.js

// TODO: Firebase 콘솔에서 복사한 설정 값을 여기에 붙여넣으세요.
const firebaseConfig = {
  apiKey: "AIzaSyBzMwynkgWGimjY7QcSI4huIjvWm-FQBxY",
  authDomain: "randomjaeho.firebaseapp.com",
  projectId: "randomjaeho",
  storageBucket: "randomjaeho.firebasestorage.app",
  messagingSenderId: "574187894762",
  appId: "1:574187894762:web:8909e800258f6111a02493"
};

// Firebase 앱 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스 변수
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;
let unsubscribeUserSnapshot = null; // 사용자 데이터 실시간 리스너 구독 해제 함수
let unsubscribeAnnouncement = null; // 공지사항 실시간 리스너 구독 해제 함수
let presenceInterval = null; // 접속 상태 갱신을 위한 인터벌

/**
 * Google 계정으로 로그인합니다.
 */
function signInWithGoogle() {
    // 인증 상태를 'session'으로 설정하여 브라우저를 닫으면 로그아웃되도록 함
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(() => {
            const provider = new firebase.auth.GoogleAuthProvider();
            return auth.signInWithPopup(provider);
        })
        .then((result) => {
            console.log("로그인 성공:", result.user.displayName);
        })
        .catch((error) => {
            console.error("로그인 또는 인증 지속성 설정 실패:", error);
            showNotification(`로그인에 실패했습니다: ${error.message}`, '#e74c3c');
        });
}

/**
 * 로그아웃합니다.
 */
function signOutUser() {
    // 로그아웃 시, 주기적인 접속 상태 갱신을 즉시 중단합니다.
    if (presenceInterval) {
        clearInterval(presenceInterval);
        presenceInterval = null;
    }

    auth.signOut()
        .then(() => {
            console.log("로그아웃 성공");
        })
        .catch((error) => {
            console.error("로그아웃 실패:", error);
        });
}

/**
 * 인증 상태 변경을 감지하고 UI를 업데이트합니다.
 */
function initFirebaseAuth() {
    auth.onAuthStateChanged((user) => {
        const loginButton = document.getElementById('loginButton');
        const logoutButton = document.getElementById('logoutButton');
        const userProfile = document.getElementById('userProfile');

        // 이전 사용자의 실시간 리스너가 있다면 구독 해제
        if (unsubscribeUserSnapshot) {
            unsubscribeUserSnapshot();
            unsubscribeUserSnapshot = null;
        }
        if (unsubscribeAnnouncement) {
            unsubscribeAnnouncement();
            unsubscribeAnnouncement = null;
        }
        if (presenceInterval) {
            clearInterval(presenceInterval);
            presenceInterval = null;
        }

        if (user) {
            // 사용자가 로그인한 경우
            currentUser = user;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            userProfile.style.display = 'flex';
            
            showNotification(`${user.displayName}님, 환영합니다!`, '#2ecc71');

            // 개발자 계정 확인
            const devPanelButton = document.getElementById('devPanelButton');
            if (user.email === 'voxe.d12@gmail.com') {
                devPanelButton.style.display = 'flex';
            } else {
                devPanelButton.style.display = 'none';
            }

            // Firestore 데이터에 대한 실시간 리스너 설정
            const userDocRef = db.collection('users').doc(currentUser.uid);
            unsubscribeUserSnapshot = userDocRef.onSnapshot(async (doc) => {
                if (doc.exists) {
                    console.log("Firestore 데이터 실시간 업데이트 수신.");
                    const oldInventory = [...(stats.inventory || [])];
                    const oldCoins = stats.coins || 0;
                    const oldFragments = stats.cosmicFragments || 0;

                    // 데이터 로드 및 게임 상태 업데이트
                    const loadedData = doc.data() || {};
                    const loadedStats = loadedData.stats || {};
                    const loadedEffects = loadedData.activeEffects || {};

                    // 데이터 정제 (기존 loadGameData 로직)
                    stats = {
                        total: loadedStats.total || 0,
                        ancient: loadedStats.ancient || 0,
                        'ultimate-jaeho': loadedStats['ultimate-jaeho'] || 0,
                        divine: loadedStats.divine || 0,
                        mythic: loadedStats.mythic || 0,
                        legendary: loadedStats.legendary || 0,
                        epic: loadedStats.epic || 0,
                        rare: loadedStats.rare || 0,
                        uncommon: loadedStats.uncommon || 0,
                        common: loadedStats.common || 0,
                        coins: loadedStats.coins || 0,
                        inventory: Array.isArray(loadedStats.inventory) ? loadedStats.inventory : [],
                        itemsPurchased: loadedStats.itemsPurchased || 0,
                        coinsSpent: loadedStats.coinsSpent || 0,
                        collectedItems: typeof loadedStats.collectedItems === 'object' ? loadedStats.collectedItems : {},
                        hasCosmicKey: loadedStats.hasCosmicKey || false,
                        inventorySize: loadedStats.inventorySize || 5,
                        cosmicFragments: loadedStats.cosmicFragments || 0,
                        collectedCount: loadedStats.collectedCount || 0,
                        permanentLuck: loadedStats.permanentLuck || 0,
                        settings: {
                            music: loadedStats.settings?.music ?? false,
                            graphics: loadedStats.settings?.graphics ?? 'high'
                        },
                        customProbabilities: loadedStats.customProbabilities || {}
                    };

                    activeEffects = {
                        speedBoost: loadedEffects.speedBoost || 0,
                        coinBoost: loadedEffects.coinBoost || 0,
                    };

                    // UI 업데이트
                    updateLastSavedTime(loadedData.lastSaved);
                    updateStatsDisplayEnhanced();
                    updateActiveEffectsDisplay();
                    updateInventoryDisplay();
                    updateCosmicSpaceUI(); // 코즈믹 키 상태 업데이트
                    updatePermanentLuckUI(); // 데이터 로드 후 UI 업데이트
                    updateProbabilityDisplay(); // 영구 행운 변경 시 확률표를 다시 그리도록 추가
                    initSettings(); // 설정 UI도 데이터 변경에 따라 업데이트
                    updateExpandInventoryButton(); // 인벤토리 확장 버튼 업데이트

                    // 닉네임 처리
                    handleNickname(loadedData.profile || {});

                    // 선물 감지 로직
                    const newInventory = stats.inventory || [];
                    if (newInventory.length > oldInventory.length) {
                        const newItem = newInventory[newInventory.length - 1]; // 가장 마지막에 추가된 아이템
                        showNotification(`👑 개발자로부터 '${newItem.itemName}'을(를) 선물받았습니다!`, '#f1c40f');
                    }
                    const newCoins = stats.coins || 0;
                    if (newCoins > oldCoins && (newCoins - oldCoins) > 0) {
                        showNotification(`👑 개발자로부터 ${(newCoins - oldCoins).toLocaleString()} 코인을 선물받았습니다!`, '#f1c40f');
                    }
                    const newFragments = stats.cosmicFragments || 0;
                    if (newFragments > oldFragments && (newFragments - oldFragments) > 0) {
                        showNotification(`👑 개발자로부터 ${(newFragments - oldFragments).toLocaleString()} 코즈믹 파편을 선물받았습니다!`, '#f1c40f');
                    }

                } else {
                    // Firestore에 데이터가 없는 경우 (최초 로그인)
                    console.log("새로운 사용자입니다. 기본 데이터로 시작합니다.");
                    await createInitialUserData(userDocRef);
                    handleNickname({}); // 닉네임 설정 모달 표시
                }
            }, (error) => {
                console.error("Firestore 실시간 리스너 오류:", error);
                showNotification('데이터 동기화에 실패했습니다. 새로고침해주세요.', '#e74c3c');
            });
            
            // 공지사항 리스너 설정
            const announcementRef = db.collection('globals').doc('announcement');
            let lastAnnouncementTimestamp = null; // 마지막으로 표시한 공지의 타임스탬프

            unsubscribeAnnouncement = announcementRef.onSnapshot({ includeMetadataChanges: true }, (doc) => {
                // 로컬 캐시에서 발생한 변경(쓰기 작업 직후)은 무시하고, 서버로부터 온 변경에만 반응합니다.
                if (doc.metadata.hasPendingWrites) {
                    return;
                }

                if (doc.exists) {
                    const data = doc.data();
                    // 이전에 표시한 공지가 아니거나, 첫 공지일 경우에만 표시합니다.
                    if (data.timestamp && (!lastAnnouncementTimestamp || data.timestamp.toMillis() > lastAnnouncementTimestamp.toMillis())) {
                        lastAnnouncementTimestamp = data.timestamp;
                        showAnnouncementBanner(data.message, 7000); // 7초간 표시
                    }
                }
            }, (error) => console.error("공지 리스너 오류:", error));

            // 주기적으로 접속 상태(lastLogin) 갱신
            presenceInterval = setInterval(() => {
                if (currentUser) {
                    db.collection('users').doc(currentUser.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }).catch(error => {
                        // 오프라인 상태에서 실패할 수 있으므로, 에러 로그는 생략
                    });
                }
            }, 4 * 60 * 1000); // 4분마다 갱신
        } else {
            // 사용자가 로그아웃한 경우
            currentUser = null;
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            userProfile.style.display = 'none';
            document.getElementById('devPanelButton').style.display = 'none';

            // 로그인하지 않은 상태이므로, 기본(초기화된) 데이터로 게임을 리셋합니다.
            if (typeof resetGameWithShop === 'function') {
                resetGameWithShop(false); // 확인 창 없이 초기화
            }
            // 로그아웃 시 음악 끄기
            const bgMusic = document.getElementById('bgmPlayer');
            if (bgMusic) fadeAudio(bgMusic, 'out', 500);

            showNotification('로그아웃되었습니다. 데이터는 로그인 시 복구됩니다.', '#3498db');
        }
    });

    document.getElementById('loginButton').addEventListener('click', signInWithGoogle);
    document.getElementById('logoutButton').addEventListener('click', signOutUser);
}

/**
 * 새로운 사용자를 위한 초기 데이터를 Firestore에 생성합니다.
 * @param {firebase.firestore.DocumentReference} userDocRef - 사용자 문서 참조
 */
async function createInitialUserData(userDocRef) {
    const initialData = {
        profile: {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL
        },
        stats: stats, // 전역 기본 stats
        activeEffects: activeEffects, // 전역 기본 effects
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await userDocRef.set(initialData);
        console.log("새 사용자 데이터를 Firestore에 저장했습니다.");
    } catch (error) {
        console.error("초기 사용자 데이터 저장 실패:", error);
    }
}