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
 * 만원 지폐 효과 생성
 */
function createMoneyFall() {
    const container = document.getElementById('fireworks');
    const moneySymbol = '₩';

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const money = document.createElement('div');
            money.textContent = moneySymbol;
            money.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}vw;
                top: -50px;
                font-size: ${Math.random() * 30 + 20}px;
                color: #2e8b57;
                pointer-events: none;
                animation: moneyFall 4s linear forwards;
                text-shadow: 0 0 10px #85bb65, 0 0 20px #fff;
            `;
            container.appendChild(money);
            setTimeout(() => money.remove(), 4000);
        }, i * 150);
    }
}

/**
 * 등급별 특수 효과 적용
 * @param {string} gradeKey - 등급 키
 */
function applySpecialEffects(gradeKey) {
    const screenFlash = document.getElementById('screenFlash');

    switch(gradeKey) {
        case 'transcendence':
            // 초월 효과: 밝은 빛과 함께 반짝이는 입자가 퍼지는 효과
            screenFlash.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)';
            screenFlash.style.opacity = '1';
            document.body.style.background = 'linear-gradient(135deg, #e6e6fa 0%, #d8bfd8 100%)';
            createFireworks(60, ['#ffffff', '#f0f8ff', '#e6e6fa']);
            
            setTimeout(() => {
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                screenFlash.style.opacity = '0';
            }, 7500); // 가장 긴 연출 시간
            // 트랜지션은 개별적으로 설정하여 자연스럽게 복귀
            setTimeout(() => { screenFlash.style.transition = 'opacity 2.5s ease-out'; }, 5000);
            setTimeout(() => { document.body.style.transition = 'background 2.5s ease-out'; }, 5000);
            break;
        case 'ancient':
            // 만원 효과: 초록색 섬광과 함께 돈이 쏟아지는 효과
            screenFlash.style.background = 'radial-gradient(circle, rgba(46, 204, 113, 0.8) 0%, transparent 70%)';
            screenFlash.style.opacity = '1';
            document.body.style.background = 'linear-gradient(to bottom, #27ae60, #229954)';
            createMoneyFall();
            setTimeout(() => {
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                screenFlash.style.opacity = '0';
            }, 7000); // 가장 긴 연출 시간
            break;
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

        case 'cosmic':
            // 우주 효과: 보라색과 검은색이 섞인 섬광과 배경
            screenFlash.style.background = 'radial-gradient(circle, rgba(138, 43, 226, 0.8) 0%, transparent 70%)';
            screenFlash.style.opacity = '1';
            screenFlash.style.transition = 'none';
            document.body.style.background = 'linear-gradient(135deg, #000000 0%, #191970 50%, #4B0082 100%)';
            document.body.style.transition = 'none';
            createFireworks(50, ['#4B0082', '#8A2BE2', '#191970', '#FFFFFF']);
            
            setTimeout(() => {
                screenFlash.style.transition = 'opacity 2s ease-out';
                document.body.style.transition = 'background 2s ease-out';
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                screenFlash.style.opacity = '0';
            }, 5000);
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
        const audio = new Audio('assets/audio/purchase.wav'); // 파일 경로로 변경
        audio.volume = 0.3;
        audio.play().catch(() => {}); // 사운드 실패해도 무시
    } catch (e) {
        // 사운드 실패시 무시
    }
}

/**
 * 확률 계산에 효과 적용 (기존 getRandomGrade 함수를 수정)
 */
function getRandomGradeWithEffects() {
    // [수정] 페이지 로드 시 만료 체크를 놓쳤을 수 있으므로, 뽑기 시 한 번 더 체크
    if (typeof isLuckDebuffed === 'function') {
        isLuckDebuffed(); 
    }

    const modifiedGrades = JSON.parse(JSON.stringify(grades));
    const highTierKeys = ['rare', 'epic', 'legendary', 'mythic', 'cosmic', 'divine', 'ultimate-jaeho', 'ancient', 'transcendence'];

    // 0. 사용자 지정 확률 적용
    if (stats.customProbabilities && Object.keys(stats.customProbabilities).length > 0) {
        // 확률의 총합이 100인지 확인 (안전장치)
        const totalCustomProb = Object.values(stats.customProbabilities).reduce((sum, prob) => sum + prob, 0);
        if (Math.abs(totalCustomProb - 100) < 0.001) {
            for (const key in stats.customProbabilities) {
                if (modifiedGrades[key]) {
                    modifiedGrades[key].probability = stats.customProbabilities[key];
                }
            }
            console.log("사용자 지정 확률을 적용했습니다.");
        } else {
            console.warn(`Custom probabilities for user ${currentUser.uid} do not sum to 100. Using default probabilities.`);
        }
    }

    // 1. 영구 행운 적용
    const luckLevel = stats.permanentLuck || 0;
    if (luckLevel > 0) {
        // 레벨에 따른 총 보너스 확률을 가져옴
        const totalBonus = PERMANENT_LUCK_CONFIG.BONUSES[luckLevel - 1];
        if (!totalBonus) {
            console.error(`Invalid luck level or bonus not defined: ${luckLevel}`);
        }
        
        const lowTierKeys = ['common', 'uncommon'];
        let totalLowTierProb = lowTierKeys.reduce((sum, key) => sum + modifiedGrades[key].probability, 0);

        const totalDeduction = Math.min(totalBonus, totalLowTierProb * 0.5); // 하위 등급 확률의 50%까지만 뺌

        if (totalLowTierProb > 0) {
            lowTierKeys.forEach(key => {
                const deduction = (modifiedGrades[key].probability / totalLowTierProb) * totalDeduction;
                modifiedGrades[key].probability -= deduction;
            });
        }

        const totalHighTierProb = highTierKeys.reduce((sum, key) => sum + modifiedGrades[key].probability, 0);
        if (totalHighTierProb > 0) {
            highTierKeys.forEach(key => {
                const addition = (modifiedGrades[key].probability / totalHighTierProb) * totalDeduction;
                modifiedGrades[key].probability += addition;
            });
        }
    }

    // 2. 얼티밋 부스트 확인
    if (activeEffects.ultimateBoost > 0) {
        const boostedUltimateChance = modifiedGrades['ultimate-jaeho'].probability * 10; // 10배 확률
        if (Math.random() * 100 <= boostedUltimateChance) {
            return 'ultimate-jaeho';
        }
    }
    
    // 3. 행운 감소 디버프 효과
    if (typeof isLuckDebuffed === 'function' && isLuckDebuffed()) {
        highTierKeys.forEach(key => {
            modifiedGrades[key].probability *= antiCheatConfig.LUCK_DEBUFF_FACTOR;
        });
    }

    // 최종 확률로 등급 계산
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [key, grade] of Object.entries(modifiedGrades)) {
        cumulative += grade.probability;
        if (random <= cumulative) {
            return key;
        }
    }
    return 'common';
}

/**
 * 코인 계산에 효과 적용
 */
function calculateCoinsWithEffects(baseCoins) {
    let finalCoins = baseCoins;
    if (activeEffects.coinBoost > 0) {
        finalCoins *= 2;
    }
    
    return finalCoins;
}

/**
 * 뽑기 속도 조절
 */
function getGachaSpeed() {
    if (activeEffects.speedBoost > 0) {
        return Math.round(2000 / 3); // 1/3 속도 (원래 2000ms -> 약 667ms)
    }
    return 2000; // 기본 속도
}

/**
 * 효과 적용 후 가챠 함수 통합 (기존 pullGacha 함수 대체)
 */
function pullGachaWithEffects(event) {
    // 안티치트 시스템 검사
    if (typeof registerGachaClick === 'function' && registerGachaClick(event)) {
        return; // 매크로가 감지되거나 퀴즈/페널티가 활성화되어 뽑기 중단
    }

    checkEffectExpiration();
    
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
    
    pullButton.disabled = true;
    pullButton.textContent = '뽑는 중...';
    resultContainer.classList.remove('show');
    gachaBox.classList.add('opening');
    
    const gachaSpeed = getGachaSpeed();
    
    setTimeout(() => {
        try {
            const resultGradeKey = getRandomGradeWithEffects();
            const grade = grades[resultGradeKey];
            const item = getRandomImage(resultGradeKey);
            const imagePath = item.path;
            const itemName = item.name;
            const baseCoins = grade.coins || 0;
            const finalCoins = calculateCoinsWithEffects(baseCoins);

            if (!grade) {
                console.error('등급 데이터를 찾을 수 없습니다:', resultGradeKey);
                throw new Error('등급 데이터 오류');
            }

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
            applySpecialEffects(resultGradeKey);

            // 결과 처리 함수 호출 (1.2초 후)
            setTimeout(() => {
                if (typeof showGachaChoice === 'function') {
                    showGachaChoice({ gradeKey: resultGradeKey, imagePath, itemName, grade, finalCoins, baseCoins });
                }
            }, 1200);

            setTimeout(() => {
                gachaBox.classList.remove('opening');
            }, 1000);
            
        } catch (error) {
            console.error('가챠 실행 중 오류:', error);
            // 오류 발생 시 UI 복원
            pullButton.disabled = false;
            pullButton.textContent = '재호 뽑기';
            gachaBox.classList.remove('opening');
        }

        // 버튼 활성화는 선택 모달에서 처리하므로 여기서는 제거
    }, gachaSpeed);
}