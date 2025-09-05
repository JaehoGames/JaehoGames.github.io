// main.js - 게임 초기화 및 상점 시스템 관리

/**
 * 상점 시스템 초기화
 */
function initShopSystem() {
    // 상점 데이터 로드
    loadStatsFromURLWithShop();
    loadShopData();
    
    // 상점 UI 업데이트
    updateActiveEffectsDisplay();
    updateShopButtons();
    
    // 상점 모달 이벤트 리스너
    const shopModal = document.getElementById('shopModal');
    if (shopModal) {
        // 모달 외부 클릭시 닫기
        shopModal.addEventListener('click', function(e) {
            if (e.target === shopModal) {
                toggleShop();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && shopModal.classList.contains('show')) {
                toggleShop();
            }
        });
    }
    
    // 상점 아이템 호버 효과 초기화
    initShopHoverEffects();
    
    // 주기적으로 효과 만료 체크 (5초마다)
    setInterval(() => {
        if (Object.values(activeEffects).some(value => value > 0)) {
            updateActiveEffectsDisplay();
            saveShopData();
        }
    }, 5000);
}

/**
 * 봇 방지 퀴즈 시스템 초기화
 */
function initQuizSystem() {
    // 1분 30초(90000ms) 마다 퀴즈 표시
    quiz.interval = setInterval(showQuiz, 90000);

    document.getElementById('quizSubmitButton').addEventListener('click', () => {
        // 확인 절차
        if (confirm(`'${quiz.userAnswer}' (으)로 답변을 제출하시겠습니까?`)) {
            const isCorrect = quiz.userAnswer === quiz.correctAnswer;
            handleQuizResult(isCorrect);
        }
    });

    console.log('봇 방지 퀴즈 시스템이 활성화되었습니다.');
}

/**
 * 기존 함수들을 상점 시스템과 연동하도록 오버라이드
 */
function overrideFunctionsForShop() {
    // pullGacha 함수를 상점 효과가 적용된 버전으로 교체
    window.pullGacha = pullGachaWithEffects;
    
    // updateStatsDisplay 함수를 향상된 버전으로 교체  
    window.updateStatsDisplay = updateStatsDisplayEnhanced;
    
    // 코인 애니메이션 함수 교체
    window.animateCoinsGained = animateCoinsGainedEnhanced;
    
    // 리셋 함수 교체
    window.resetGame = resetGameWithShop;
    
    // URL 복사 함수 교체
    window.copyShareURL = copyShareURLWithShop;
    
    // 저장 함수 교체
    window.saveStatsToURL = saveStatsToURLWithShop;
}

/**
 * 코인 아이콘 클릭 이벤트 초기화
 */
function initCoinClickSound() {
    const coinIcon = document.querySelector('.coin-icon');
    const coinSound = document.getElementById('coinClickSound');

    if (coinIcon && coinSound) {
        coinIcon.addEventListener('click', () => {
            coinSound.currentTime = 0; // 소리를 처음부터 다시 재생
            coinSound.play().catch(e => console.log("사운드 재생 실패:", e));
        });
    }
}
/**
 * 페이지 로드 완료시 상점 시스템 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    // 기존 시스템이 로드된 후 상점 시스템 초기화
    setTimeout(() => {
        try {
            initShopSystem();
            overrideFunctionsForShop();
            initQuizSystem(); // 퀴즈 시스템 초기화
            initCoinClickSound(); // 코인 클릭 사운드 초기화
            
            console.log('상점 시스템이 성공적으로 초기화되었습니다.');
            
            // 초기화 완료 알림 (선택사항)
            if (Object.values(activeEffects).some(value => value > 0)) {
                showNotification('활성 효과가 복구되었습니다!', '#2ecc71');
            }
            
        } catch (error) {
            console.error('상점 시스템 초기화 실패:', error);
        }
    }, 100);
});

/**
 * 페이지 종료시 데이터 저장
 */
window.addEventListener('beforeunload', function() {
    try {
        saveShopData();
        saveStatsToURLWithShop();
    } catch (error) {
        console.log('종료시 데이터 저장 실패:', error);
    }
});

/**
 * 개발자용 디버깅 함수들 (콘솔에서 사용 가능)
 */
if (typeof window !== 'undefined') {
    window.debugShop = {
        // 코인 추가
        addCoins: function(amount) {
            stats.coins += amount;
            updateStatsDisplay();
            showNotification(`${amount} 코인이 추가되었습니다!`, '#ffd700');
        },
        
        // 효과 추가
        addEffect: function(effectName, duration) {
            if (activeEffects.hasOwnProperty(effectName)) {
                activeEffects[effectName] += duration;
                updateActiveEffectsDisplay();
                showNotification(`${getEffectName(effectName)} ${duration}회 추가!`, '#9b59b6');
            }
        },
        
        // 모든 효과 클리어
        clearEffects: function() {
            Object.keys(activeEffects).forEach(key => {
                activeEffects[key] = 0;
            });
            updateActiveEffectsDisplay();
            showNotification('모든 효과가 클리어되었습니다!', '#e74c3c');
        },
        
        // 현재 상태 출력
        showStatus: function() {
            console.log('=== 현재 상점 시스템 상태 ===');
            console.log('코인:', stats.coins);
            console.log('활성 효과:', activeEffects);
            console.log('구매한 아이템:', stats.itemsPurchased || 0);
            console.log('사용한 코인:', stats.coinsSpent || 0);
        }
    };
}