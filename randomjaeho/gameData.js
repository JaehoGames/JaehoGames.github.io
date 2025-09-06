// 게임 데이터 정의
const grades = {
    'ultimate-jaeho': {
        name: "얼티밋 재호",
        probability: 0.08,
        color: "#0066ff",
        images: ["ultimate-jaeho1.jpg", "ultimate-jaeho2.png"],
        coins: 10000
    },
    divine: {
        name: "신성",
        probability: 0.1,
        color: "linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #0000ff, #8800ff)",
        images: ["divine1.jpg"],
        coins: 5000
    },
    mythic: {
        name: "신화",
        probability: 1,
        color: "#e74c3c",
        images: ["mythic1.jpg", "mythic2.jpg", "mythic3.jpg", "mythic4.jpg"],
        coins: 1000
    },
    legendary: {
        name: "레전드리",
        probability: 3,
        color: "#ffd700",
        images: ["legendary1.jpg", "legendary2.jpg", "legendary3.jpg", "legendary4.jpg"],
        coins: 500
    },
    epic: {
        name: "에픽",
        probability: 7,
        color: "#9b59b6",
        images: ["epic1.jpg", "epic2.jpg", "epic3.jpg"],
        coins: 100
    },
    rare: {
        name: "레어",
        probability: 12,
        color: "#3498db",
        images: ["rare1.jpg", "rare2.jpg", "rare3.jpg", "rare4.jpg", "rare4.jpg", "rare5.jpg", "rare6.jpg"],
        coins: 50
    },
    uncommon: {
        name: "언커먼",
        probability: 35,
        color: "#2ecc71",
        images: ["uncommon1.jpg", "uncommon2.jpg", "uncommon3.jpg", "uncommon4.jpg", "uncommon5.jpg", "uncommon6.jpg", "uncommon7.jpg"],
        coins: 20
    },
    common: {
        name: "커먼",
        probability: 43.82,
        color: "#95a5a6",
        images: ["common1.jpg", "common2.jpg", "common3.jpg", "common4.jpg", "common5.jpg"],
        coins: 10
    }
};

// 초기 통계 데이터
let stats = {
    total: 0,
    'ultimate-jaeho': 0,
    divine: 0,
    mythic: 0,
    legendary: 0,
    epic: 0,
    rare: 0,
    uncommon: 0,
    common: 0,
    coins: 0  // 재호코인 추가
};

// 상점 아이템 데이터

const shopItems = {
    luckPotion: {
        id: 'luckPotion',
        name: '행운 포션',
        description: '다음 10회 뽑기 동안 레어 이상 확률 2배',
        price: 500,
        icon: '🍀',
        effect: 'luckBoost',
        duration: 10,
        color: '#2ecc71'
    },
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
    mysteryBox: {
        id: 'mysteryBox',
        name: '미스터리 박스',
        description: '랜덤한 보너스 효과 (1-3회)',
        price: 300,
        icon: '📦',
        effect: 'mysteryBonus',
        duration: 'random',
        color: '#9b59b6'
    },
    doubleCoins: {
        id: 'doubleCoins',
        name: '코인 부스터',
        description: '다음 5회 뽑기에서 얻는 코인 2배',
        price: 400,
        icon: '💰',
        effect: 'coinBoost',
        duration: 5,
        color: '#ffd700'
    },
    guaranteedRare: {
        id: 'guaranteedRare',
        name: '레어 보장권',
        description: '다음 뽑기에서 레어 이상 보장',
        price: 800,
        icon: '🎫',
        effect: 'guaranteeRare',
        duration: 1,
        color: '#3498db'
    },
    ultimateChance: {
        id: 'ultimateChance',
        name: '얼티밋 찬스',
        description: '다음 뽑기에서 얼티밋 재호 확률 10배',
        price: 2000,
        icon: '🌟',
        effect: 'ultimateBoost',
        duration: 1,
        color: '#0066ff'
    }
};

// 현재 활성 효과들을 추적
let activeEffects = {
    luckBoost: 0,
    speedBoost: 0,
    coinBoost: 0,
    guaranteeRare: 0,
    ultimateBoost: 0
};

// 구매 기록 추가
if (typeof stats !== 'undefined') {
    stats.itemsPurchased = stats.itemsPurchased || 0;
    stats.coinsSpent = stats.coinsSpent || 0;

}



