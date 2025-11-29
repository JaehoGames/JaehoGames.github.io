// --- Constants ---
const MAP_WIDTH_TILES = 20;
const MAP_HEIGHT_TILES = 15;

// --- DOM Elements ---
const tilesetCanvas = document.getElementById('tileset-canvas');
const tilesetCtx = tilesetCanvas.getContext('2d');
const mapCanvas = document.getElementById('map-canvas');
const mapCtx = mapCanvas.getContext('2d');
const exportButton = document.getElementById('export-button');
const mapOutput = document.getElementById('map-output');
const layerSelector = document.getElementById('layer-selector');
const tilesetContainer = document.getElementById('tileset-container');
const collisionTools = document.getElementById('collision-tools');
const setCollidableButton = document.getElementById('set-collidable');
const setNonCollidableButton = document.getElementById('set-non-collidable');

// --- Tileset Configuration ---
const tilesets = {
    ground: {
        src: 'tileset.png',
        tileSize: 32,
        image: new Image(),
        cols: 0,
        isLoaded: false
    },
    object: {
        src: 'objects.png',
        tileSize: 64,
        image: new Image(),
        cols: 16, // objects.png is 1024px wide, 1024 / 64 = 16
        isLoaded: false
    }
};

// --- State ---
const selectedTileByLayer = {
    ground: { type: 'tile', value: { x: 0, y: 0 } },
    object: { type: 'tile', value: { x: 0, y: 0 } },
    tileCollision: { type: 'collision', value: 1 },
    objectCollision: { type: 'collision', value: 1 }
};
let currentLayer = 'ground';
let isMouseDown = false;

// Map Data
const layerData = {
    ground: Array.from({ length: MAP_HEIGHT_TILES }, () => Array(MAP_WIDTH_TILES).fill(null)),
    object: Array.from({ length: MAP_HEIGHT_TILES }, () => Array(MAP_WIDTH_TILES).fill(null)),
    tileCollision: Array.from({ length: MAP_HEIGHT_TILES }, () => Array(MAP_WIDTH_TILES).fill(0)),
    objectCollision: Array.from({ length: MAP_HEIGHT_TILES }, () => Array(MAP_WIDTH_TILES).fill(0))
};

// --- Initialization ---
function loadTilesets() {
    const promises = Object.values(tilesets).map(ts => {
        return new Promise((resolve, reject) => {
            ts.image.src = ts.src;
            ts.image.onload = () => {
                ts.isLoaded = true;
                ts.cols = ts.image.width / ts.tileSize;
                resolve();
            };
            ts.image.onerror = reject;
        });
    });

    Promise.all(promises)
        .then(() => {
            console.log("All tilesets loaded successfully.");
            initializeApp();
        })
        .catch(err => {
            console.error("Failed to load one or more tilesets:", err);
            alert("타일셋 이미지 로딩에 실패했습니다. 경로를 확인해주세요.");
        });
}

function initializeApp() {
    mapCanvas.width = MAP_WIDTH_TILES * 32; // Base tile size is 32
    mapCanvas.height = MAP_HEIGHT_TILES * 32;
    
    updateActiveTileset();
    drawMap();
}

// --- Drawing Functions ---
function drawGrid(ctx, width, height, tileSize, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y <= height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function updateActiveTileset() {
    if (currentLayer === 'tileCollision' || currentLayer === 'objectCollision') return;

    const activeTileset = tilesets[currentLayer];
    if (!activeTileset || !activeTileset.isLoaded) {
        console.error("Active tileset is not loaded:", currentLayer);
        return;
    }

    tilesetCanvas.width = activeTileset.image.width;
    tilesetCanvas.height = activeTileset.image.height;
    tilesetCtx.drawImage(activeTileset.image, 0, 0);
    drawGrid(tilesetCtx, tilesetCanvas.width, tilesetCanvas.height, activeTileset.tileSize, '#ccc');
}

function drawMap() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    drawTileLayer('ground');
    drawTileLayer('object');
    drawTileCollisionLayer();
    drawObjectCollisionLayer();

    drawGrid(mapCtx, mapCanvas.width, mapCanvas.height, 32, '#555'); // Grid based on 32x32
}

function drawTileLayer(layerName) {
    const data = layerData[layerName];
    const ts = tilesets[layerName];
    if (!ts || !ts.isLoaded) return;

    for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
        for (let x = 0; x < MAP_WIDTH_TILES; x++) {
            const tile = data[y][x];
            if (tile) {
                mapCtx.drawImage(
                    ts.image,
                    tile.x * ts.tileSize,
                    tile.y * ts.tileSize,
                    ts.tileSize,
                    ts.tileSize,
                    x * 32, // Always draw on a 32x32 grid
                    y * 32,
                    32,     // Always draw as 32x32 on map
                    32
                );
            }
        }
    }
}

function drawTileCollisionLayer() {
    mapCtx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
        for (let x = 0; x < MAP_WIDTH_TILES; x++) {
            if (layerData.tileCollision[y][x] === 1) {
                mapCtx.fillRect(x * 32, y * 32, 32, 32);
            }
        }
    }
}

function drawObjectCollisionLayer() {
    mapCtx.fillStyle = 'rgba(0, 0, 255, 0.4)'; // Use blue for object collision
    for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
        for (let x = 0; x < MAP_WIDTH_TILES; x++) {
            if (layerData.objectCollision[y][x] === 1) {
                mapCtx.fillRect(x * 32, y * 32, 32, 32);
            }
        }
    }
}

// --- Event Listeners ---
layerSelector.addEventListener('change', (e) => {
    currentLayer = e.target.value;
    
    if (currentLayer === 'tileCollision' || currentLayer === 'objectCollision') {
        tilesetContainer.style.display = 'none';
        collisionTools.style.display = 'block';
    } else {
        tilesetContainer.style.display = 'block';
        collisionTools.style.display = 'none';
        updateActiveTileset();
    }
    console.log(`Switched to ${currentLayer} layer.`);
});

tilesetCanvas.addEventListener('click', (e) => {
    if (currentLayer === 'tileCollision' || currentLayer === 'objectCollision') return;
    
    const activeTileset = tilesets[currentLayer];
    const rect = tilesetCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / activeTileset.tileSize);
    const y = Math.floor((e.clientY - rect.top) / activeTileset.tileSize);
    
    selectedTileByLayer[currentLayer].value = { x, y };
    console.log(`Selected tile for ${currentLayer}:`, { x, y });
});

setCollidableButton.addEventListener('click', () => { 
    if (currentLayer === 'tileCollision' || currentLayer === 'objectCollision') {
        selectedTileByLayer[currentLayer].value = 1; 
    }
});
setNonCollidableButton.addEventListener('click', () => { 
    if (currentLayer === 'tileCollision' || currentLayer === 'objectCollision') {
        selectedTileByLayer[currentLayer].value = 0; 
    }
});

function handleMapInteraction(e) {
    const rect = mapCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 32); // Map grid is always 32x32
    const y = Math.floor((e.clientY - rect.top) / 32);

    if (x < 0 || x >= MAP_WIDTH_TILES || y < 0 || y >= MAP_HEIGHT_TILES) return;

    const isErasing = e.button === 2 || e.buttons === 2;

    if (isErasing) {
        if (currentLayer === 'tileCollision' || currentLayer === 'objectCollision') {
            layerData[currentLayer][y][x] = 0;
        } else {
            layerData[currentLayer][y][x] = null;
        }
    } else {
        layerData[currentLayer][y][x] = selectedTileByLayer[currentLayer].value;
    }
    
    drawMap();
}

mapCanvas.addEventListener('mousedown', handleMapInteraction);
mapCanvas.addEventListener('mousemove', (e) => { if (isMouseDown) handleMapInteraction(e); });
mapCanvas.addEventListener('mousedown', (e) => { isMouseDown = true; if(e.button === 2) e.preventDefault(); });
mapCanvas.addEventListener('mouseup', () => { isMouseDown = false; });
mapCanvas.addEventListener('mouseleave', () => { isMouseDown = false; });
mapCanvas.addEventListener('contextmenu', e => e.preventDefault());

// --- Export ---
exportButton.addEventListener('click', () => {
    const formatLayer = (layerName) => {
        const data = layerData[layerName];
        const ts = tilesets[layerName];
        if (!ts) return data; // For collision layers

        return data.map(row =>
            row.map(tile => {
                if (!tile) return 0;
                return tile.y * ts.cols + tile.x + 1;
            })
        );
    };

    const groundExport = formatLayer('ground');
    const objectExport = formatLayer('object');
    const tileCollisionExport = layerData.tileCollision;
    const objectCollisionExport = layerData.objectCollision;

    let outputString = `// Map data generated on ${new Date().toISOString()}

`;
    outputString += `export const groundLayer = [\n${groundExport.map(row => `    [${row.join(', ')}]`).join(',\n')}\n];\n\n`;
    outputString += `export const objectLayer = [\n${objectExport.map(row => `    [${row.join(', ')}]`).join(',\n')}\n];\n\n`;
    outputString += `export const tileCollisionLayer = [\n${tileCollisionExport.map(row => `    [${row.join(', ')}]`).join(',\n')}\n];\n\n`;
    outputString += `export const objectCollisionLayer = [\n${objectCollisionExport.map(row => `    [${row.join(', ')}]`).join(',\n')}\n];`;

    mapOutput.value = outputString;
    alert('Map data has been generated in the text area below!');
});

// --- Initial Load ---
loadTilesets();