// 가챠 핵심 로직 모듈

/**
 * 확률 계산에 효과 적용 (영구 행운, 부스트, 디버프 등)
 * @returns {string} 최종 선택된 등급 키
 */
function getRandomGradeWithEffects() {
    // 뽑기 시 행운 디버프 만료 여부 체크
    if (typeof isLuckDebuffed === 'function') {
        isLuckDebuffed(); 
    }

    // 원본 grades 객체를 복사하여 수정
    const modifiedGrades = JSON.parse(JSON.stringify(grades));
    const highTierKeys = ['rare', 'epic', 'legendary', 'mythic', 'cosmic', 'divine', 'ultimate-jaeho', 'ancient', 'transcendence'];

    // 1. 사용자 지정 확률 적용 (가장 높은 우선순위)
    if (stats.customProbabilities && Object.keys(stats.customProbabilities).length > 0) {
        const totalCustomProb = Object.values(stats.customProbabilities).reduce((sum, prob) => sum + prob, 0);
        if (Math.abs(totalCustomProb - 100) < 0.001) {
            for (const key in stats.customProbabilities) {
                if (modifiedGrades[key]) {
                    modifiedGrades[key].probability = stats.customProbabilities[key];
                }
            }
        } else {
            console.warn(`사용자 지정 확률의 총합이 100이 아니므로 기본 확률을 사용합니다.`);
        }
    }

    // 2. 영구 행운 적용
    const luckLevel = stats.permanentLuck || 0;
    if (luckLevel > 0) {
        const totalBonus = PERMANENT_LUCK_CONFIG.BONUSES[luckLevel - 1];
        if (totalBonus) {
            const lowTierKeys = ['common', 'uncommon'];
            let totalLowTierProb = lowTierKeys.reduce((sum, key) => sum + modifiedGrades[key].probability, 0);
            const totalDeduction = Math.min(totalBonus, totalLowTierProb * 0.5); // 하위 등급 확률의 50%까지만 차감

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
    }

    // 3. 얼티밋 부스트 확인
    if (activeEffects.ultimateBoost > 0) {
        const boostedUltimateChance = modifiedGrades['ultimate-jaeho'].probability * 10; // 10배 확률
        if (Math.random() * 100 <= boostedUltimateChance) {
            return 'ultimate-jaeho';
        }
    }
    
    // 4. 행운 감소 디버프 효과
    if (typeof isLuckDebuffed === 'function' && isLuckDebuffed()) {
        highTierKeys.forEach(key => {
            modifiedGrades[key].probability *= antiCheatConfig.LUCK_DEBUFF_FACTOR;
        });
    }

    // 최종 확률 정규화 (부동소수점 오차 보정)
    let totalProb = 0;
    for (const key in modifiedGrades) {
        totalProb += modifiedGrades[key].probability;
    }
    const scaleFactor = 100 / totalProb;
    if (Math.abs(scaleFactor - 1) > 0.0001) { // 오차가 유의미할 때만 정규화
        for (const key in modifiedGrades) {
            modifiedGrades[key].probability *= scaleFactor;
        }
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
    return 'common'; // Fallback
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
 * 확률에 따라 랜덤 등급을 선택
 * @returns {string} 선택된 등급 키
 */
function getRandomGrade() {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [key, grade] of Object.entries(grades)) {
        cumulative += grade.probability;
        if (random <= cumulative) {
            return key;
        }
    }
    return 'common'; // 기본값
}

/**
 * 등급에서 랜덤 이미지를 선택
 * @param {string} gradeKey - 등급 키
 * @returns {object} 아이템 객체 { path, name }
 */
function getRandomImage(gradeKey) {
    const grade = grades[gradeKey];
    if (!grade || !grade.images || grade.images.length === 0) {
        return { path: 'assets/images/ui/placeholder.jpg', name: '알 수 없음' }; // 기본 아이템
    }
    const randomIndex = Math.floor(Math.random() * grade.images.length);
    return grade.images[randomIndex];
}

/**
 * 이미지 로드 실패시 사용할 대체 이미지 생성
 * @param {string} color - 배경 색상
 * @param {string} text - 표시할 텍스트
 * @returns {string} Base64 인코딩된 이미지 데이터
 */
function createFallbackImage(color, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    // gradient 색상 처리
    if (color.includes('gradient')) {
        const gradient = ctx.createLinearGradient(0, 0, 180, 180);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.16, '#ff8800');
        gradient.addColorStop(0.33, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.66, '#0088ff');
        gradient.addColorStop(0.83, '#0000ff');
        gradient.addColorStop(1, '#8800ff');
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = color;
    }
    
    ctx.fillRect(0, 0, 180, 180);
    
    // 텍스트 그리기
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 90, 90);
    
    return canvas.toDataURL();
}

/**
 * 재호코인 획득 애니메이션
 * @param {number} coins - 획득한 코인 수
 */
function animateCoinsGained(coins) {
    const coinsDisplay = document.getElementById('coinsDisplay');
    const coinAnimation = document.createElement('div');
    
    coinAnimation.textContent = `+${coins} 코인`;
    coinAnimation.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ffd700;
        font-size: 1.5em;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        z-index: 100;
        pointer-events: none;
        animation: coinBounce 2s ease-out forwards;
    `;
    
    // CSS 애니메이션 동적 생성
    if (!document.getElementById('coinAnimationCSS')) {
        const style = document.createElement('style');
        style.id = 'coinAnimationCSS';
        style.textContent = `
            @keyframes coinBounce {
                0% {
                    transform: translate(-50%, -50%) scale(0) rotate(0deg);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -100px) scale(1.5) rotate(180deg);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -150px) scale(0.8) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.querySelector('.game-container').appendChild(coinAnimation);
    
    setTimeout(() => {
        coinAnimation.remove();
    }, 2000);
}

/**
 * 뽑기 관련 UI의 상호작용 가능 여부를 설정합니다.
 * @param {boolean} interactable - 상호작용 가능 여부
 */
function setGachaInteractable(interactable) {
    const pullButton = document.getElementById('pullButton');
    const gachaBox = document.getElementById('gachaBox');
    
    pullButton.disabled = !interactable;
    gachaBox.style.pointerEvents = interactable ? 'auto' : 'none';
    gachaBox.style.cursor = interactable ? 'pointer' : 'default';
}

/**
 * 가챠 뽑기 메인 함수
 */
function pullGacha() {
    // 이 함수는 effects.js의 pullGachaWithEffects로 오버라이드됩니다.
    // 실제 로직은 그쪽을 확인해야 합니다.
    // 만약을 위해 경고를 남깁니다.
    console.warn("Direct call to pullGacha() detected. This function should be overridden.");
    // pullGachaWithEffects(event)를 호출해야 합니다.
    
    // DOM 요소들 가져오기
    const gachaBox = document.getElementById('gachaBox');
    const pullButton = document.getElementById('pullButton');
    const resultContainer = document.getElementById('resultContainer');
    const resultImage = document.getElementById('resultImage');
    const resultText = document.getElementById('resultText');
    const resultGrade = document.getElementById('resultGrade');
    const resultCoins = document.getElementById('resultCoins');
    
    // 필수 요소들이 존재하는지 확인
    if (!gachaBox || !pullButton || !resultContainer || !resultImage || !resultText || !resultGrade) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 음악 재생 (옵션)
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
    pullButton.textContent = '🎲 뽑는 중...';
    resultContainer.classList.remove('show');
    gachaBox.classList.add('opening');

    // 2초 후 결과 표시
    setTimeout(() => {
        try {
            const resultGradeKey = getRandomGrade();
            const grade = grades[resultGradeKey];
            const item = getRandomImage(resultGradeKey);
            const imagePath = item.path;
            const coinsGained = grade.coins || 0;

            // grades 데이터 검증
            if (!grade) {
                console.error('등급 데이터를 찾을 수 없습니다:', resultGradeKey);
                throw new Error('등급 데이터 오류');
            }

            // 통계 업데이트 (코인 포함)
            if (typeof stats !== 'undefined') {
                stats.total++;
                stats[resultGradeKey]++;
                stats.coins += coinsGained;  // 재호코인 추가
            }

            // 결과 이미지 설정
            resultImage.src = imagePath;
            resultImage.className = `result-image ${resultGradeKey}`;
            
            // 이미지 로드 실패시 대체 이미지 사용
            resultImage.onerror = function() {
                this.src = createFallbackImage(grade.color, grade.name);
            };

            // 결과 텍스트 설정
            resultText.textContent = `${grade.name} 등급!`;
            
            // 그라데이션 색상 처리
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

            // 결과 표시 및 효과 적용
            resultContainer.classList.add('show');
            
            // 코인 획득 애니메이션
            animateCoinsGained(coinsGained);
            
            // 통계 표시 업데이트
            if (typeof updateStatsDisplay === 'function') {
                updateStatsDisplay();
            }
            
            // 특수 효과 적용
            if (typeof applySpecialEffects === 'function') {
                applySpecialEffects(resultGradeKey);
            }

            // 가챠 박스 애니메이션 종료
            setTimeout(() => {
                gachaBox.classList.remove('opening');
            }, 1000);
            
        } catch (error) {
            console.error('가챠 실행 중 오류:', error);
            // 오류 발생시 기본 상태로 복원
            resultText.textContent = '오류가 발생했습니다.';
            resultGrade.textContent = '다시 시도해주세요.';
            resultContainer.classList.add('show');
        }
        
        // 버튼 상태 복원
        pullButton.disabled = false;
        pullButton.textContent = '🎲 재호 뽑기';
    }, 2000);
}

/**
 * 뽑기 속도를 조절합니다.
 * @returns {number} 가챠 애니메이션 시간 (ms)
 */
function getGachaSpeed() {
    if (activeEffects.speedBoost > 0) {
        return Math.round(2000 / 3); // 1/3 속도 (원래 2000ms -> 약 667ms)
    }
    return 2000; // 기본 속도
}

/**
 * 효과가 적용된 가챠 뽑기 메인 함수
 * @param {MouseEvent} event - 클릭 이벤트
 */
function pullGacha(event) {
    // 안티치트 시스템 검사
    if (typeof registerGachaClick === 'function' && registerGachaClick(event)) {
        return; // 매크로가 감지되거나 퀴즈/페널티가 활성화되어 뽑기 중단
    }

    // 상점 효과 만료 체크
    if (typeof checkEffectExpiration === 'function') {
        checkEffectExpiration();
    }
    
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

            // 적용될 변이 확률 결정 (사용자 지정 > 기본)
            let goldProb = MUTATION_CONFIG.GOLD.probability;
            let rainbowProb = MUTATION_CONFIG.RAINBOW.probability;
            let flameProb = MUTATION_CONFIG.FLAME.probability;
            if (stats.customMutationProbabilities && typeof stats.customMutationProbabilities === 'object') {
                goldProb = stats.customMutationProbabilities.gold ?? goldProb;
                rainbowProb = stats.customMutationProbabilities.rainbow ?? rainbowProb;
                flameProb = stats.customMutationProbabilities.flame ?? flameProb;
            }

            // 변이(Mutation) 확률 계산
            let mutation = []; // 여러 변이를 담기 위해 배열로 변경
            if (Math.random() * 100 < rainbowProb) mutation.push('rainbow');
            if (Math.random() * 100 < goldProb) mutation.push('gold');
            if (isFlameEventActive() && (Math.random() * 100 < flameProb)) mutation.push('flame');

            const baseCoins = grade.coins || 0;
            let finalCoins = calculateCoinsWithEffects(baseCoins); // 포션 효과 적용

            // 변이 코인 보너스 적용
            mutation.forEach(m => {
                finalCoins *= MUTATION_CONFIG[m.toUpperCase()].coinMultiplier;
            });

            // 변이가 하나도 없으면 null로 처리하여 기존 로직 호환성 유지
            if (mutation.length === 0) mutation = null;

            if (!grade) throw new Error(`등급 데이터를 찾을 수 없습니다: ${resultGradeKey}`);

            resultImage.src = imagePath;
            resultImage.className = `result-image ${resultGradeKey}`;
            resultImage.onerror = function() { this.src = createFallbackImage(grade.color, grade.name); };

            resultText.textContent = `${grade.name} 등급!`;
            
            if (grade.color.includes('gradient')) {
                resultText.style.background = grade.color;
                resultText.style.backgroundClip = 'text';
                resultText.style.webkitBackgroundClip = 'text';
                resultText.style.webkitTextFillColor = 'transparent';
            } else {
                resultText.style.color = grade.color;
                resultText.style.background = 'none';
                resultText.style.webkitTextFillColor = 'initial';
            }

            resultContainer.classList.add('show');
            applySpecialEffects(resultGradeKey);

            const gachaResult = { gradeKey: resultGradeKey, imagePath, itemName, grade, finalCoins, baseCoins, mutation };

            // [버그 수정] 통계 업데이트 함수를 이곳으로 이동하여 모든 뽑기가 기록되도록 함
            if (typeof updateCommonStats === 'function') {
                updateCommonStats(gachaResult);
            }

            setTimeout(() => showGachaChoice(gachaResult), 1200);
            setTimeout(() => gachaBox.classList.remove('opening'), 1000);
            
        } catch (error) {
            console.error('가챠 실행 중 오류:', error);
            pullButton.disabled = false;
            pullButton.textContent = '재호 뽑기';
            gachaBox.classList.remove('opening');
        }
    }, gachaSpeed);
}