import { PixiTile } from "./PixiTile";
import { graphicsConfiguration } from "./interfaces";
import * as PIXI from 'pixi.js';

const canvasContainer = document.getElementById("game-play");

const _PIXI_APP: PIXI.Application = new PIXI.Application(1000, 1000, {
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

for (let i = -9; i < 10; ++i) {
    let tempTile: PIXI.Graphics = PixiTile.createTileAsGraphics(MAIN_GRAPHICS_CONFIG, i);
    TILE_TEXTURES_LIST[i] = _PIXI_APP.renderer.generateTexture(tempTile);
}


/** INCREMENT THIS TO ANIMATE MORE TILES AND STRESS TEST PREFORMANCE */
let TOTAL_TILES = 100;


let tilesList: PixiTile[] = [];

for (let i = 0; i < TOTAL_TILES; ++i) {
    tilesList.push(new PixiTile(MAIN_GRAPHICS_CONFIG, _PIXI_APP, TILE_TEXTURES_LIST, i % 9 + 1));

    /** 
     * 
     *!!!!!! COMMENT THE FOLLOWING LINE TO TEST PERFORMANCE USING GRAPHICS OBJECTS INSTEAD OF SPRITES!!!!!!! 
     * 
     * */
    tilesList[i].setSpriteMode();



    tilesList[i].moveTo(Math.random() * 500, Math.random() * 500);
    _PIXI_APP.stage.addChild(tilesList[i].getObjectToUse());

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
            tilesList[j].faceValue = globalCounter % 10;
        }

        let move = (t: number) => {
            if (stepsCounter < totalSteps) {
                for (let j = 0; j < TOTAL_TILES; ++j) {
                    tilesList[j].slideStep();
                }
                stepsCounter++;
                _PIXI_APP.ticker.update();
                return requestAnimationFrame(move);
            } else {
                for (let j = 0; j < TOTAL_TILES; ++j) {
                    tilesList[j].resetSlideData();
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



