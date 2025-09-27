// 유틸리티 함수 모듈

let manualSaveTimestamps = []; // 수동 저장 타임스탬프 기록

/**
 * 오디오를 페이드 인/아웃 시킵니다.
 * @param {HTMLAudioElement} audio - 오디오 요소
 * @param {'in' | 'out'} type - 'in' 또는 'out'
 * @param {number} duration - 페이드 지속 시간 (ms)
 * @param {number} [maxVolume=0.5] - 최대 볼륨 (0.0 ~ 1.0)
 * @param {function} [callback] - 페이드 완료 후 실행될 콜백 함수
 */
function fadeAudio(audio, type, duration, maxVolume = 0.5, callback) {
    if (!audio) {
        if (callback) callback();
        return;
    }

    const interval = 50;
    const steps = duration / interval;

    if (type === 'in') {
        audio.volume = 0;
        if (audio.paused) {
            audio.play().catch(e => console.log(`${audio.id} 재생 실패:`, e));
        }
        const volumeStep = maxVolume / steps;
        
        const fade = setInterval(() => {
            audio.volume = Math.min(maxVolume, audio.volume + volumeStep);
            if (audio.volume >= maxVolume) {
                clearInterval(fade);
                if (callback) callback();
            }
        }, interval);
    } else if (type === 'out') {
        const startVolume = audio.volume;
        const volumeStep = startVolume / steps;

        const fade = setInterval(() => {
            audio.volume = Math.max(0, audio.volume - volumeStep);
            if (audio.volume <= 0) {
                audio.pause();
                audio.currentTime = 0;
                clearInterval(fade);
                if (callback) callback();
            }
        }, interval);
    }
}

/**
 * 복사 완료 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} color - 메시지 색상
 */
function showCopyMessage(message, color) {
    const button = event.target;
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.textContent = message;
    button.style.background = `linear-gradient(45deg, ${color}, ${color})`;
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground;
    }, 2000);
}

/**
 * 사용자가 수동으로 게임 데이터를 저장합니다.
 */
function manualSave() {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);

    // 1분 이상 지난 타임스탬프 제거
    manualSaveTimestamps = manualSaveTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    if (manualSaveTimestamps.length >= 3) {
        showNotification('저장 속도가 너무 빠릅니다. 잠시 후 다시 시도해주세요.', '#f39c12');
        return;
    }

    manualSaveTimestamps.push(now);
    saveGameData(true); // 알림을 표시하며 저장
}

/**
 * 마지막 저장 시간을 화면에 업데이트합니다.
 * @param {string | undefined} isoString - ISO 8601 형식의 날짜 문자열
 */
function updateLastSavedTime(isoString) {
    const timeEl = document.getElementById('lastSavedTime');
    if (!timeEl) return;

    if (!isoString) {
        timeEl.textContent = '저장 기록 없음';
        return;
    }

    try {
        const date = new Date(isoString);
        const formattedTime = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        timeEl.textContent = `마지막 저장: ${formattedTime}`;
    } catch (e) {
        timeEl.textContent = '시간 표시 오류';
    }
}

/**
 * 알림 메시지를 화면에 표시합니다.
 * @param {string} message - 표시할 메시지
 * @param {string} [color='#2ecc71'] - 알림창 배경색
 */
function showNotification(message, color = '#2ecc71') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-out 2.7s;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;

    // 애니메이션을 위한 CSS를 동적으로 추가합니다.
    if (!document.getElementById('notificationCSS')) {
        const style = document.createElement('style');
        style.id = 'notificationCSS';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

/**
 * 화면 상단에 공지 배너를 표시합니다.
 * @param {string} message - 표시할 메시지
 * @param {number} [duration=7000] - 배너가 표시될 시간 (ms)
 * @param {firebase.firestore.Timestamp} announcementTimestamp - 공지의 타임스탬프
 */
function showAnnouncementBanner(message, duration = 7000, announcementTimestamp) {
    const container = document.getElementById('announcementContainer');
    if (!container) return;

    // 공지 사운드 재생
    const announcementSound = document.getElementById('announcementSound');
    if (announcementSound) {
        announcementSound.volume = 0.5; // 사운드 볼륨 조절
        announcementSound.play().catch(() => {}); // Play errors are common, so we can ignore them.
    }

    // 전체 공지 유닛 (메시지 + 답장 영역)
    const announcementUnit = document.createElement('div');
    announcementUnit.className = 'announcement-unit';

    // 메시지 부분
    const messageEl = document.createElement('div');
    messageEl.className = 'announcement-message';

    // 메시지를 글자 단위로 쪼개서 각 글자를 <span>으로 감쌉니다.
    message.split('').forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char === ' ' ? '\u00A0' : char;
        charSpan.style.transitionDelay = `${index * 30}ms`;
        messageEl.appendChild(charSpan);
    });
    announcementUnit.appendChild(messageEl);

    // 답장 입력 부분
    const replyBox = document.createElement('div');
    replyBox.className = 'announcement-reply-box';
    replyBox.innerHTML = `
        <input type="text" class="announcement-reply-input" placeholder="답장 보내기..." maxlength="100">
        <button class="announcement-reply-button">전송</button>
    `;
    announcementUnit.appendChild(replyBox);

    const replyInput = replyBox.querySelector('.announcement-reply-input');
    const replyButton = replyBox.querySelector('.announcement-reply-button');

    const sendReply = () => {
        const replyMessage = replyInput.value.trim();
        if (replyMessage && typeof sendAnnouncementReply === 'function') {
            sendAnnouncementReply(replyMessage, announcementTimestamp, message);
            replyInput.value = '';
            replyInput.placeholder = '답장 전송 완료!';
            replyInput.disabled = true;
            replyButton.disabled = true;
            setTimeout(() => {
                replyInput.placeholder = '답장 보내기...';
                replyInput.disabled = false;
                replyButton.disabled = false;
            }, 2000);
        }
    };

    replyButton.addEventListener('click', sendReply);
    replyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendReply();
    });

    container.appendChild(announcementUnit);

    // Animate in
    setTimeout(() => announcementUnit.classList.add('show'), 10);

    // Animate out and remove
    setTimeout(() => {
        announcementUnit.classList.remove('show');
        setTimeout(() => announcementUnit.remove(), 500);
    }, duration);
}

/**
 * 코인 획득 애니메이션을 표시합니다.
 * @param {string} text - 표시할 텍스트 (예: "+100 코인")
 * @param {string} color - 텍스트 색상
 * @param {boolean} isBoost - 부스트 효과 여부 (크기 조절용)
 */
function showCoinAnimation(text, color, isBoost = false) {
    const container = document.querySelector('.game-container');
    if (!container) return;

    const animationEl = document.createElement('div');
    animationEl.textContent = text;
    animationEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: ${color};
        font-size: ${isBoost ? '2em' : '1.5em'};
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        z-index: 100;
        pointer-events: none;
        animation: coinBounce 2s ease-out forwards;
    `;

    // CSS 애니메이션 동적 생성 (이미 없으면)
    if (!document.getElementById('coinAnimationCSS')) {
        const style = document.createElement('style');
        style.id = 'coinAnimationCSS';
        style.textContent = `
            @keyframes coinBounce {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                50% { transform: translate(-50%, -150px) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -200px) scale(0.8); opacity: 0; }
            }`;
        document.head.appendChild(style);
    }

    container.appendChild(animationEl);
    setTimeout(() => animationEl.remove(), 2000);
}
/**
 * Firestore Timestamp를 "N분 전"과 같은 상대 시간으로 변환합니다.
 * @param {firebase.firestore.Timestamp} timestamp - Firestore 타임스탬프 객체
 * @returns {string} 변환된 시간 문자열
 */
function formatTimeAgo(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '알 수 없음';
    
    const now = new Date();
    const past = timestamp.toDate();
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 10) return '방금 전';
    if (seconds < 60) return `${seconds}초 전`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}시간 전`;
}

/**
 * 게임 데이터(통계, 효과)를 localStorage에 저장합니다.
 */
async function saveGameData(forceNotification = false) {
    if (currentUser) {
        // 로그인 상태: Firestore에 저장
        const userDocRef = db.collection('users').doc(currentUser.uid);
        const dataToSave = {
            stats: stats,
            activeEffects: activeEffects,
            lastSaved: new Date().toISOString(), // 저장 시간 기록
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        // set({ merge: true }) 대신 update를 사용하여, stats와 activeEffects 객체 전체를 덮어씁니다.
        // 이렇게 하면 서버에만 존재하는 불필요한 하위 필드들이 확실하게 제거됩니다.
        try {
            await userDocRef.update(dataToSave);
            if (forceNotification) {
                showNotification('☁️ 데이터가 저장되었습니다.', '#3498db');
            }
            if (!forceNotification) {
                console.log('게임 데이터가 자동으로 저장되었습니다.');
            }
            updateLastSavedTime(dataToSave.lastSaved);
        } catch (error) {
            console.error("Firestore 업데이트 실패:", error);
            showNotification('데이터 저장에 실패했습니다. 새로고침 후 다시 시도해주세요.', '#e74c3c');
        }
    } else {
        // 비로그인 상태: 아무것도 저장하지 않음 (또는 임시 세션 저장)
        console.log("비로그인 상태이므로 데이터를 저장하지 않습니다.");
    }
}

/**
 * 게임 데이터(통계, 효과)를 localStorage에 저장합니다.
 */
async function saveGameData(forceNotification = false) {
    if (currentUser) {
        // 로그인 상태: Firestore에 저장
        const userDocRef = db.collection('users').doc(currentUser.uid);
        const dataToSave = {
            stats: stats,
            activeEffects: activeEffects,
            lastSaved: new Date().toISOString(), // 저장 시간 기록
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        // set({ merge: true }) 대신 update를 사용하여, stats와 activeEffects 객체 전체를 덮어씁니다.
        // 이렇게 하면 서버에만 존재하는 불필요한 하위 필드들이 확실하게 제거됩니다.
        try {
            await userDocRef.update(dataToSave);
            if (forceNotification) {
                showNotification('☁️ 데이터가 저장되었습니다.', '#3498db');
            }
            updateLastSavedTime(dataToSave.lastSaved);
        } catch (error) {
            console.error("Firestore 업데이트 실패:", error);
            showNotification('데이터 저장에 실패했습니다. 새로고침 후 다시 시도해주세요.', '#e74c3c');
        }
    } else {
        // 비로그인 상태: 아무것도 저장하지 않음 (또는 임시 세션 저장)
        console.log("비로그인 상태이므로 데이터를 저장하지 않습니다.");
    }
}

/**
 * 게임 데이터(통계, 효과)를 로드합니다.
 * @deprecated 이제 이 기능은 firebase.js의 onSnapshot 리스너에서 직접 처리됩니다.
 */
async function loadGameData() {
    console.warn("loadGameData() is deprecated. Data loading is now handled by a real-time listener in firebase.js.");
    // 이 함수는 더 이상 사용되지 않으므로 비워둡니다.
    // 모든 로직은 firebase.js의 onSnapshot 콜백으로 이동되었습니다.
}

/**
 * 행운 감소 디버프 상태에 따라 확률 표시를 업데이트합니다.
 */
function updateProbabilityDisplay() {
    const highTierKeys = ['rare', 'epic', 'legendary', 'mythic', 'cosmic', 'divine', 'ultimate-jaeho', 'ancient', 'transcendence'];

    let effectiveProbs = {};
    const hasCustomProbs = stats.customProbabilities && Object.keys(stats.customProbabilities).length > 0;

    // 1. 적용될 확률 결정 (사용자 지정 > 영구 행운 > 기본)
    if (hasCustomProbs) {
        // 사용자 지정 확률이 있으면 그것을 사용
        for (const key in grades) {
            effectiveProbs[key] = stats.customProbabilities[key] ?? grades[key].probability;
        }
    } else {
        // 사용자 지정 확률이 없으면 영구 행운을 계산
        let tempGrades = JSON.parse(JSON.stringify(grades));
        const luckLevel = stats.permanentLuck || 0;
        if (luckLevel > 0) {
            const totalBonus = PERMANENT_LUCK_CONFIG.BONUSES[luckLevel - 1];
            if (totalBonus) {
                const lowTierKeys = ['common', 'uncommon'];
                let totalLowTierProb = lowTierKeys.reduce((sum, key) => sum + tempGrades[key].probability, 0);
                const totalDeduction = Math.min(totalBonus, totalLowTierProb * 0.5);

                if (totalLowTierProb > 0) {
                    lowTierKeys.forEach(key => {
                        const deduction = (tempGrades[key].probability / totalLowTierProb) * totalDeduction;
                        tempGrades[key].probability -= deduction;
                    });
                }

                const totalHighTierProb = highTierKeys.reduce((sum, key) => sum + tempGrades[key].probability, 0);
                if (totalHighTierProb > 0) {
                    highTierKeys.forEach(key => {
                        const addition = (tempGrades[key].probability / totalHighTierProb) * totalDeduction;
                        tempGrades[key].probability += addition;
                    });
                }
            }
        }
        for (const key in tempGrades) {
            effectiveProbs[key] = tempGrades[key].probability;
        }
    }

    // 2. UI 업데이트
    for (const key in grades) {
        const displayElement = document.getElementById(`prob-display-${key}`);
        if (displayElement) {
            const originalGrade = grades[key];
            const newProbability = effectiveProbs[key];
            const probText = `${newProbability.toFixed(4)}%`;
            let displayText = `${probText} | ${originalGrade.coins.toLocaleString()}코인`;

            const isChanged = Math.abs(newProbability - originalGrade.probability) > 0.0001;

            if (isChanged) {
                if (newProbability > originalGrade.probability) {
                    const color = hasCustomProbs ? '#f1c40f' : '#2ecc71'; // 커스텀은 노란색, 행운은 초록색
                    displayText = `<span style="color: ${color};">${probText} (↑)</span> | ${originalGrade.coins.toLocaleString()}코인`;
                } else {
                    displayText = `<span style="color: #e74c3c;">${probText} (↓)</span> | ${originalGrade.coins.toLocaleString()}코인`;
                }
            } else {
                displayText = `${originalGrade.probability}% | ${originalGrade.coins.toLocaleString()}코인`;
            }
            
            displayElement.innerHTML = displayText;
        }
    }
}

/**
 * 다음 이벤트까지 남은 시간을 계산하고 표시하는 카운트다운 타이머를 초기화합니다.
 */
function initEventCountdown() {
    const countdownContainer = document.getElementById('eventCountdown');
    const countdownTextEl = document.getElementById('countdownText');
    const countdownTimerEl = document.getElementById('countdownTimer');

    if (!countdownContainer || !countdownTextEl || !countdownTimerEl) {
        console.error("Countdown elements not found.");
        return;
    }

    function updateCountdown() {
        const now = new Date();
        const nextEventTime = getNextEventTime();
        const timeLeft = nextEventTime.getTime() - now.getTime();

        // KST 기준으로 현재 시간 가져오기
        const kstNow = getKSTDate(now);
        const dayOfWeekKST = kstNow.getDay(); // 0=일, 6=토
        const hoursKST = kstNow.getHours();
        const minutesKST = kstNow.getMinutes();

        const isEventLive = (window.isEventTimeSimulated || (dayOfWeekKST === 6 && hoursKST === 19 && minutesKST < 30));

        if (isEventLive) {
            countdownContainer.classList.add('live');
            countdownTextEl.textContent = '🔥';
            // 시뮬레이션 중일 경우 텍스트를 다르게 표시합니다.
            countdownTimerEl.textContent = window.isEventTimeSimulated ? '이벤트 시뮬레이션 중!' : '이벤트/업데이트 진행 중!';
            // 이벤트가 진행 중일 때는 타이머를 계속 실행할 필요가 없으므로 여기서 함수를 종료합니다.
            return;
        }
        
        countdownContainer.classList.remove('live');

        if (timeLeft <= 0) {
            countdownTimerEl.textContent = '이벤트 시간 확인 중...';
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownTextEl.textContent = '다음 업데이트까지';
        countdownTimerEl.textContent = 
            `${String(days).padStart(2, '0')}일 ` +
            `${String(hoursLeft).padStart(2, '0')}:` +
            `${String(minutesLeft).padStart(2, '0')}:` +
            `${String(secondsLeft).padStart(2, '0')}`;
    }

    function getNextEventTime() {
        const now = new Date();
        const kstNow = getKSTDate(now);
        const eventHourKST = 19;
        const eventDayKST = 6; // 토요일

        const nextEvent = new Date(kstNow.getTime());
        nextEvent.setHours(eventHourKST, 0, 0, 0);

        let daysUntilSaturday = (eventDayKST - kstNow.getDay() + 7) % 7;

        if (daysUntilSaturday === 0 && kstNow.getHours() >= eventHourKST) {
            daysUntilSaturday = 7; // 오늘이 토요일이고 이벤트 시간이 지났으면 다음 주로 설정
        }

        nextEvent.setDate(kstNow.getDate() + daysUntilSaturday);
        return nextEvent;
    }

    updateCountdown(); // 즉시 실행
    setInterval(updateCountdown, 1000); // 1초마다 업데이트

    // 외부에서 카운트다운을 강제로 업데이트할 수 있도록 함수를 노출합니다.
    initEventCountdown.forceUpdate = updateCountdown;
}

/**
 * 행운 감소 디버프 상태에 따라 확률 표시를 업데이트합니다.
 */
function updateProbabilityDisplay() {
    const highTierKeys = ['rare', 'epic', 'legendary', 'mythic', 'cosmic', 'divine', 'ultimate-jaeho', 'ancient', 'transcendence'];

    let effectiveProbs = {};
    const hasCustomProbs = stats.customProbabilities && Object.keys(stats.customProbabilities).length > 0;

    // 1. 적용될 확률 결정 (사용자 지정 > 영구 행운 > 기본)
    if (hasCustomProbs) {
        // 사용자 지정 확률이 있으면 그것을 사용
        for (const key in grades) {
            effectiveProbs[key] = stats.customProbabilities[key] ?? grades[key].probability;
        }
    } else {
        // 사용자 지정 확률이 없으면 영구 행운을 계산
        let tempGrades = JSON.parse(JSON.stringify(grades));
        const luckLevel = stats.permanentLuck || 0;
        if (luckLevel > 0) {
            const totalBonus = PERMANENT_LUCK_CONFIG.BONUSES[luckLevel - 1];
            if (totalBonus) {
                const lowTierKeys = ['common', 'uncommon'];
                let totalLowTierProb = lowTierKeys.reduce((sum, key) => sum + tempGrades[key].probability, 0);
                const totalDeduction = Math.min(totalBonus, totalLowTierProb * 0.5);

                if (totalLowTierProb > 0) {
                    lowTierKeys.forEach(key => {
                        const deduction = (tempGrades[key].probability / totalLowTierProb) * totalDeduction;
                        tempGrades[key].probability -= deduction;
                    });
                }

                const totalHighTierProb = highTierKeys.reduce((sum, key) => sum + tempGrades[key].probability, 0);
                if (totalHighTierProb > 0) {
                    highTierKeys.forEach(key => {
                        const addition = (tempGrades[key].probability / totalHighTierProb) * totalDeduction;
                        tempGrades[key].probability += addition;
                    });
                }
            }
        }
        for (const key in tempGrades) {
            effectiveProbs[key] = tempGrades[key].probability;
        }
    }

    // 2. UI 업데이트
    for (const key in grades) {
        const displayElement = document.getElementById(`prob-display-${key}`);
        if (displayElement) {
            const originalGrade = grades[key];
            const newProbability = effectiveProbs[key];
            const probText = `${newProbability.toFixed(4)}%`;
            let displayText = `${probText} | ${originalGrade.coins.toLocaleString()}코인`;

            const isChanged = Math.abs(newProbability - originalGrade.probability) > 0.0001;

            if (isChanged) {
                if (newProbability > originalGrade.probability) {
                    const color = hasCustomProbs ? '#f1c40f' : '#2ecc71'; // 커스텀은 노란색, 행운은 초록색
                    displayText = `<span style="color: ${color};">${probText} (↑)</span> | ${originalGrade.coins.toLocaleString()}코인`;
                } else {
                    displayText = `<span style="color: #e74c3c;">${probText} (↓)</span> | ${originalGrade.coins.toLocaleString()}코인`;
                }
            } else {
                displayText = `${originalGrade.probability}% | ${originalGrade.coins.toLocaleString()}코인`;
            }
            
            displayElement.innerHTML = displayText;
        }
    }
}

/**
 * 입장 퀴즈의 정답을 확인합니다.
 * @param {string} correctString - 정답 문자열
 * @param {string} userInput - 사용자 입력값
 * @returns {boolean} 일치 여부
 */
function verifyEntryQuiz(correctString, userInput) {
    // 대소문자를 구분하지 않고 비교
    return correctString.toLowerCase() === userInput.toLowerCase().trim();
}

/**
 * 지정된 길이의 랜덤 문자열을 생성합니다. (알파벳 대문자 및 숫자)
 * @param {number} length - 생성할 문자열의 길이
 * @returns {string} 생성된 랜덤 문자열
 */
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}