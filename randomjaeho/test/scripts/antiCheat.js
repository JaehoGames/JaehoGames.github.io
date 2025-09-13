/**
 * antiCheat.js
 * reCAPTCHA의 동작 방식을 모방하여 사용자의 행동 패턴을 분석하고,
 * '의심 점수(Suspicion Score)'를 기반으로 매크로를 탐지합니다.
 */

const antiCheatConfig = {
    CLICK_HISTORY_LIMIT: 30,       // 분석할 최근 클릭 기록 수
    SUSPICION_SCORE_THRESHOLDS: {
        QUIZ: 150,                 // 이 점수 도달 시 퀴즈 표시
        PENALTY_1: 300,            // 이 점수 도달 시 1차 페널티
        PENALTY_2: 600             // 이 점수 도달 시 2차 페널티 (강화)
    },
    SCORE_DECAY_PER_SECOND: 1,     // 초당 감소하는 의심 점수
    SCORE_INCREMENTS: {
        IMPOSSIBLE_CLICK: 100,     // 인간적으로 불가능한 속도의 클릭
        BURST_CLICK: 15,           // 1초 내 기준치 초과 클릭 (클릭당)
        ZERO_POSITION_VARIANCE: 40,// 여러 번의 클릭이 정확히 동일한 좌표에서 발생
        LOW_POSITION_VARIANCE: 20  // 클릭 좌표의 편차가 매우 적음
    },
    MIN_CLICK_INTERVAL_MS: 20,     // 인간적으로 불가능한 최소 클릭 간격 (ms)
    BURST_CLICK_WINDOW_MS: 1000,   // 단기 버스트(Burst) 감지 시간 (1초)
    BURST_CLICK_LIMIT: 15,         // 1초 내 15회 이상 클릭 시 즉시 페널티
    PENALTY_DURATIONS_MS: [
        10 * 60 * 1000,    // 1차: 10분
        30 * 60 * 1000,    // 2차: 30분
        60 * 60 * 1000,    // 3차: 1시간
        120 * 60 * 1000    // 4차 이상: 2시간
    ],
    LUCK_DEBUFF_DURATION_MS: 24 * 60 * 60 * 1000, // 24시간
    LUCK_DEBUFF_FACTOR: 0.5, // 레어 이상 확률 반감
    PENALTY_STATE_KEY: 'randomJaehoPenaltyState'
};

// 클릭 기록 (시간, 좌표)
let clickHistory = [];

// 페널티 및 의심 점수 상태
let penaltyState = {
    unlockTime: 0,
    detectionCount: 0,
    lastDetectionTime: 0,
    suspicionScore: 0,
    lastActivityTime: 0,
    luckDebuff: {
        active: false,
        expiryTime: 0
    }
};

/**
 * 숫자 배열의 표준 편차를 계산합니다.
 * @param {number[]} array - 숫자 배열
 * @returns {number} 표준 편차
 */
function calculateStandardDeviation(array) {
    if (array.length < 2) return 0;
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    const variance = array.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1); // n-1 for sample standard deviation
    return Math.sqrt(variance);
}

/**
 * 페널티 상태를 localStorage에 저장합니다.
 */
function savePenaltyState() {
    localStorage.setItem(antiCheatConfig.PENALTY_STATE_KEY, JSON.stringify(penaltyState));
}

/**
 * localStorage에서 페널티 상태를 불러옵니다.
 */
function loadPenaltyState() {
    const savedState = localStorage.getItem(antiCheatConfig.PENALTY_STATE_KEY);
    if (savedState) {
        penaltyState = JSON.parse(savedState);
    }
}

/**
 * 행운 감소 디버프가 활성 상태인지 확인합니다.
 * @returns {boolean}
 */
function isLuckDebuffed() {
    // 매크로 방지 비활성화
    return false;
}

/**
 * 현재 뽑기 제한 상태인지 확인하고 남은 시간을 알립니다.
 * @returns {boolean} 제한 상태이면 true, 아니면 false
 */
function checkGachaLockout() {
    // 매크로 방지 비활성화
    return false;
}

/**
 * 의심 점수를 시간이 지남에 따라 감소시킵니다.
 */
function decaySuspicionScore() {
    const now = Date.now();
    if (penaltyState.lastActivityTime > 0) {
        const secondsPassed = (now - penaltyState.lastActivityTime) / 1000;
        const decayAmount = secondsPassed * antiCheatConfig.SCORE_DECAY_PER_SECOND;
        penaltyState.suspicionScore = Math.max(0, penaltyState.suspicionScore - decayAmount);
    }
    penaltyState.lastActivityTime = now;
}

/**
 * 최근 클릭 기록을 바탕으로 의심 점수를 업데이트합니다.
 */
function updateSuspicionScore() {
    if (clickHistory.length < 2) return;

    const lastClick = clickHistory[clickHistory.length - 1];
    const prevClick = clickHistory[clickHistory.length - 2];

    // 검사 1: 불가능한 클릭 속도
    const interval = lastClick.time - prevClick.time;
    if (interval < antiCheatConfig.MIN_CLICK_INTERVAL_MS) {
        penaltyState.suspicionScore += antiCheatConfig.SCORE_INCREMENTS.IMPOSSIBLE_CLICK;
        console.warn(`[AntiCheat] Impossible click interval: ${interval}ms. Score +${antiCheatConfig.SCORE_INCREMENTS.IMPOSSIBLE_CLICK}`);
    }

    // 검사 2: 클릭 좌표 분산도 (매크로는 종종 같은 위치를 클릭)
    if (clickHistory.length >= 5) {
        const recentClicks = clickHistory.slice(-5);
        const xCoords = recentClicks.map(c => c.x);
        const yCoords = recentClicks.map(c => c.y);
        const xStdDev = calculateStandardDeviation(xCoords);
        const yStdDev = calculateStandardDeviation(yCoords);

        if (xStdDev === 0 && yStdDev === 0) {
            penaltyState.suspicionScore += antiCheatConfig.SCORE_INCREMENTS.ZERO_POSITION_VARIANCE;
            console.warn(`[AntiCheat] Zero position variance. Score +${antiCheatConfig.SCORE_INCREMENTS.ZERO_POSITION_VARIANCE}`);
        } else if (xStdDev < 2 && yStdDev < 2) {
            penaltyState.suspicionScore += antiCheatConfig.SCORE_INCREMENTS.LOW_POSITION_VARIANCE;
            console.warn(`[AntiCheat] Low position variance. Score +${antiCheatConfig.SCORE_INCREMENTS.LOW_POSITION_VARIANCE}`);
        }
    }

    // 검사 3: 단기 버스트(Burst) 클릭
    const oneSecondAgo = lastClick.time - antiCheatConfig.BURST_CLICK_WINDOW_MS;
    const burstClicks = clickHistory.filter(c => c.time > oneSecondAgo).length;
    if (burstClicks > antiCheatConfig.BURST_CLICK_LIMIT) {
        penaltyState.suspicionScore += antiCheatConfig.SCORE_INCREMENTS.BURST_CLICK;
        console.warn(`[AntiCheat] Burst clicks detected. Score +${antiCheatConfig.SCORE_INCREMENTS.BURST_CLICK}`);
    }
}

/**
 * 현재 의심 점수에 따라 퀴즈 또는 페널티를 적용합니다.
 * @returns {boolean} 행동이 필요한 경우 true를 반환하여 뽑기를 중단시킴
 */
function actOnSuspicionScore() {
    const score = penaltyState.suspicionScore;
    const thresholds = antiCheatConfig.SUSPICION_SCORE_THRESHOLDS;

    if (score >= thresholds.PENALTY_2) {
        console.warn(`[AntiCheat] High suspicion score: ${score.toFixed(0)}. Applying level 2+ penalty.`);
        penaltyState.detectionCount = Math.max(2, penaltyState.detectionCount + 1);
        applyPenalty(penaltyState.detectionCount);
        penaltyState.suspicionScore = 0;
        clickHistory = [];
        return true;
    }
    if (score >= thresholds.PENALTY_1) {
        console.warn(`[AntiCheat] High suspicion score: ${score.toFixed(0)}. Applying level 1 penalty.`);
        penaltyState.detectionCount = Math.max(1, penaltyState.detectionCount + 1);
        applyPenalty(penaltyState.detectionCount);
        penaltyState.suspicionScore = 0;
        clickHistory = [];
        return true;
    }
    if (score >= thresholds.QUIZ) {
        console.log(`[AntiCheat] Suspicion score threshold reached: ${score.toFixed(0)}. Triggering quiz.`);
        if (typeof showQuiz === 'function') {
            showQuiz();
        }
        penaltyState.suspicionScore /= 2; // 퀴즈 후 점수 반감
        clickHistory = [];
        return true;
    }
    return false;
}

/**
 * 가챠 클릭 시 호출되는 메인 함수. 모든 안티치트 로직의 진입점입니다.
 * @param {MouseEvent} event - 클릭 이벤트 객체
 * @returns {boolean} 뽑기를 중단해야 하면 true
 */
function registerGachaClick(event) {
    // 매크로 방지 비활성화
    return false;
}

/**
 * 감지 레벨에 따라 페널티를 적용합니다.
 * @param {number} level - 감지 횟수 (레벨)
 */
function applyPenalty(level) {
    // 매크로 방지 비활성화
    console.log("[AntiCheat] Penalty system disabled.");
}

/**
 * 페이지 로드 또는 페널티 적용 시 뽑기 제한 상태를 확인하고 UI에 적용합니다.
 */
function checkAndApplyLockout() {
    // 매크로 방지 비활성화
    console.log("[AntiCheat] Lockout check disabled.");
}