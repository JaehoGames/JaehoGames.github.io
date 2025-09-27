// 게임 데이터 정의

const fortuneMessages = [
    "학교가기 싫다",
    "배고파.",
    "만원재호는 인벤토리에 있어야 만원을 받을수 있습니다.",
    "랜덤재호 매주 토요일 1시 업뎃",
    "오늘의 운세: 만원 재호가 당신을 기다립니다!",
    "전설의 기운이 느껴지는 하루입니다.",
    "뽑기 버튼에 당신의 모든 운을 담아보세요.",
    "초월적인 힘이 당신과 함께합니다.",
    "가끔은 커먼도 소중한 법입니다.",
    "신성한 빛이 당신의 뽑기를 축복합니다.",
    "행운은 준비된 자에게 찾아온다. - 김재호",
    "모든 뽑기에는 그 의미가 있다.",
    "구글로그인은 구글로 들어가라",
    "아이폰 홈화면에 추가하면 이제 아이콘 나온다",
    "구글에 랜덤재호 치면 이제 나온다",
    "랜덤재호 오픈채팅방 공지방/소통방 들어와라",
    "닉네임 실명 필수!!",
    "초월 이상 등급은 이미지에 자막이 없다.",
    "개발자는 유저의 모든것을 컨트롤할수 있다. (진짜 싹다)"
];

const MUTATION_CONFIG = {
    GOLD: {
        probability: 15, // 15%
        name: '골드',
        color: '#ffd700',
        className: 'mutation-gold',
        coinMultiplier: 2 // 판매 시 코인 2배
    },
    RAINBOW: {
        probability: 3, // 3%
        name: '레인보우',
        color: 'linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #0000ff, #8800ff)',
        className: 'mutation-rainbow',
        coinMultiplier: 5 // 판매 시 코인 5배
    },
    FLAME: {
        probability: 10, // 10%
        name: '화염',
        color: '#e74c3c',
        className: 'mutation-flame',
        coinMultiplier: 4 // 판매 시 코인 4배
    }
};

const PERMANENT_LUCK_CONFIG = {
    MAX_LEVEL: 5,
    // 각 레벨로 업그레이드하는 데 필요한 비용
    COSTS: [10, 50, 100, 150, 200], 
    // 각 레벨에서 얻는 총 보너스 확률 (%)
    BONUSES: [2.0, 5.0, 9.0, 20.0, 45.0] 
};

const grades = {
    transcendence: {
        name: "초월",
        probability: 0.05,
        color: "linear-gradient(135deg, #ffffff, #f0f8ff, #e6e6fa)",
        images: [
            { path: "assets/images/jaehos/transcendence1.jpg", name: "초월자 재호" },
            { path: "assets/images/jaehos/transcendence2.jpg", name: "신격 재호" }
        ],
        coins: 7500
    },
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
            { path: "assets/images/jaehos/ultimate-jaeho1.jpg", name: "심판자 재호" }
        ],
        coins: 10000
    },
    divine: {
        name: "신성",
        probability: 0.1,
        color: "linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #0000ff, #8800ff)",
        images: [
            { path: "assets/images/jaehos/divine1.jpg", name: "큐브재호" },
            { path: "assets/images/jaehos/divine2.jpg", name: "재호x10" }
        ],
        coins: 5000
    },
    cosmic: {
        name: "우주",
        probability: 0.5,
        color: "linear-gradient(45deg, #4B0082, #8A2BE2, #191970, #000000)",
        images: [
            { path: "assets/images/jaehos/cosmic1.jpg", name: "블랙홀 재호" },
            { path: "assets/images/jaehos/cosmic2.jpg", name: "지구재호" }
        ],
        coins: 3000
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
            { path: "assets/images/jaehos/epic3.jpg", name: "큐티재호" },
            { path: "assets/images/jaehos/epic4.jpg", name: "슬라임재호" },
            { path: "assets/images/jaehos/epic5.jpg", name: "무서운재호" },
            { path: "assets/images/jaehos/epic6.jpg", name: "충격파재호" }
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
        probability: 34.95,
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
        probability: 41.385,
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
    transcendence: 0,
    ancient: 0,
    'ultimate-jaeho': 0,
    divine: 0,
    cosmic: 0,
    mythic: 0,
    legendary: 0,
    epic: 0,
    rare: 0,
    uncommon: 0,
    common: 0,
    coins: 0,  // 재호코인 추가
    inventory: [], // 인벤토리
    collectedItems: {}, // 뽑은 재호 목록
    collectedCount: 0, // 수집한 재호 종류 수
    hasCosmicKey: false, // 우주 키 보유 여부
    inventorySize: 5, // 인벤토리 크기
    cosmicFragments: 0, // 우주 파편 (신규 화폐)
    permanentLuck: 0 // 영구 행운 레벨
    ,
    settings: {
        music: false,
        graphics: 'high' // 그래픽 품질 설정: 'high', 'medium', 'low'
    }
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
const gradeOrderForFusion = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'cosmic', 'divine', 'transcendence', 'ultimate-jaeho', 'ancient'];