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

/**
 * Google 계정으로 로그인합니다.
 */
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("로그인 성공:", result.user.displayName);
        })
        .catch((error) => {
            console.error("로그인 실패:", error);
            showNotification(`로그인 실패: ${error.message}`, '#e74c3c');
        });
}

/**
 * 로그아웃합니다.
 */
function signOutUser() {
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
    auth.onAuthStateChanged(async (user) => {
        const loginButton = document.getElementById('loginButton');
        const logoutButton = document.getElementById('logoutButton');
        const userProfile = document.getElementById('userProfile');

        if (user) {
            // 사용자가 로그인한 경우
            currentUser = user;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            userProfile.style.display = 'flex';

            await loadGameData(); // Firestore에서 데이터 로드

            // 설정값 초기화 (기존 유저 호환)
            if (!stats.settings) {
                stats.settings = { music: true, animation: true, showSaveNotifications: true };
            }
            initSettings(); // 로드된 데이터로 설정 UI 초기화

            // 닉네임 확인 및 설정
            const userDocRef = db.collection('users').doc(currentUser.uid);
            const doc = await userDocRef.get();
            const profile = doc.exists ? doc.data().profile : {};

            handleNickname(profile);

            showNotification(`${user.displayName}님, 환영합니다!`, '#2ecc71');

        } else {
            // 사용자가 로그아웃한 경우
            currentUser = null;
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            userProfile.style.display = 'none';

            // 로그인하지 않은 상태이므로, 기본(초기화된) 데이터로 게임을 리셋합니다.
            if (typeof resetGameWithShop === 'function') {
                resetGameWithShop(false); // 확인 창 없이 초기화
            }
            showNotification('로그아웃되었습니다. 데이터는 로그인 시 복구됩니다.', '#3498db');
        }
    });

    document.getElementById('loginButton').addEventListener('click', signInWithGoogle);
    document.getElementById('logoutButton').addEventListener('click', signOutUser);
}
