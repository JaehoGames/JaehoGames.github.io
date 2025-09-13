// DOM 요소 가져오기
const currentPriceEl = document.getElementById('current-price');
const cashEl = document.getElementById('cash');
const sharesEl = document.getElementById('shares');
const totalValueEl = document.getElementById('total-value');
const quantityInput = document.getElementById('quantity');
const buyBtn = document.getElementById('buy-btn');
const sellBtn = document.getElementById('sell-btn');
const friendFaceEl = document.getElementById('friend-face');
const newsTickerEl = document.getElementById('news-ticker');
const toastContainerEl = document.getElementById('toast-container');

// 게임 상태 변수
let cash = 1000000;
let shares = 0;
let currentPrice = 10000;

// 차트 데이터 및 인스턴스
const priceHistory = [10000];
const chartLabels = ['시작'];
let turnCounter = 1;
let priceChart;

// TODO: 주가 변동에 따라 바뀔 친구 얼굴 이미지 경로를 설정해주세요.
const faceImages = {
    default: 'jaeho.jpg', // 기본 표정
    happy: 'HappyJaeho.jpg?text=UP',   // 주가 상승 시 표정
    sad: 'SadJaeho.jpg?text=DOWN'      // 주가 하락 시 표정
};

// 뉴스/이벤트 데이터
const events = [
    { text: "💥 속보: 친구, 유튜브 구독자 100만 달성! 주가 폭등!", impact: 1.5 },
    { text: "😭 비보: 친구, 길 가다 넘어져 무릎 까짐. 주가 폭락...", impact: 0.7 },
    { text: "🎉 희소식: 친구가 만든 떡볶이, 맛집으로 소문남!", impact: 1.3 },
    { text: "📉 악재: 친구, 발표 과제에서 '아...'만 10번 외침.", impact: 0.8 },
    { text: "💸 대박: 친구, 숨겨왔던 비상금 발견!", impact: 1.2 },
    { text: "🔥 논란: 친구의 패션, '이해 불가' 판정. 이미지 하락.", impact: 0.85 },
    { text: "💖 훈훈: 친구, 길 잃은 아기 고양이 구조. 이미지 급상승!", impact: 1.25 },
];

// 게임 루프 변수
const GAME_TICK_MS = 3000; // 3초

// 초기 화면 업데이트
updateDisplay();

// 차트 초기화
initializeChart();

/**
 * 화면에 표시되는 모든 값을 최신 상태로 업데이트하는 함수
 */
function updateDisplay() {
    // 숫자에 쉼표(,)를 추가하여 가독성 좋게 표시
    cashEl.textContent = cash.toLocaleString();
    sharesEl.textContent = shares.toLocaleString();
    currentPriceEl.textContent = currentPrice.toLocaleString();
    
    // 총 평가액 = 보유 현금 + (현재가 * 보유 주식 수)
    const totalValue = cash + (currentPrice * shares);
    totalValueEl.textContent = totalValue.toLocaleString();
}

/**
 * 주식 매수 처리 함수
 */
function buyStock() {
    const quantity = Math.abs(parseInt(quantityInput.value, 10));
    if (quantity <= 0 || isNaN(quantity)) {
        showToast("유효한 수량을 입력하세요.", "error");
        return;
    }

    const cost = currentPrice * quantity;

    if (cash >= cost) {
        cash -= cost;
        shares += quantity;
        updateDisplay();
        showToast(`${quantity}주 매수 체결!`, "success");
    } else {
        showToast("현금이 부족합니다.", "error");
    }
}

/**
 * 주식 매도 처리 함수
 */
function sellStock() {
    const quantity = Math.abs(parseInt(quantityInput.value, 10));
    if (quantity <= 0 || isNaN(quantity)) {
        showToast("유효한 수량을 입력하세요.", "error");
        return;
    }

    if (shares >= quantity) {
        const revenue = currentPrice * quantity;
        cash += revenue;
        shares -= quantity;
        updateDisplay();
        showToast(`${quantity}주 매도 체결!`, "error");
    } else {
        showToast("보유 주식이 부족합니다.", "error");
    }
}

/**
 * 토스트 알림을 표시하는 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 종류 ('success', 'error', 'info')
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainerEl.appendChild(toast);
    
    // 3초 후 자동으로 사라짐
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * 랜덤 이벤트를 발생시키는 함수
 */
function triggerEvent() {
    const event = events[Math.floor(Math.random() * events.length)];
    
    // 뉴스 티커에 이벤트 내용 표시
    newsTickerEl.textContent = event.text;
    newsTickerEl.style.display = 'block';
    
    // 주가에 큰 변동 적용
    const previousPrice = currentPrice;
    currentPrice = Math.round(currentPrice * event.impact);
    if (currentPrice < 100) currentPrice = 100;

    // 화면 업데이트
    updateDisplay();
    updateChart();
    updateVisuals(previousPrice, currentPrice);

    // 5초 후 뉴스 티커 숨기기
    setTimeout(() => {
        newsTickerEl.style.display = 'none';
    }, 5000);
}

/**
 * 주기적으로 주가를 변동시키는 함수
 */
function fluctuatePrice() {
    const previousPrice = currentPrice; // 변동 전 가격 저장
    
    // -10% ~ +10% 사이의 변동률 생성
    const fluctuation = (Math.random() - 0.5) * 0.1; 
    let newPrice = currentPrice * (1 + fluctuation);

    // 주가가 100원 밑으로 떨어지지 않도록 방지
    if (newPrice < 100) {
        newPrice = 100;
    }

    currentPrice = Math.round(newPrice); // 소수점은 반올림

    // 화면 및 차트 업데이트
    updateDisplay();
    updateChart();
    updateVisuals(previousPrice, currentPrice);
}

/**
 * 주가 변동에 따라 시각적 효과(얼굴 표정, 가격 색상)를 업데이트하는 함수
 * @param {number} previousPrice - 이전 가격
 * @param {number} newPrice - 새로운 가격
 */
function updateVisuals(previousPrice, newPrice) {
    const priceElement = currentPriceEl.parentElement;

    // 이전 효과 클래스 제거
    priceElement.classList.remove('price-up', 'price-down');
    friendFaceEl.classList.remove('price-up-border', 'price-down-border');

    if (newPrice > previousPrice) {
        friendFaceEl.src = faceImages.happy;
        priceElement.classList.add('price-up');
        friendFaceEl.classList.add('price-up-border');
    } else if (newPrice < previousPrice) {
        friendFaceEl.src = faceImages.sad;
        priceElement.classList.add('price-down');
        friendFaceEl.classList.add('price-down-border');
    } else {
        // 가격 변동이 없으면 기본 표정으로 돌아올 수 있습니다.
        // friendFaceEl.src = faceImages.default;
    }
}

/**
 * 차트를 초기화하는 함수
 */
function initializeChart() {
    const ctx = document.getElementById('price-chart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [{
                label: '친구 주가',
                data: priceHistory,
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.1)',
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        // y축 눈금에 쉼표 추가
                        callback: function(value) {
                            return value.toLocaleString() + '원';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // 범례 숨기기
                }
            }
        }
    });
}

/**
 * 차트 데이터를 업데이트하고 다시 그리는 함수
 */
function updateChart() {
    chartLabels.push(turnCounter++);
    priceHistory.push(currentPrice);

    // 차트에 표시할 데이터 포인트 수 제한 (최근 20개)
    const maxDataPoints = 20;
    if (chartLabels.length > maxDataPoints) {
        chartLabels.shift();
        priceHistory.shift();
    }

    priceChart.update();
}

// 이벤트 리스너 연결
buyBtn.addEventListener('click', buyStock);
sellBtn.addEventListener('click', sellStock);

/**
 * 메인 게임 루프
 */
function gameLoop() {
    // 15% 확률로 특별 이벤트 발생, 아니면 일반 주가 변동
    if (Math.random() < 0.15) {
        triggerEvent();
    } else {
        fluctuatePrice();
    }
}

// 설정된 시간(GAME_TICK_MS)마다 게임 루프 실행
setInterval(gameLoop, GAME_TICK_MS);
