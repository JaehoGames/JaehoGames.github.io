let flameParticleInterval = null;

/**
 * 화염 이벤트 시작 시 폭발 효과
 */
function startFlameExplosion() {
    const screenFlash = document.getElementById('screenFlash');
    screenFlash.style.background = 'radial-gradient(circle, rgba(255, 100, 0, 0.8) 0%, transparent 70%)';
    screenFlash.style.opacity = '1';
    screenFlash.style.transition = 'none';

    createFireworks(40, ['#e74c3c', '#c0392b', '#f39c12', '#e67e22']);

    setTimeout(() => {
        screenFlash.style.transition = 'opacity 1.5s ease-out';
        screenFlash.style.opacity = '0';
    }, 1000);
}

// 특수 효과 및 애니메이션 모듈

/**
 * 폭죽 효과 생성
 * @param {number} count - 폭죽 개수
 * @param {Array<string>} colors - 폭죽 색상 배열
 */
function createFireworks(count, colors) {
    const graphicsSetting = stats.settings?.graphics || 'high';
    let finalCount = count;

    switch (graphicsSetting) {
        case 'medium':
            finalCount = Math.floor(count * 0.6);
            break;
        case 'low':
            finalCount = Math.floor(count * 0.3);
            break;
        // 'high'는 기본값 사용
    }

    if (finalCount === 0) return;
    const fireworksContainer = document.getElementById('fireworks');
    
    for (let i = 0; i < finalCount; i++) {
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
        }, i * (2000 / finalCount)); // 개수에 따라 간격 조절
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

/**
 * 효과 만료를 체크하는 함수.
 * @deprecated 이 기능은 gacha.js의 pullGacha 함수 내부에서 직접 호출됩니다.
 */
function checkEffectExpiration() {
    // 이 함수는 이제 gacha.js의 pullGacha 내부에서 직접 처리됩니다.
}
/**
 * 구매 성공 특수 효과
 */

/**
 * 화염 이벤트 파티클 효과를 시작합니다.
 */
function startFlameParticleEffect() {
    if (flameParticleInterval) return; // 이미 실행 중이면 중복 실행 방지

    const gachaBox = document.getElementById('gachaBox');
    if (!gachaBox) return;

    const graphicsSetting = stats.settings?.graphics || 'high';
    // '낮음' 설정에서는 파티클 효과를 실행하지 않음
    if (graphicsSetting === 'low') return;

    let particleCount, interval;

    switch (graphicsSetting) {
        case 'medium':
            particleCount = 2;
            interval = 120;
            break;
        default: // high
            particleCount = 4;
            interval = 80;
            break;
    }

    flameParticleInterval = setInterval(() => {
        for (let i = 0; i < particleCount; i++) {
            createFlameParticle(gachaBox);
        }
    }, interval);
}

/**
 * 화염 이벤트 파티클 효과를 중지합니다.
 */
function stopFlameParticleEffect() {
    if (flameParticleInterval) {
        clearInterval(flameParticleInterval);
        flameParticleInterval = null;
    }
    // 남아있는 파티클 제거
    document.querySelectorAll('.flame-particle').forEach(p => p.remove());
}

/**
 * 개별 화염 파티클을 생성하고 애니메이션을 적용합니다.
 * @param {HTMLElement} parentElement - 파티클의 기준이 될 요소
 */
function createFlameParticle(parentElement) {
    const particle = document.createElement('img');
    particle.src = 'assets/images/firejaeho.jpg';
    particle.className = 'flame-particle';

    const rect = parentElement.getBoundingClientRect();
    const startX = rect.left + window.scrollX + (rect.width / 2) + (Math.random() - 0.5) * 20;
    const startY = rect.top + window.scrollY + (rect.height / 2) + (Math.random() - 0.5) * 20;

    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;

    const size = Math.random() * 25 + 15; // 15px ~ 40px (더 크게)
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    const angle = (Math.random() - 0.5) * 2 * Math.PI * 0.6; // -0.6rad ~ 0.6rad (더 넓게 퍼지도록)
    const velocity = Math.random() * 100 + 150; // 150 ~ 250
    const endX = Math.sin(angle) * velocity;
    const endY = -Math.cos(angle) * velocity;

    particle.style.setProperty('--x-end', `${endX}px`);
    particle.style.setProperty('--y-end', `${endY}px`);

    document.body.appendChild(particle);

    // 애니메이션이 끝나면 요소 제거
    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}