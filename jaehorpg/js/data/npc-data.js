// js/data/npc-data.js

// main.js의 TILE_SIZE와 동일한 값을 사용해야 좌표 계산이 맞습니다.
const TILE_SIZE = 32;

export const npcData = [
    {
        id: 'villager1',
        spriteName: 'villager',
        x: 8 * TILE_SIZE,
        y: 8 * TILE_SIZE,
        width: 16,
        height: 16,
        dialogue: "안녕하세요! 이 세계에 오신 것을 환영합니다."
    },
    {
        id: 'villager2',
        spriteName: 'villager',
        x: 15 * TILE_SIZE,
        y: 10 * TILE_SIZE,
        width: 16,
        height: 16,
        dialogue: "요즘 날씨가 참 좋네요."
    },
    // {
    //     id: 'merchant1',
    //     spriteName: 'merchant', // 만약 다른 스프라이트가 있다면
    //     x: 12 * TILE_SIZE,
    //     y: 6 * TILE_SIZE,
    //     dialogue: "좋은 물건들이 많이 있답니다. 구경해보세요!"
    // }
    // ... 앞으로 여기에 계속 추가하면 됩니다.
];