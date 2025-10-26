// 게임 데이터 정의

const fortuneMessages = [
        "상점에서 다양한 아이템을 구매하여 게임을 더 유리하게 이끌어보세요.",
        "인벤토리가 가득 차지 않도록 관리하세요. 가득 차면 새로운 아이템을 획득할 수 없습니다.",
        "상위 등급 아이템을 획득하려면 영구 행운 강화를 활용하세요.",
        "우주 공간에서 코즈믹 시그널 미니 게임을 플레이하고 보상을 받으세요.",
        "합성소를 이용하여 3개의 동일 등급 아이템을 합쳐 더 높은 등급을 노려보세요.",
        "화염 이벤트 동안에는 특별한 혜택이 주어집니다. 놓치지 마세요!",
        "경매장에서 원하는 아이템을 저렴하게 구매하거나, 비싸게 판매하여 코인을 벌어보세요.",
        "가챠를 통해 다양한 재호를 수집하고 도감을 완성해보세요.",
        "대장간에서 재호를 강화하여 판매가격을 올릴수 있습니다.",
        "코인을 모아서 상점에서 다양한 아이템을 구매하세요.",
        "특정 시간마다 열리는 이벤트를 활용하여 게임 진행을 더욱 효율적으로 하세요.",
        "친구와 함께 플레이하면 더욱 즐겁습니다.",
        "게임을 초기화하기 전에 신중하게 생각하세요. 모든 데이터가 초기화됩니다.",
        "커뮤니티에 참여하여 다른 플레이어와 정보를 공유하세요.",
        "상점에서 판매하는 포션을 사용하여 뽑기 효율을 높이세요",
        "재화를 아끼고 신중하게 사용하세요.",
        "새로운 업데이트 내용을 확인하고, 게임에 적용된 새로운 기능을 활용해보세요.",
        "게임 내 버그를 발견하면 개발자에게 알려주세요. (중요)",
        "가챠 결과에 너무 실망하지 마세요. 다음에는 더 좋은 결과가 있을 수 있습니다.",
        "게임을 즐기는 것이 가장 중요합니다!",
        "화염 변이 재호는 화염 이벤트 기간에만 획득할 수 있습니다.",
        "신속 포션을 사용하여 뽑기 시간을 단축시키세요.",
        "매일 게임에 접속하여 행운을 시험해보세요.",,
        "최단유 변이 재호는 최단유 이벤트 기간에만 획득할 수 있습니다.",
        "클럽 파티 이벤트에 참여하여 특별한 보상을 받으세요.",
        "코즈믹 파편을 모아 영구 행운을 강화하세요.",
        "우주 공간에서 새로운 기회를 발견하세요.",
        "대장간에서 재호를 강화하여 더 높은 가치를 창출하세요.",
        "글로벌 채팅을 통해 다른 플레이어와 소통하세요.",
        "경매장에서 희귀한 아이템을 찾아보세요.",
        "친구와 거래하여 필요한 아이템을 얻으세요.",
        "시간을 투자할수록 더욱 강력해집니다.",
        "궁금한 점이 있다면 주저하지 말고 문의하세요.",
        "자신만의 목표를 설정하고 게임을 즐기세요."
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
    },
    DANYU: {
        probability: 5, // 5%, 이벤트 기간에만 적용
        name: '최단유',
        color: '#3498db',
        className: 'mutation-danyu',
        coinMultiplier: 3.5 // 판매 시 코인 3.5배
    },
    NEON: {
        name: '네온',
        probability: 7,
        coinMultiplier: 2.5,
        className: 'mutation-neon'
    },
    SKY_BLUE: {
        probability: 0, // 이벤트 기간에만 적용
        name: '하늘빛',
        color: '#87CEEB',
        className: 'mutation-skyblue',
        coinMultiplier: 5 // 판매 시 코인 5배
    },
    HAUNTED: {
        probability: 10, // 10%, 할로윈 이벤트 기간에만 적용
        name: '유령이 깃든',
        className: 'mutation-haunted',
        coinMultiplier: 0.1 // 판매가 1/10. 성불시켜야 가치가 높아짐
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
            { path: "assets/images/jaehos/legendary4.jpg", name: "깜짝이야재호" },
            { path: "assets/images/jaehos/legendary5.jpg", name: "애교재호" }
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
            { path: "assets/images/jaehos/epic6.jpg", name: "충격파재호" },
            { path: "assets/images/jaehos/epic7.jpg", name: "왜곡재호" }
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
            { path: "assets/images/jaehos/rare6.jpg", name: "김도윤" },
            { path: "assets/images/jaehos/rare7.jpg", name: "오로라재호" },
            { path: "assets/images/jaehos/rare8.jpg", name: "빛나재호" }
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
            { path: "assets/images/jaehos/uncommon7.jpg", name: "재호 입술" },
            { path: "assets/images/jaehos/uncommon8.jpg", name: "뚱뚱재호" },
            { path: "assets/images/jaehos/uncommon9.jpg", name: "벚꽃재호" }
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
    permanentLuck: 0, // 영구 행운 레벨
    ghostCandy: 0, // 할로윈 이벤트 재화
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