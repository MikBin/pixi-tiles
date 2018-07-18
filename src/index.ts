import { PixiTile } from "./PixiTile";
import { graphicsConfiguration } from "./interfaces";
import * as PIXI from 'pixi.js';
import { MAIN_GRAPHICS_CONFIG } from "./TorusViewBundle";
import { TorusViewFactory } from "./TorusViewBundle";

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

const _main_graphics_config = Object.assign({}, MAIN_GRAPHICS_CONFIG);

TorusViewFactory.setMainGraphicsConfig(tileFullSize, _main_graphics_config);


const TILE_TEXTURES_LIST: PIXI.Texture[] = [];

for (let i = -9; i < 10; ++i) {
    let tempTile: PIXI.Graphics = PixiTile.createTileAsGraphics(_main_graphics_config, i);
    TILE_TEXTURES_LIST[i] = _PIXI_APP.renderer.generateTexture(tempTile);
}

/**
 * 
 * BUILD TEXTURES LIST FOR ANIMATIONS
 * 
 */
let ANIMATION_TEXTURES_LIST: Object = {
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


let neueConfig = Object.assign({}, MAIN_GRAPHICS_CONFIG);
TorusViewFactory.setMainGraphicsConfig(262, neueConfig);

ANIMATION_TEXTURES_LIST = TorusViewFactory.buildAnimationTexturesList(_PIXI_APP, neueConfig);

console.log(ANIMATION_TEXTURES_LIST);
/** INCREMENT THIS TO ANIMATE MORE TILES AND STRESS TEST PREFORMANCE */
let TOTAL_TILES = 100;

let tilesList: PixiTile[] = [];

for (let i = 0; i < TOTAL_TILES; ++i) {
    tilesList.push(new PixiTile(_main_graphics_config, _PIXI_APP, TILE_TEXTURES_LIST, ANIMATION_TEXTURES_LIST, i % 9 + 1));

    /** 
     * 
     *!!!!!! UNCOMMENT THE FOLLOWING LINE TO TEST PERFORMANCE USING GRAPHICS OBJECTS INSTEAD OF SPRITES!!!!!!! 
     * 
     * */
    //tilesList[i].setGraphicsMode();

    tilesList[i].moveTo(Math.random() * 500, Math.random() * 500);
    _PIXI_APP.stage.addChild(tilesList[i].getObjectToUse() as PIXI.Graphics);

}


console.log("loggin tiles list: ", tilesList);

// @ts-ignore
window.ticker = _PIXI_APP.ticker;

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



