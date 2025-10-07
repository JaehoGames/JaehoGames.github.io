// scripts/danyu.js

/**
 * 최단유 이벤트 시스템 초기화.
 * 이제 이 함수는 firebase.js에서 이벤트 상태를 업데이트하는 역할만 합니다.
 */
function initDanYuEventSystem() {
    // 초기 UI 상태는 firebase.js의 리스너가 호출하여 설정합니다.
}

/**
 * 최단유 이벤트 UI 상태 업데이트.
 * 이벤트 상태에 따라 배경 CSS 클래스를 토글합니다.
 */
function updateDanYuEventUI() {
    const container = document.getElementById('danyu-background-container');
    if (window.isDanYuEventForced) {
        container?.classList.add('active');
    } else {
        container?.classList.remove('active');
    }
}