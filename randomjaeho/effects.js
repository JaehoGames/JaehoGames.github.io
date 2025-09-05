// 특수 효과 및 애니메이션 모듈

/**
 * 폭죽 효과 생성
 * @param {number} count - 폭죽 개수
 * @param {Array<string>} colors - 폭죽 색상 배열
 */
function createFireworks(count, colors) {
    const fireworksContainer = document.getElementById('fireworks');
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * window.innerWidth + 'px';
            firework.style.top = Math.random() * window.innerHeight + 'px';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            fireworksContainer.appendChild(firework);
            
            // 2초 후 폭죽 요소 제거
            setTimeout(() => {
                firework.remove();
            }, 2000);
        }, i * 100);
    }
}

/**
 * 등급별 특수 효과 적용
 * @param {string} gradeKey - 등급 키
 */
function applySpecialEffects(gradeKey) {
    const screenFlash = document.getElementById('screenFlash');

    switch(gradeKey) {
        case 'ultimate-jaeho':
            // 얼티밋 재호 효과: 파란색 섬광과 배경 변경
            screenFlash.style.background = 'radial-gradient(circle, rgba(0, 102, 255, 0.8) 0%, transparent 70%)';
            screenFlash.style.opacity = '1';
            screenFlash.style.transition = 'none';
            document.body.style.background = 'linear-gradient(135deg, #0066ff 0%, #003d99 100%)';
            document.body.style.transition = 'none';
            createFireworks(50, ['#0066ff', '#00aaff', '#ffffff']);
            
            setTimeout(() => {
                screenFlash.style.transition = 'opacity 2s ease-out';
                document.body.style.transition = 'background 2s ease-out';
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                screenFlash.style.opacity = '0';
            }, 6000);
            break;

        case 'divine':
            // 신성 효과: 무지개 섬광과 다채로운 배경
            screenFlash.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)';
            screenFlash.style.opacity = '1';
            screenFlash.style.transition = 'none';
            document.body.style.background = 'linear-gradient(135deg, #ff0000 0%, #ff8800 20%, #ffff00 40%, #00ff00 60%, #0088ff 80%, #8800ff 100%)';
            document.body.style.transition = 'none';
            createFireworks(40, ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#0000ff', '#8800ff']);
            
            setTimeout(() => {
                screenFlash.style.transition = 'opacity 1.8s ease-out';
                document.body.style.transition = 'background 1.8s ease-out';
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                screenFlash.style.opacity = '0';
            }, 5500);
            break;

        case 'mythic':
            // 신화 효과: 빨간색 섬광과 불타는 배경
            screenFlash.style.background = 'radial-gradient(circle, rgba(231, 76, 60, 0.6) 0%, transparent 70%)';
            screenFlash.style.opacity = '1';
            screenFlash.style.transition = 'none';
            document.body.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
            document.body.style.transition = 'none';
            createFireworks(25, ['#e74c3c', '#ff6b6b', '#ffffff']);
            
            setTimeout(() => {
                screenFlash.style.transition = 'opacity 1.5s ease-out';
                document.body.style.transition = 'background 1.5s ease-out';
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                screenFlash.style.opacity = '0';
            }, 4500);
            break;

        case 'legendary':
            // 레전드리 효과: 황금색 섬광과 배경
            screenFlash.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)';
            screenFlash.style.opacity = '1';
            screenFlash.style.transition = 'none';
            document.body.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
            document.body.style.transition = 'none';
            createFireworks(20, ['#ffd700', '#ffed4e', '#ffffff']);
            
            setTimeout(() => {
                screenFlash.style.transition = 'opacity 1.2s ease-out';
                document.body.style.transition = 'background 1.2s ease-out';
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                screenFlash.style.opacity = '0';
            }, 3500);
            break;

        case 'epic':
            // 에픽 효과: 보라색 폭죽
            createFireworks(12, ['#9b59b6', '#8e44ad', '#ffffff']);
            break;

        case 'rare':
            // 레어 효과: 파란색 폭죽
            createFireworks(8, ['#3498db', '#2980b9']);
            break;
        
        // 나머지 등급은 특별한 효과 없음
    }
}

// 상점 효과 관련 함수들 (effects.js 파일 끝에 추가)

/**
 * 상점 모달 토글
 */
function toggleShop() {
    const shopModal = document.getElementById('shopModal');
    if (!shopModal) return;
    
    if (shopModal.classList.contains('show')) {
        shopModal.classList.remove('show');
        setTimeout(() => {
            shopModal.style.display = 'none';
        }, 300);
    } else {
        shopModal.style.display = 'flex';
        setTimeout(() => {
            shopModal.classList.add('show');
        }, 10);
        
        // 상점 열 때 UI 업데이트
        updateActiveEffectsDisplay();
        updateShopButtons();
    }
}

/**
 * 효과 적용 후 UI 업데이트 애니메이션
 */
function animateEffectActivation(effectType, duration) {
    const effectsContainer = document.getElementById('effectsList');
    if (!effectsContainer) return;
    
    // 새 효과 태그에 특별한 애니메이션 적용
    setTimeout(() => {
        const effectTags = effectsContainer.querySelectorAll('.effect-tag');
        effectTags.forEach(tag => {
            if (tag.textContent.includes(getEffectName(effectType))) {
                tag.style.animation = 'none';
                tag.offsetHeight; // 리플로우 강제 실행
                tag.style.animation = 'newEffectGlow 1s ease-out';
            }
        });
    }, 100);
}

/**
 * 상점 아이템 호버 효과
 */
function initShopHoverEffects() {
    const shopItems = document.querySelectorAll('.shop-item');
    
    shopItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.item-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.item-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

/**
 * 효과 만료 알림
 */
function checkEffectExpiration() {
    const expiredEffects = [];
    
    Object.entries(activeEffects).forEach(([effect, remaining]) => {
        if (remaining === 1) { // 다음 번이 마지막
            expiredEffects.push(effect);
        } else if (remaining === 0) {
            // 완전히 만료된 효과는 알림 없이 제거
            delete activeEffects[effect];
        }
    });
    
    expiredEffects.forEach(effect => {
        showNotification(`${getEffectName(effect)} 효과가 곧 만료됩니다!`, '#f39c12');
    });
    
    if (expiredEffects.length > 0) {
        updateActiveEffectsDisplay();
    }
}

/**
 * 구매 성공 특수 효과
 */
function playPurchaseEffect(itemId) {
    const item = shopItems[itemId];
    if (!item) return;
    
    // 아이템별 특수 효과
    switch(itemId) {
        case 'ultimateChance':
            createFireworks(15, ['#0066ff', '#00aaff', '#ffffff']);
            break;
        case 'guaranteedRare':
            createFireworks(10, ['#3498db', '#2980b9']);
            break;
        case 'luckPotion':
            createFireworks(8, ['#2ecc71', '#27ae60']);
            break;
        case 'mysteryBox':
            createFireworks(12, ['#9b59b6', '#8e44ad', '#e67e22']);
            break;
        default:
            createFireworks(5, [item.color]);
    }
    
    // 구매 사운드 효과 (옵션)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRvIBAABXQVZFZm10IBAAAAABAAEEAA==');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // 사운드 실패해도 무시
    } catch (e) {
        // 사운드 실패시 무시
    }
}

/**
 * 상점 데이터 저장/로드
 */
function saveShopData() {
    const shopData = {
        activeEffects: activeEffects,
        itemsPurchased: stats.itemsPurchased || 0,
        coinsSpent: stats.coinsSpent || 0
    };
    
    try {
        localStorage.setItem('randomJaehoShop', JSON.stringify(shopData));
    } catch (e) {
        // localStorage 실패시 URL에 저장
        const encoded = btoa(JSON.stringify(shopData));
        const url = new URL(window.location);
        url.searchParams.set('shop', encoded);
        window.history.replaceState({}, '', url);
    }
}

function loadShopData() {
    try {
        // localStorage에서 먼저 시도
        const saved = localStorage.getItem('randomJaehoShop');
        if (saved) {
            const shopData = JSON.parse(saved);
            activeEffects = { ...activeEffects, ...shopData.activeEffects };
            stats.itemsPurchased = shopData.itemsPurchased || 0;
            stats.coinsSpent = shopData.coinsSpent || 0;
            return;
        }
    } catch (e) {
        // localStorage 실패시 URL에서 로드
        const urlParams = new URLSearchParams(window.location.search);
        const shopData = urlParams.get('shop');
        if (shopData) {
            try {
                const decoded = JSON.parse(atob(shopData));
                activeEffects = { ...activeEffects, ...decoded.activeEffects };
                stats.itemsPurchased = decoded.itemsPurchased || 0;
                stats.coinsSpent = decoded.coinsSpent || 0;
            } catch (e) {
                console.log('상점 데이터 로드 실패');
            }
        }
    }
}

/**
 * 효과 적용 후 가챠 함수 통합 (기존 pullGacha 함수 대체)
 */
function pullGachaWithEffects() {
    // 효과 만료 체크
    checkEffectExpiration();
    
    // 기존 가챠 로직에 효과 적용
    const gachaBox = document.getElementById('gachaBox');
    const pullButton = document.getElementById('pullButton');
    const resultContainer = document.getElementById('resultContainer');
    const resultImage = document.getElementById('resultImage');
    const resultText = document.getElementById('resultText');
    const resultGrade = document.getElementById('resultGrade');
    
    if (!gachaBox || !pullButton || !resultContainer || !resultImage || !resultText || !resultGrade) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 음악 재생
    try {
        const bgMusic = document.getElementById("bgMusic");
        if (bgMusic) {
            bgMusic.play().catch(e => console.log('음악 재생 실패:', e));
        }
    } catch (e) {
        console.log('음악 재생 중 오류:', e);
    }
    
    // UI 상태 변경
    pullButton.disabled = true;
    pullButton.textContent = '뽑는 중...';
    resultContainer.classList.remove('show');
    gachaBox.classList.add('opening');
    
    // 효과가 적용된 속도로 실행
    const gachaSpeed = getGachaSpeed();
    
    setTimeout(() => {
        try {
            // 효과가 적용된 등급 선택
            const resultGradeKey = getRandomGradeWithEffects();
            const grade = grades[resultGradeKey];
            const imagePath = getRandomImage(resultGradeKey);
            const baseCoins = grade.coins || 0;
            const finalCoins = calculateCoinsWithEffects(baseCoins);
            
            if (!grade) {
                console.error('등급 데이터를 찾을 수 없습니다:', resultGradeKey);
                throw new Error('등급 데이터 오류');
            }
            
            // 통계 업데이트
            stats.total++;
            stats[resultGradeKey]++;
            stats.coins += finalCoins;
            
            // 활성 효과 차감 (luckBoost는 사용시 차감)
            if (activeEffects.luckBoost > 0) {
                activeEffects.luckBoost--;
            }
            
            // 결과 표시
            resultImage.src = imagePath;
            resultImage.className = `result-image ${resultGradeKey}`;
            resultImage.onerror = function() {
                this.src = createFallbackImage(grade.color, grade.name);
            };
            
            resultText.textContent = `${grade.name} 등급!`;
            
            if (grade.color.includes('gradient')) {
                resultText.style.background = grade.color;
                resultText.style.backgroundClip = 'text';
                resultText.style.webkitBackgroundClip = 'text';
                resultText.style.webkitTextFillColor = 'transparent';
                resultText.style.color = 'transparent';
            } else {
                resultText.style.color = grade.color;
                resultText.style.background = 'none';
                resultText.style.webkitTextFillColor = 'initial';
            }
            
            resultContainer.classList.add('show');
            
            // 코인 부스트 효과 표시
            if (finalCoins > baseCoins) {
                animateCoinsGained(finalCoins, true); // 부스트 표시
            } else {
                animateCoinsGained(finalCoins);
            }
            
            updateStatsDisplay();
            updateActiveEffectsDisplay();
            applySpecialEffects(resultGradeKey);
            saveStatsToURL();
            saveShopData();
            
            setTimeout(() => {
                gachaBox.classList.remove('opening');
            }, 1000);
            
        } catch (error) {
            console.error('가챠 실행 중 오류:', error);
            resultText.textContent = '오류가 발생했습니다.';
            resultGrade.textContent = '다시 시도해주세요.';
            resultContainer.classList.add('show');
        }
        
        pullButton.disabled = false;
        pullButton.textContent = '재호 뽑기';
    }, gachaSpeed);
}