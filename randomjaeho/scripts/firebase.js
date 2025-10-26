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
let unsubscribeEventState = null; // 이벤트 상태 리스너 구독 해제 함수
let unsubscribeAdminNotifications = null; // 관리자 알림 리스너 구독 해제 함수
let unsubscribeChat = null; // 글로벌 채팅 리스너 구독 해제 함수
let presenceInterval = null; // 접속 상태 갱신을 위한 인터벌

/**
 * Google 계정으로 로그인합니다.
 * @param {string} [loginHint] - 자동 로그인을 위한 이메일 힌트
 */
function signInWithGoogle(loginHint) {
    const provider = new firebase.auth.GoogleAuthProvider();
    if (loginHint) {
        provider.setCustomParameters({ login_hint: loginHint });
    }

    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            if (user) {
                closeLoginModal(); // 로그인 성공 시 모달 닫기
            }
        })
        .catch((error) => {
            console.error("팝업 로그인 실패:", error);
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
    // 자동 저장 인터벌도 중단합니다.
    if (typeof autoSaveInterval !== 'undefined' && autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log("자동 저장을 중지했습니다.");
    }

    auth.signOut()
        .then(() => {
            console.log("로그아웃 성공");
            // 로그아웃 후 페이지를 새로고침하여 초기 상태로 돌아갑니다.
            window.location.reload();
        })
        .catch((error) => {
            console.error("로그아웃 실패:", error);
        });
}

/**
 * 인증 상태 변경을 감지하고 UI를 업데이트합니다.
 */
function initFirebaseAuth() {
    // 자동 로그인을 방지하기 위해 인증 지속성을 'none'으로 설정합니다.
    // 이렇게 하면 페이지를 새로고침하거나 닫을 때마다 로그아웃됩니다.
    auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
        .catch((error) => {
            console.error("인증 지속성 설정 실패:", error);
        });

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
        if (unsubscribeEventState) {
            unsubscribeEventState();
            unsubscribeEventState = null;
        }
        if (unsubscribeAdminNotifications) {
            unsubscribeAdminNotifications();
            unsubscribeAdminNotifications = null;
        }
        if (unsubscribeChat) {
            unsubscribeChat();
            unsubscribeChat = null;
        }
        if (presenceInterval) {
            clearInterval(presenceInterval);
            presenceInterval = null;
        }

        if (user) {
            // 사용자가 로그인한 경우
            // 퀴즈 모달을 숨기고 게임 컨테이너를 표시합니다.
            document.getElementById('entryQuizModal').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'flex';

            // 게임이 아직 초기화되지 않았다면 초기화합니다.
            if (!isGameInitialized) {
                initializeGame();
            }

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
                        customProbabilities: loadedStats.customProbabilities || {},
                        customMutationProbabilities: loadedStats.customMutationProbabilities || {}
                    };

                    activeEffects = {
                        speedBoost: loadedEffects.speedBoost || 0,
                        coinBoost: loadedEffects.coinBoost || 0,
                    };

                    // UI 업데이트
                    updateLastSavedTime(loadedData.lastSaved);
                    updateStatsDisplayEnhanced();
                    updateActiveEffectsDisplay();
                    updateInventoryButtonLabel(); // 인벤토리 버튼 레이블 업데이트
                    // 상세 인벤토리가 열려있다면 실시간으로 새로고침
                    if (document.getElementById('detailedInventoryModal')?.classList.contains('show')) {
                        renderDetailedInventory();
                    }
                    updateCosmicSpaceUI(); // 코즈믹 키 상태 업데이트
                    updatePermanentLuckUI(); // 데이터 로드 후 UI 업데이트
                    updateProbabilityDisplay(); // 영구 행운 변경 시 확률표를 다시 그리도록 추가
                    updateSettingsUI(); // 설정 UI도 데이터 변경에 따라 업데이트
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
            let isInitialAnnouncementLoad = true; // 첫 데이터 로드를 구분하기 위한 플래그

            unsubscribeAnnouncement = announcementRef.onSnapshot({ includeMetadataChanges: true }, (doc) => {
                // 로컬 캐시에서 발생한 변경(쓰기 작업 직후)은 무시하고, 서버로부터 온 변경에만 반응합니다.
                if (doc.metadata.hasPendingWrites) {
                    return;
                }

                // 첫 데이터 로드 시에는 배너를 표시하지 않습니다. (실시간 메시지처럼 동작)
                if (isInitialAnnouncementLoad) {
                    isInitialAnnouncementLoad = false;
                    return;
                }

                if (doc.exists) {
                    const data = doc.data();
                    if (data.timestamp) {
                        showAnnouncementBanner(data.message, 10000, data.timestamp); // 10초간 표시, 타임스탬프 전달
                    }
                }
            }, (error) => console.error("공지 리스너 오류:", error));

            // 이벤트 상태 리스너 설정
            const eventStateRef = db.collection('globals').doc('eventState');
            unsubscribeEventState = eventStateRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const eventData = doc.data();
                    window.isEventActive = eventData.isLive || false;
                    window.isFlameEventForced = eventData.flameEventForced || false;
                    window.flameEventForcedEndTime = eventData.flameEventForcedEndTime || null;
                    window.isDanYuEventForced = eventData.danYuEventForced || false;
                    window.isClubEventActive = eventData.clubEventActive || false; // 클럽 이벤트 상태 추가
                    window.isStratosphereEventForced = eventData.stratosphereEventForced || false;
                    window.stratosphereEventForcedEndTime = eventData.stratosphereEventForcedEndTime || null;
                } else {
                    window.isEventActive = false;
                    window.isFlameEventForced = false;
                    window.flameEventForcedEndTime = null;
                    window.isDanYuEventForced = false;
                    window.isClubEventActive = false; // 클럽 이벤트 상태 추가
                    window.isStratosphereEventForced = false;
                    window.stratosphereEventForcedEndTime = null;
                }

                // 클럽 이벤트 상태에 따라 body 클래스 토글
                document.body.classList.toggle('club-event-active', window.isClubEventActive);

                // 카운트다운 UI 즉시 업데이트
                updateFlameEventUI(); // 화염 이벤트 UI도 업데이트
                updateStratosphereEventUI(); // 성층권 이벤트 UI도 업데이트
                if (typeof initEventCountdown.forceUpdate === 'function') {
                    initEventCountdown.forceUpdate();
                }
                // 최단유 이벤트 UI 업데이트
                if (typeof updateDanYuEventUI === 'function') {
                    updateDanYuEventUI();
                }
            }, (error) => console.error("이벤트 상태 리스너 오류:", error));

            // 관리자 알림 리스너 설정
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            const adminNotifRef = db.collection('admin_notifications').where('timestamp', '>', twoMinutesAgo);
            let isInitialAdminLoad = true;

            unsubscribeAdminNotifications = adminNotifRef.onSnapshot((snapshot) => {
                if (isInitialAdminLoad) {
                    isInitialAdminLoad = false;
                    return;
                }
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const notifData = change.doc.data();
                        showAdminNotification(notifData.title, notifData.message, notifData.icon, notifData.type);
                    }
                });
            }, (error) => console.error("관리자 알림 리스너 오류:", error));

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

            // 로그아웃 시 설정 UI를 비활성화 상태로 업데이트
            updateSettingsUI();
        }
    });

    document.getElementById('loginButton').addEventListener('click', showLoginModal);
    document.getElementById('logoutButton').addEventListener('click', signOutUser);
}

/**
 * 로그인한 유저 정보를 localStorage에 저장합니다.
 */
function saveUserToLocalStorage(user) {
    // 자동 로그인 기능을 제거하기 위해 이 함수의 내용을 비활성화합니다.
    // localStorage에 사용자 정보를 저장하지 않습니다.
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

/**
 * 공지에 대한 답장을 Firestore에 저장합니다.
 * @param {string} message - 답장 메시지
 * @param {firebase.firestore.Timestamp} announcementTimestamp - 원본 공지의 타임스탬프
 * @param {string} originalMessage - 원본 공지 메시지
 */
async function sendAnnouncementReply(message, announcementTimestamp, originalMessage) {
    if (!currentUser) {
        showNotification('로그인 후 답장할 수 있습니다.', '#f39c12');
        return;
    }
    if (!message) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const nickname = userDoc.data()?.profile?.nickname || currentUser.displayName;

        await db.collection('announcement_replies').add({
            userId: currentUser.uid,
            nickname: nickname,
            message: message,
            originalMessage: originalMessage, // 원본 공지 내용 저장
            announcementTimestamp: announcementTimestamp, // 원본 공지 식별
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("답장 전송 실패:", error);
        showNotification('답장 전송에 실패했습니다.', '#e74c3c');
    }
}

/**
 * 글로벌 채팅 메시지를 Firestore에 전송합니다.
 * @param {string} message - 전송할 메시지
 */
async function sendChatMessage(message) {
    if (!currentUser) {
        showNotification('로그인 후 채팅할 수 있습니다.', '#f39c12');
        return false;
    }
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return false;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const nickname = userDoc.data()?.profile?.nickname || currentUser.displayName;

        await db.collection('chat_messages').add({
            userId: currentUser.uid,
            nickname: nickname,
            message: trimmedMessage,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("채팅 메시지 전송 실패:", error);
        showNotification('메시지 전송에 실패했습니다.', '#e74c3c');
        return false;
    }
}

/**
 * 글로벌 채팅 리스너를 시작합니다.
 */
function startChatListener() {
    if (unsubscribeChat) return; // 이미 리스너가 실행 중이면 중복 실행 방지

    let isInitialLoad = true; // 리스너의 첫 데이터 로드인지 판별하는 플래그

    const chatRef = db.collection('chat_messages').orderBy('createdAt', 'desc').limit(50);
    unsubscribeChat = chatRef.onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
        if (typeof displayChatMessages === 'function') {
            // 로컬에서 발생한 변경(쓰기 작업 직후)은 무시하고, 서버로부터 온 변경에만 반응합니다.
            // 이렇게 하면 내가 보낸 메시지가 중복으로 표시되는 것을 방지할 수 있습니다.
            if (snapshot.metadata.hasPendingWrites) {
                return;
            }

            if (isInitialLoad) {
                // 첫 로드: 스냅샷의 모든 문서를 가져와 화면을 완전히 새로 그립니다.
                const initialMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                displayChatMessages(initialMessages, true); // isInitial = true
                isInitialLoad = false; // 플래그를 false로 설정하여 다음부터는 실시간 업데이트로 처리
            } else {
                // 실시간 업데이트: 변경된 문서(docChanges) 중 'added' 타입만 필터링하여 새 메시지로 처리합니다.
                const newMessages = snapshot.docChanges()
                    .filter(change => change.type === 'added')
                    .map(change => ({ id: change.doc.id, ...change.doc.data() }));

                if (newMessages.length > 0) {
                    displayChatMessages(newMessages, false); // isInitial = false
                }
            }
        }
    }, (error) => console.error("채팅 리스너 오류:", error));
}