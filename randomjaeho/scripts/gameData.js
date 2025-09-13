// 게임 데이터 정의
const grades = {
    ancient: {
        name: "만원",
        probability: 0.005,
        color: "linear-gradient(135deg, #85bb65, #2e8b57, #85bb65)",
        images: [
            { path: "assets/images/jaehos/ancient1.jpg", name: "만원 재호" },
            { path: "assets/images/jaehos/ancient2.jpg", name: "신사임당 재호" }
        ],
        coins: 25000
    },
    'ultimate-jaeho': {
        name: "얼티밋 재호",
        probability: 0.01,
        color: "#0066ff",
        images: [
            { path: "assets/images/jaehos/ultimate-jaeho1.jpg", name: "지배자 재호" },
            { path: "assets/images/jaehos/ultimate-jaeho2.png", name: "심판자 재호" }
        ],
        coins: 10000
    },
    divine: {
        name: "신성",
        probability: 0.1,
        color: "linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #0000ff, #8800ff)",
        images: [
            { path: "assets/images/jaehos/divine1.jpg", name: "큐브재호" }
        ],
        coins: 5000
    },
    mythic: {
        name: "신화",
        probability: 1,
        color: "#e74c3c",
        images: [
            { path: "assets/images/jaehos/mythic1.jpg", name: "악령의 재호" },
            { path: "assets/images/jaehos/mythic2.jpg", name: "해커재호" },
            { path: "assets/images/jaehos/mythic3.jpg", name: "환각재호" },
            { path: "assets/images/jaehos/mythic4.jpg", name: "흑백시그마재호" }
        ],
        coins: 1000
    },
    legendary: {
        name: "레전드리",
        probability: 3,
        color: "#ffd700",
        images: [
            { path: "assets/images/jaehos/legendary1.jpg", name: "빨간악마재호" },
            { path: "assets/images/jaehos/legendary2.jpg", name: "재호재호재호재호재호" },
            { path: "assets/images/jaehos/legendary3.jpg", name: "터널재호" },
            { path: "assets/images/jaehos/legendary4.jpg", name: "깜짝이야재호" }
        ],
        coins: 500
    },
    epic: {
        name: "에픽",
        probability: 7,
        color: "#9b59b6",
        images: [
            { path: "assets/images/jaehos/epic1.jpg", name: "레이저 재호" },
            { path: "assets/images/jaehos/epic2.jpg", name: "모아이 재호" },
            { path: "assets/images/jaehos/epic3.jpg", name: "큐티재호" }
        ],
        coins: 100
    },
    rare: {
        name: "레어",
        probability: 12,
        color: "#3498db",
        images: [
            { path: "assets/images/jaehos/rare1.jpg", name: "항아리 재호" },
            { path: "assets/images/jaehos/rare2.jpg", name: "에러재호" },
            { path: "assets/images/jaehos/rare3.jpg", name: "누운 재호" },
            { path: "assets/images/jaehos/rare4.jpg", name: "바보재호" },
            { path: "assets/images/jaehos/rare5.jpg", name: "변기재호" },
            { path: "assets/images/jaehos/rare6.jpg", name: "김도윤" }
        ],
        coins: 50
    },
    uncommon: {
        name: "언커먼",
        probability: 35,
        color: "#2ecc71",
        images: [
            { path: "assets/images/jaehos/uncommon1.jpg", name: "늙은재호" },
            { path: "assets/images/jaehos/uncommon2.jpg", name: "거꾸로재호" },
            { path: "assets/images/jaehos/uncommon3.jpg", name: "쿨쿨재호" },
            { path: "assets/images/jaehos/uncommon4.jpg", name: "청소재호" },
            { path: "assets/images/jaehos/uncommon5.jpg", name: "재호코" },
            { path: "assets/images/jaehos/uncommon6.jpg", name: "재호 발" },
            { path: "assets/images/jaehos/uncommon7.jpg", name: "재호 입술" }
        ],
        coins: 20
    },
    common: {
        name: "커먼",
        probability: 43.885,
        color: "#95a5a6",
        images: [
            { path: "assets/images/jaehos/common1.jpg", name: "그냥재호" },
            { path: "assets/images/jaehos/common2.jpg", name: "당황재호" },
            { path: "assets/images/jaehos/common3.jpg", name: "화난재호" },
            { path: "assets/images/jaehos/common4.jpg", name: "행복재호" },
            { path: "assets/images/jaehos/common5.jpg", name: "연극재호" }
        ],
        coins: 10
    }
};

// 초기 통계 데이터
let stats = {
    total: 0,
    ancient: 0,
    'ultimate-jaeho': 0,
    divine: 0,
    mythic: 0,
    legendary: 0,
    epic: 0,
    rare: 0,
    uncommon: 0,
    common: 0,
    coins: 0,  // 재호코인 추가
    inventory: [], // 인벤토리
    collectedItems: {}, // 뽑은 재호 목록
    hasCosmicKey: false, // 우주 키 보유 여부
    inventorySize: 10 // 인벤토리 크기
};

// 우주 공간 전용 등급 데이터 (임시 비활성화)
const cosmicGrades = {};

// 상점 아이템 데이터

const shopItems = {
    speedPotion: {
        id: 'speedPotion', 
        name: '신속 포션',
        description: '다음 5회 뽑기 애니메이션 시간 절반',
        price: 200,
        icon: '⚡',
        effect: 'speedBoost',
        duration: 5,
        color: '#f39c12'
    },
    coinPotion: {
        id: 'coinPotion',
        name: '골드 포션',
        description: '다음 5회 뽑기에서 골드 획득 2배',
        price: 700,
        icon: '💰',
        effect: 'coinBoost',
        duration: 5,
        color: '#f1c40f'
    },
    superSpeedPotion: {
        id: 'superSpeedPotion',
        name: '슈퍼 신속 포션',
        description: '다음 10회 뽑기 애니메이션 시간 1/3',
        price: 800,
        icon: '⚡✨',
        effect: 'speedBoost',
        duration: 10,
        color: '#f39c12'
    },
};

// 현재 활성 효과들을 추적
let activeEffects = {
    speedBoost: 0,
    coinBoost: 0
};

// 구매 기록 추가
if (typeof stats !== 'undefined') {
    stats.itemsPurchased = stats.itemsPurchased || 0;
    stats.coinsSpent = stats.coinsSpent || 0;
}

// 재호 합성을 위한 등급 순서
const gradeOrderForFusion = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'ultimate-jaeho'];