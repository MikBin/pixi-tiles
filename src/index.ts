import { PixiTile } from "./PixiTile";
import { graphicsConfiguration } from "./interfaces";
import * as PIXI from 'pixi.js';

const canvasContainer = document.getElementById("game-play");

const _PIXI_APP: PIXI.Application = new PIXI.Application(1200, 1200, {
    antialias: true,
    transparent: true,
    autoResize: true
});

_PIXI_APP.renderer.autoResize = true;

canvasContainer.appendChild(_PIXI_APP.view);

const torusContainer: PIXI.Container = new PIXI.Container();

_PIXI_APP.stage.addChild(torusContainer);
torusContainer.x = 0;
torusContainer.y = 0;

torusContainer.interactiveChildren = false;

_PIXI_APP.stage.interactive = true;

const tileFullSize: number = 100;

const MAIN_GRAPHICS_CONFIG: graphicsConfiguration = {
    marginPercent: 0.01,
    fontSizePercent: 0.6,
    doubleFontSizePercent: 0.7,
    borderPercent: 0.12,
    doubleBorderPercent: 0.40,
    _16_9_MOD: 0.6,
    containerHeightModifier: 0.6,
    sizeNormalizer: 1.04,
    rows: 10,
    cols: 10,
    tileSize: tileFullSize,
    tileFullSize: tileFullSize,
    fontSize: 0,
    biggerFontSize: 0,
    tileBackColor: 0xFAFAFA,
    defaultAlpha: 1,
    strokeThicknessBase: 0,
    strokeThicknessDouble: 0,
    roundBorderFactor: 0,
    doubleBorderFactor: 0,
    tileNumberColors: [0xFAFAFA, 0x311B92, 0x0D47A1, 0x880E4F, 0x006064, 0xFF4500, 0x8B0000,
        0x4B0082, 0x006400, 0x2F4F4F
    ],
    tileNumberBackColors: [0x0FAFAFA, 0x9781F8, 0x73ADFF, 0xEE74B5, 0x00dae4, 0xFFDE99,
        0xff0c0c, 0x9403ff, 0x00e400, 0x95B5B5
    ],
    negativeNumberColor: 0x696969,
    negativeBackNumberColor: 0xCCCCCC,
    animationSteps: 12,
    stepsFor_60_FPS: 12,
    stepsLimit: 12,
    margins: 0,
    animationTiming: 200,
    slideChangeThreshold: 20
};

MAIN_GRAPHICS_CONFIG.margins = Math.ceil(tileFullSize * MAIN_GRAPHICS_CONFIG.marginPercent);
MAIN_GRAPHICS_CONFIG.tileSize = tileFullSize - 2 * MAIN_GRAPHICS_CONFIG.margins;
MAIN_GRAPHICS_CONFIG.fontSize = Math.round((tileFullSize - 2 * MAIN_GRAPHICS_CONFIG.margins) * MAIN_GRAPHICS_CONFIG.fontSizePercent);
MAIN_GRAPHICS_CONFIG.biggerFontSize = Math.round((tileFullSize - 2 * MAIN_GRAPHICS_CONFIG.margins) * MAIN_GRAPHICS_CONFIG.doubleFontSizePercent);
MAIN_GRAPHICS_CONFIG.strokeThicknessDouble = MAIN_GRAPHICS_CONFIG.margins * 2.5;
MAIN_GRAPHICS_CONFIG.roundBorderFactor = Math.ceil(tileFullSize * MAIN_GRAPHICS_CONFIG.borderPercent);
MAIN_GRAPHICS_CONFIG.doubleBorderFactor = Math.ceil(tileFullSize * MAIN_GRAPHICS_CONFIG.doubleBorderPercent);

const TILE_TEXTURES_LIST: PIXI.Texture[] = [];
const ANIMATION_TEXTURES_LIST: Object = {
    "12": {},
    "11": {},
    "10": {},
    "9": {},
    "8": {},
    "7": {},
    "6": {},
    "5": {},
    "4": {}
};

/**
 * 
 * BUILD TEXTURES LIST FOR ANIMATIONS
 * 
 */
let auxTilesList: Object = {}
for (let i = -9; i < 10; ++i) {
    if (i == 0) { continue; }
    auxTilesList[i] = new PixiTile(MAIN_GRAPHICS_CONFIG, _PIXI_APP, TILE_TEXTURES_LIST, ANIMATION_TEXTURES_LIST, i);
    auxTilesList[i].setGraphicsMode();
    let tmpTile = auxTilesList[i];

    //12
    ANIMATION_TEXTURES_LIST["12"][i] = [];
    tmpTile._prepareAnimateBorderTextGraphics(12);
    for (let j = 0; j < 12; ++j) {
        tmpTile._animateBorderTextStep();
        let tmpTexture = _PIXI_APP.renderer.generateTexture(tmpTile.getGraphics() as PIXI.Graphics);
        ANIMATION_TEXTURES_LIST["12"][i].push(tmpTexture);
        /*  let tmpSprite = new PIXI.Sprite(tmpTexture);
          tmpSprite.x = 100 * (i + 9);
          tmpSprite.y = 100 * j;
         
          _PIXI_APP.stage.addChild(tmpSprite);*/
    }

    //11
    ANIMATION_TEXTURES_LIST["11"][i] = [];
    for (let j = 0; j < 11; ++j) {
        ANIMATION_TEXTURES_LIST["11"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j + 1]);
    }

    //10
    ANIMATION_TEXTURES_LIST["10"][i] = [];
    for (let j = 0; j < 10; ++j) {
        let t = j < 9 ? j + 1 : j + 2;
        ANIMATION_TEXTURES_LIST["10"][i].push(ANIMATION_TEXTURES_LIST["12"][i][t]);
    }
    //9
    ANIMATION_TEXTURES_LIST["9"][i] = [];
    for (let j = 0; j < 9; ++j) {
        ANIMATION_TEXTURES_LIST["9"][i].push(ANIMATION_TEXTURES_LIST["10"][i][j + 1]);
    }

    //8
    ANIMATION_TEXTURES_LIST["8"][i] = [];
    for (let j = 0; j < 8; ++j) {
        ANIMATION_TEXTURES_LIST["8"][i].push(ANIMATION_TEXTURES_LIST["9"][i][j + 1]);

    }
    //7
    ANIMATION_TEXTURES_LIST["7"][i] = [];
    for (let j = 0; j < 12; j++) {
        if (j > 1) { j++; }
        ANIMATION_TEXTURES_LIST["7"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j]);
    }
    //6
    ANIMATION_TEXTURES_LIST["6"][i] = [];
    for (let j = 0; j < 12; j += 2) {
        ANIMATION_TEXTURES_LIST["6"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j]);
    }
    //5
    ANIMATION_TEXTURES_LIST["5"][i] = [];
    for (let j = 0; j < 10; j += 2) {
        ANIMATION_TEXTURES_LIST["5"][i].push(ANIMATION_TEXTURES_LIST["10"][i][j]);

    }

    //4
    ANIMATION_TEXTURES_LIST["4"][i] = [];
    for (let j = 0; j < 12; j += 3) {
        ANIMATION_TEXTURES_LIST["4"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j]);
    }
}

for (let i = -9; i < 10; ++i) {
    let tempTile: PIXI.Graphics = PixiTile.createTileAsGraphics(MAIN_GRAPHICS_CONFIG, i);
    TILE_TEXTURES_LIST[i] = _PIXI_APP.renderer.generateTexture(tempTile);
    /**create tile textures for animations steps:
     * 12 steps works for 6-4-3 steps (works for 11)
     * 10 steps works for (5 as well as for 9)
     * 8 steps (works for 7 too)     
     */
}


/** INCREMENT THIS TO ANIMATE MORE TILES AND STRESS TEST PREFORMANCE */
let TOTAL_TILES = 500;


let tilesList: PixiTile[] = [];

for (let i = 0; i < TOTAL_TILES; ++i) {
    tilesList.push(new PixiTile(MAIN_GRAPHICS_CONFIG, _PIXI_APP, TILE_TEXTURES_LIST, ANIMATION_TEXTURES_LIST, i % 9 + 1));

    /** 
     * 
     *!!!!!! UNCOMMENT THE FOLLOWING LINE TO TEST PERFORMANCE USING GRAPHICS OBJECTS INSTEAD OF SPRITES!!!!!!! 
     * 
     * */
    //tilesList[i].setGraphicsMode();

    tilesList[i].moveTo(Math.random() * 500, Math.random() * 500);
    _PIXI_APP.stage.addChild(tilesList[i].getObjectToUse() as PIXI.Graphics);

}




_PIXI_APP.ticker.stop();
_PIXI_APP.ticker.update();

let globalCounter = 0;

const moveTilesGroup = (totalSteps: number): Promise<number> => {
    return new Promise(function (resolve: any, reject: any) {
        let stepsCounter = 0;
        if (globalCounter >= 100) {
            return reject(globalCounter);
        }
        globalCounter++;
        for (let j = 0; j < TOTAL_TILES; ++j) {
            tilesList[j].slideOfPrepareFn(Math.random() * 500 - 250, Math.random() * 500 - 250, totalSteps);
            tilesList[j].prepareAnimateTint(Math.random() * 0xFFFFFF, 12);
            tilesList[j].preapreAnimateDouble(12, j % 2 == 0 ? 1 : -1);
            //tilesList[j].faceValue = globalCounter % 10;
        }

        let move = (t: number) => {
            if (stepsCounter < totalSteps) {
                for (let j = 0; j < TOTAL_TILES; ++j) {
                    /**texting texture switch at every tick, commend the following line to stop it */
                    // tilesList[j].faceValue = ~~(Math.random() * 10);
                    tilesList[j].slideStep();
                    tilesList[j].animateTintStep();
                    tilesList[j].stepAnimateDouble();
                }
                stepsCounter++;
                _PIXI_APP.ticker.update();
                return requestAnimationFrame(move);
            } else {
                for (let j = 0; j < TOTAL_TILES; ++j) {
                    tilesList[j].resetAllAnimationsData();
                }
                _PIXI_APP.ticker.update();
                moveTilesGroup(totalSteps);
                return resolve(totalSteps);
            }
        };

        requestAnimationFrame(move);

    });


};
/**moving cycle */
moveTilesGroup(12);



