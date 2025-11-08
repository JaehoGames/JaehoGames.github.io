// firebase-config.js
// Firebase SDK v9 이상에서는 필요한 함수만 개별적으로 임포트합니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// TODO: 본인의 Firebase 프로젝트 설정 값으로 교체하세요.
// Firebase 콘솔 -> 프로젝트 설정 -> 일반 탭에서 확인할 수 있습니다.
const firebaseConfig = {
  apiKey: "AIzaSyCWXJCNyrUELCCCWculMhpyAHn0rzwNh6E",
    authDomain: "jaehorpg.firebaseapp.com",
    projectId: "jaehorpg",
    storageBucket: "jaehorpg.firebasestorage.app",
    messagingSenderId: "708481143789",
    appId: "1:708481143789:web:8ed21f37e30dee78c3cde4",
    measurementId: "G-6MKHFL4YQH"
};

// Firebase 앱을 초기화합니다.
const app = initializeApp(firebaseConfig);

// 사용할 Firebase 서비스들을 가져옵니다.
const auth = getAuth(app);
const db = getFirestore(app);

// 다른 파일에서 사용할 수 있도록 내보냅니다.
export { auth, db };
