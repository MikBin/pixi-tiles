declare var gridModel: any; //dereferncing external non typescript libraries
import * as PIXI from 'pixi.js';
import { graphicsConfiguration, moveAndAnimateData, canvasSizes } from "./interfaces";
import { PixiTile } from "./PixiTile";

const SLIDE_LEFT: number = 1,
    SLIDE_RIGHT: number = 0,
    SLIDE_UP: number = 2,
    SLIDE_DOWN: number = 3;

const directionNames = ["right", "left", "up", "down"];

const getCanvasSize = (tileSize: number, torusModel): canvasSizes => {
    console.log(tileSize, torusModel.rows, torusModel.cols);
    return {
        width: tileSize * torusModel.cols,
        height: tileSize * torusModel.rows
    }
};

const getTileSize = (containerHeight: number, containerWidth: number, torusModel, normalizer: number): number => {

    let fullTileSize = 0;
    if (torusModel.rows > torusModel.cols) {
        fullTileSize = containerHeight / (normalizer * torusModel.rows);
    } else {
        fullTileSize = containerWidth / (normalizer * torusModel.cols);
    }
    return fullTileSize;
};

const getSegmentSlopeDirection = (Xa, Xb, Ya, Yb) => {
    /*0 left 1 right 2 up 3 down*/

    let deltaX = Xa - Xb;
    let deltaY = Ya - Yb;
    let delta = (Ya - Yb) / (Xa - Xb);
    let absDelta = Math.abs(delta);
    if (absDelta < 1) {
        /*horizontal slide*/
        if (Math.abs(Xa - Xb) < 20) {
            return -1;
        }
        return deltaX > 0 ? SLIDE_LEFT : SLIDE_RIGHT;
    } else {
        /*vertical slide*/
        if (Math.abs(Ya - Yb) < 20) {
            return -1;
        }
        return deltaY > 0 ? SLIDE_UP : SLIDE_DOWN;
    }
};
const getRowToSlide = (Ya, Yb, tileFullSize) => {

    let Y = (Ya + Yb) / 2;
    return Math.floor(Y / tileFullSize);
};
const getColToSlide = (Xa, Xb, tileFullSize) => {
    let X = (Xa + Xb) / 2;
    return Math.floor(X / tileFullSize);
};

const buildMask = (torusMatrix, pixiMaskObject: PIXI.Graphics, conf: graphicsConfiguration): void => {
    let cellSize = conf.tileSize + 2 * conf.margins;
    pixiMaskObject.beginFill(0xFFFFFF, 1);
    torusMatrix.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell !== null) {
                pixiMaskObject.drawRect(c * cellSize, r * cellSize, cellSize,
                    cellSize);
            }
        });
    });
    pixiMaskObject.endFill();
};



export const MAIN_GRAPHICS_CONFIG: graphicsConfiguration = {
    marginPercent: 0.01,
    fontSizePercent: 0.6,
    doubleFontSizePercent: 0.7,
    borderPercent: 0.12,
    doubleBorderPercent: 0.40,
    _16_9_MOD: 0.6,
    containerHeightModifier: 0.6,
    sizeNormalizer: 1.04,
    fontSize: 0,
    biggerFontSize: 0,
    tileBackColor: 0xFAFAFA,
    defaultAlpha: 1,
    strokeThicknessBase: 0,
    strokeThicknessDouble: 0,
    roundBorderFactor: 0,
    doubleBorderFactor: 0,
    tileFullSize: 0,
    tileSize: 0,
    sourceTileTextureSize: 262,
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

const TEXTURES_GLOBAL = {
    ANIMATION_TEXTURES: null,
    TILE_TEXTURES: null
};



export class TorusViewFactory {
    private TILE_TEXTURES_LIST: PIXI.Texture[];
    private ANIMATION_TEXTURES_LIST: Object;
    private canvasSizes: canvasSizes;
    private SEMAPHORES: {
        slide: boolean,
        slideAnimationFPSset: boolean
    };
    private startingGrid: number[][];
    private PIXI_APP: PIXI.Application;
    private ticker: any;
    private torusContainer: PIXI.Container;
    private mask: PIXI.Graphics;
    private lastPointerDown: {
        x: number;
        y: number;
    };
    private tilesMap: Object;
    private slideEndCode: string;
    private animationTimingEMA: number;
    constructor(private torus, private canvasContainer: HTMLElement, private _configuration: graphicsConfiguration = Object.assign({}, MAIN_GRAPHICS_CONFIG), private playSlideSound: Function = () => { }, private publishScore: Function = () => { }) {

        this.animationTimingEMA = _configuration.animationTiming;

        if (_configuration.tileFullSize === 0) {
            let w = window.innerWidth;
            let h = window.innerHeight;
            if (w > h) {
                w = _configuration._16_9_MOD * h;
            } else {
                h = h * _configuration.containerHeightModifier;
            }

            w > h ? w = h : h = w;
            _configuration.tileFullSize = getTileSize(h, w, torus, _configuration.sizeNormalizer);
        }

        this.lastPointerDown = {
            x: 0,
            y: 0
        };
        this.SEMAPHORES = {
            slide: true,
            slideAnimationFPSset: false
        };
        this.canvasSizes = getCanvasSize(_configuration.tileFullSize, torus);

        const startingGrid = gridModel.fn.torusArrayToMatrix(torus);
        this.startingGrid = startingGrid;
        TorusViewFactory.setMainGraphicsConfig(_configuration.tileFullSize, _configuration);

        this.slideEndCode = `SLIDE_END.${torus._id}`;
        /**create PIXI app */
        this.PIXI_APP = new PIXI.Application(this.canvasSizes.width, this.canvasSizes.height, {
            antialias: true,
            transparent: true,
            autoResize: true
        });

        this.TILE_TEXTURES_LIST = TEXTURES_GLOBAL.TILE_TEXTURES;//TorusViewFactory.buildTilesTexturesList(this.PIXI_APP.renderer, _configuration);
        this.ANIMATION_TEXTURES_LIST = TEXTURES_GLOBAL.ANIMATION_TEXTURES; //TorusViewFactory.buildAnimationTexturesList(this.PIXI_APP, _configuration);

        canvasContainer.appendChild(this.PIXI_APP.view);

        const torusContainer: PIXI.Container = this.torusContainer = new PIXI.Container();

        this.PIXI_APP.stage.addChild(torusContainer);
        torusContainer.x = 0;
        torusContainer.y = 0;

        torusContainer.interactiveChildren = false;

        this.PIXI_APP.stage.interactive = true;

        /**MASK */
        const mainMask = this.mask = new PIXI.Graphics();
        mainMask.x = 0;
        mainMask.y = 0;


        /**add layer for swipe animation capturing  */
        const layer = new PIXI.Graphics();
        this.PIXI_APP.stage.addChild(layer);
        layer.x = 0;
        layer.y = 0;
        layer.beginFill(0xFFFFFF, 0);
        layer.drawRect(0, 0, this.canvasSizes.width, this.canvasSizes.height);
        layer.endFill();


        buildMask(startingGrid, mainMask, _configuration);
        torusContainer.mask = mainMask;
        this.tilesMap = {};
        this.buildStartTiles();

        /**bind events */
        this.PIXI_APP.stage.on('pointerdown', this.onDown.bind(this));
        this.PIXI_APP.stage.on('pointerup', this.onUp.bind(this));

        this.PIXI_APP.ticker.stop();

        this.runAnimationVector(this.syncTilesWeights(), "callWeightChangeAnimationStep", _configuration.animationSteps);

    };
    updateSlidesSteps(time: number): void {
        let config = this._configuration;
        let delta: number = time - config.animationTiming;
        if (Math.abs(delta) > config.slideChangeThreshold) {
            delta > 0 ? config.animationSteps-- : config.animationSteps++;
        }
        if (config.animationSteps > config.stepsLimit) {
            config.animationSteps = config.stepsLimit;
        } else if (config.animationSteps < 3) {
            config.animationSteps = 3;
        }
        console.log(config.animationSteps, delta);
    };
    onDown(e): void {
        this.lastPointerDown.x = e.data.global.x;
        this.lastPointerDown.y = e.data.global.y;
    };
    onUp(e) {
        let direction = getSegmentSlopeDirection(this.lastPointerDown.x, e.data.global.x,
            this.lastPointerDown.y, e.data.global.y);

        if (direction === -1) {
            return false;
        }

        if (!this.SEMAPHORES.slide) {

            return false;
        }

        if (direction > 1) {
            let colIdx = getColToSlide(e.data.global.x, this.lastPointerDown.x, this._configuration.tileFullSize);
            /*column*/
            this.playSlideSound();
            let _p = Date.now();
            this.slideColumn(colIdx, direction).then((res) => {

                this.publishScore(this.slideEndCode, this.torus.getData());
                let animations = this.syncColTilesWeights(colIdx);
                this.runAnimationVector(animations, "callWeightChangeAnimationStep", this._configuration.animationSteps).then((res) => {
                    _p = Date.now() - _p;
                    this.updateSlidesSteps(_p / 2);
                    this.SEMAPHORES.slide = true;

                });


            });

        } else {
            /*rows*/
            let rowIdx = getRowToSlide(e.data.global.y, this.lastPointerDown.y, this._configuration.tileFullSize);
            this.playSlideSound();
            let _p = Date.now();
            this.slideRow(rowIdx, direction).then((res) => {
                this.publishScore(this.slideEndCode, this.torus.getData());
                let animations = this.syncRowTilesWeights(rowIdx);
                this.runAnimationVector(animations, "callWeightChangeAnimationStep", this._configuration.animationSteps).then((res) => {
                    _p = Date.now() - _p;
                    this.updateSlidesSteps(_p / 2);
                    this.SEMAPHORES.slide = true;

                });
            });

        }
    };
    syncTilesWeights(): PixiTile[] {
        let tilesMap = this.tilesMap;
        let torus = this.torus;
        let rows = this.torus.rows;
        let cols = this.torus.cols;
        let animationsList: PixiTile[] = [];
        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < cols; ++j) {
                let w = torus.getValueWeight(i, j);
                let tile = tilesMap[i][j];
                tile.weight = w;
                if (tile.prepareWeightChangeAnimationFn(this._configuration.animationSteps)) {
                    animationsList.push(tile);
                }
            }
        }
        return animationsList;
    };
    prepareTileWeightChange(tile: PixiTile, r: number, c: number): boolean {
        let torus = this.torus;
        let w = torus.getValueWeight(r, c);
        tile.weight = w;
        if (tile.prepareWeightChangeAnimationFn(this._configuration.animationSteps)) {
            return true;
        }
        return false;
    };
    syncColTilesWeights(colIdx: number): PixiTile[] {
        let animationsList: PixiTile[] = [];
        let torus = this.torus;
        let tilesMap = this.tilesMap;
        let prevCol: number = colIdx > 0 ? colIdx - 1 : -1;
        let nextCol: number = colIdx < torus.cols - 1 ? colIdx + 1 : -1;
        for (let i = 0; i < torus.rows; ++i) {
            if (this.prepareTileWeightChange(tilesMap[i][colIdx], i, colIdx)) {
                animationsList.push(tilesMap[i][colIdx]);
            }
            if (prevCol > -1) {
                if (this.prepareTileWeightChange(tilesMap[i][prevCol], i, prevCol)) {
                    animationsList.push(tilesMap[i][prevCol]);
                }
            }
            if (nextCol > -1) {
                if (this.prepareTileWeightChange(tilesMap[i][nextCol], i, nextCol)) {
                    animationsList.push(tilesMap[i][nextCol]);
                }
            }

        }
        return animationsList;
    };
    syncRowTilesWeights(rowIdx: number): PixiTile[] {
        let animationsList: PixiTile[] = [];
        let torus = this.torus;
        let tilesMap = this.tilesMap;
        let prevRow: number = rowIdx > 0 ? rowIdx - 1 : -1;
        let nextRow: number = rowIdx < torus.rows - 1 ? rowIdx + 1 : -1;
        for (let i = 0; i < torus.cols; ++i) {
            if (this.prepareTileWeightChange(tilesMap[rowIdx][i], rowIdx, i)) {
                animationsList.push(tilesMap[rowIdx][i]);
            }
            if (prevRow > -1) {
                if (this.prepareTileWeightChange(tilesMap[prevRow][i], prevRow, i)) {
                    animationsList.push(tilesMap[prevRow][i]);
                }
            }
            if (nextRow > -1) {
                if (this.prepareTileWeightChange(tilesMap[nextRow][i], nextRow, i)) {
                    animationsList.push(tilesMap[nextRow][i]);
                }
            }

        }
        return animationsList;
    };
    runAnimationVector(animationVector: PixiTile[], stepFunctionName: string, totalSteps: number): Promise<number> {
        /**to call this function animationVector must contain tiles already prepared for this animation with steps=totalSteps */
        const self = this;
        return new Promise(function (resolve: any, reject: any) {

            let stepsCounter = 0;
            const totalTiles = animationVector.length;

            const _PIXI_APP = self.PIXI_APP;


            let animate = (t: number) => {
                if (stepsCounter < totalSteps) {
                    for (let j = 0; j < totalTiles; ++j) {
                        // tilesFnList[j]();
                        animationVector[j][stepFunctionName]();
                    }
                    stepsCounter++;
                    _PIXI_APP.ticker.update();
                    return requestAnimationFrame(animate);
                } else {
                    for (let j = 0; j < totalTiles; ++j) {
                        animationVector[j].resetAllAnimationsData();
                    }
                    _PIXI_APP.ticker.update();
                    return resolve(totalSteps);
                }
            };

            requestAnimationFrame(animate);

        });
    };
    resize() { };
    resync(): Promise<number> {
        let tilesMap = this.tilesMap;
        let torus = this.torus;
        let rows = this.torus.rows;
        let cols = this.torus.cols;

        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < cols; ++j) {
                let v = torus.getValueRC(i, j);
                let tile = tilesMap[i][j];
                tile.faceValue = v;
                tile.resetWeights();
            }
        }

        return this.runAnimationVector(this.syncTilesWeights(), "callWeightChangeAnimationStep", this._configuration.animationSteps);
    };
    remove(): void {
        this.PIXI_APP.renderer.destroy();
        this.PIXI_APP.stage.destroy();
        let tilesMap = this.tilesMap;
        let rows = this.torus.rows;
        let cols = this.torus.cols;
        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < cols; ++j) {

                tilesMap[i][j].remove();

            }
        }

        for (let p in this) {
            this[p] = null;
        }

    };
    isTileOutBound(tileObj: PixiTile) {

        let ans = tileObj.row <= -1 || tileObj.col <= -1 || tileObj.row >= this.torus.rows || tileObj
            .col >= this.torus.cols;

        return ans;
    };
    resetTilePosition(tileObj: PixiTile) {
        console.log(`reset tile position called for tile: ${tileObj.faceValue}-r:${tileObj.row}-c:${tileObj.col}`);
        let tileGraphics = tileObj.getObjectToUse();
        let conf = this._configuration;
        let rows: number = this.torus.rows;
        let cols: number = this.torus.cols;
        if (tileObj.row == -2) {
            console.log(`row -2  old position: r:${tileObj.row} c:${tileObj.col}`);
            tileObj.row = rows;
            console.log(`new position: r:${tileObj.row} c:${tileObj.col}`);
            tileGraphics.y = rows * conf.tileFullSize + conf.margins;
        } else if (tileObj.row > rows) {
            console.log(` row > cols old position: r:${tileObj.row} c:${tileObj.col}`);
            tileObj.row = -1;
            console.log(`new position: r:${tileObj.row} c:${tileObj.col}`);

            tileGraphics.y = -conf.tileFullSize + conf.margins;
        }

        if (tileObj.col == -2) {
            console.log(`col -2 old position: r:${tileObj.row} c:${tileObj.col}`);
            tileObj.col = cols;

            tileGraphics.x = cols * conf.tileFullSize + conf.margins;
            console.log(`new position: r:${tileObj.row} c:${tileObj.col}`);
        } else if (tileObj.col > cols) {
            console.log(`col > row old position: r:${tileObj.row} c:${tileObj.col}`);
            tileObj.col = -1;

            tileGraphics.x = -conf.tileFullSize + conf.margins;
            console.log(`new position: r:${tileObj.row} c:${tileObj.col}`);
        }
    };
    slideRow(rowIdx: number, direction: number): Promise<number> {
        this.SEMAPHORES.slide = false;
        console.log("---------------------------------------");
        console.log(`slide row: ${rowIdx} -- ${direction}`)
        let conf = this._configuration;
        let torus = this.torus;
        let moveOf: number = this._configuration.tileFullSize;
        let moveOfAbs: number = 1;
        let tilesMap = this.tilesMap;
        let rowToSlide = tilesMap[rowIdx];
        if (direction === SLIDE_LEFT) {
            moveOf = -moveOf;
            moveOfAbs = -1;
            torus.slideRowLeft(rowIdx);
        } else {
            torus.slideRowRight(rowIdx)
        }
        torus.valuate();
        this.beforeSlideSetRow(rowIdx, direction);
        let animations: PixiTile[] = [];
        for (let i = -1; i <= torus.cols; ++i) {
            rowToSlide[i].col += moveOfAbs;
            rowToSlide[i].slideOfPrepareFn(moveOf, 0, conf.animationSteps);
            animations.push(rowToSlide[i]);
        }


        return this.runAnimationVector(animations, "slideStep", conf.animationSteps).then((res) => {


            for (let i = 0; i < animations.length; ++i) {
                let tileObj = animations[i];
                console.log("slide ended for tile: ", tileObj.row, tileObj.col, tileObj.faceValue);
                this.resetTilePosition(tileObj);

                tilesMap[tileObj.row][tileObj.col] = tileObj;
                if (this.isTileOutBound(tileObj)) {
                    tileObj.setOutside();
                }
                console.log("after reset position and setOUtisde?: ", tileObj.row, tileObj.col, tileObj.faceValue);
            }

            return res;
        });
    };
    slideColumn(colIdx: number, direction: number): Promise<number> {
        console.log("---------------------------------------");
        console.log(`slide column: ${colIdx} -- ${direction}`);
        this.SEMAPHORES.slide = false;
        let conf = this._configuration;
        let torus = this.torus;
        let moveOf: number = this._configuration.tileFullSize;
        let moveOfAbs: number = 1;
        let tilesMap = this.tilesMap;

        if (direction === SLIDE_UP) {
            moveOf = -moveOf;
            moveOfAbs = -1;
            torus.slideColUp(colIdx);
        } else {
            torus.slideColDown(colIdx)
        }
        torus.valuate();
        this.beforeSlideSetCol(colIdx, direction);
        let animations: PixiTile[] = [];
        for (let i = -1; i <= torus.rows; ++i) {
            tilesMap[i][colIdx].row += moveOfAbs;
            tilesMap[i][colIdx].slideOfPrepareFn(0, moveOf, conf.animationSteps);
            animations.push(tilesMap[i][colIdx]);
        }


        return this.runAnimationVector(animations, "slideStep", conf.animationSteps).then((res) => {

            for (let i = 0; i < animations.length; ++i) {
                let tileObj = animations[i];
                console.log("slide ended for tile: ", tileObj.row, tileObj.col, tileObj.faceValue);
                this.resetTilePosition(tileObj);
                tilesMap[tileObj.row][tileObj.col] = tileObj;
                if (this.isTileOutBound(tileObj)) {
                    tileObj.setOutside();
                }
                console.log("after reset position and setOUtisde?: ", tileObj.row, tileObj.col, tileObj.faceValue);
            }

            return res;
        });
    };
    setMouseGestureReaction() { };
    getTileSize() { };
    beforeSlideSetRow(rowIdx: number, direction: number) {
        let torus = this.torus;
        let tilesMap = this.tilesMap;
        let conf = this._configuration;
        let cols = torus.cols;
        let rows = torus.rows;
        if (direction === SLIDE_RIGHT) {
            /*set outsiders*/
            let outSideTile = tilesMap[rowIdx][-1];
            let tempValue = torus.getValueRC(rowIdx, 0);
            if (tempValue !== null) {
                outSideTile.faceValue = tempValue;
            }
            /*set nulls*/
            for (let c = cols - 2; c >= 0; --c) {
                if (torus.getValueRC(rowIdx, c) === null) {
                    let tmpVal = torus.getValueRC(rowIdx, c + 1);
                    if (tmpVal !== null) {
                        tilesMap[rowIdx][c].faceValue = tmpVal;
                    }
                }
            }
        } else {
            let outSideTile = tilesMap[rowIdx][cols];
            let tempValue = torus.getValueRC(rowIdx, cols - 1);
            if (tempValue !== null) {
                outSideTile.faceValue = tempValue;
            }
            /*set nulls*/
            for (let c = 1; c < cols; ++c) {
                if (torus.getValueRC(rowIdx, c) === null) {
                    let tmpVal = torus.getValueRC(rowIdx, c - 1);
                    if (tmpVal !== null) {
                        tilesMap[rowIdx][c].faceValue = tmpVal;
                    }
                }
            }
        }
    };
    beforeSlideSetCol(colIdx: number, direction: number) {
        let torus = this.torus;
        let tilesMap = this.tilesMap;
        let conf = this._configuration;
        let cols: number = torus.cols;
        let rows: number = torus.rows;
        if (direction === SLIDE_DOWN) {
            /*set outsiders*/
            let outSideTile = tilesMap[-1][colIdx];
            let tempValue = torus.getValueRC(0, colIdx);
            if (tempValue !== null) {
                outSideTile.faceValue = tempValue;
            }
            /*set nulls*/
            for (let r = rows - 2; r >= 0; --r) {
                if (torus.getValueRC(r, colIdx) === null) {
                    let tmpVal = torus.getValueRC(r + 1, colIdx);
                    if (tmpVal !== null) {
                        tilesMap[r][colIdx].faceValue = tmpVal;
                    }
                }
            }
        } else {
            let outSideTile = tilesMap[rows][colIdx];
            let tempValue = torus.getValueRC(rows - 1, colIdx);
            if (tempValue !== null) {
                outSideTile.faceValue = tempValue;
            }
            /*set nulls*/
            for (let r = 1; r < rows; ++r) {
                if (torus.getValueRC(r, colIdx) === null) {
                    let tmpVal = torus.getValueRC(r - 1, colIdx);
                    if (tmpVal !== null) {
                        tilesMap[r][colIdx].faceValue = tmpVal;
                    }
                }
            }
        }
    };
    placeTileInContainer(r, c, val, pixiContainer): PixiTile {
        let aTile = new PixiTile(this._configuration, this.PIXI_APP, this.TILE_TEXTURES_LIST, this.ANIMATION_TEXTURES_LIST, val);
        pixiContainer.addChild(aTile.getObjectToUse());
        aTile.row = r;
        aTile.col = c;
        aTile.positionByRowAndCol();
        return aTile;
    };
    buildStartTiles() {
        let torusMatrix = this.startingGrid;
        let pixiContainer = this.torusContainer;
        const conf = this._configuration;
        let cellSize = conf.tileSize;
        let graphicsTilesMap = this.tilesMap;
        let rows = this.torus.rows;
        let cols = this.torus.cols;
        graphicsTilesMap[-1] = {};
        graphicsTilesMap[rows] = {};
        torusMatrix.forEach((row, r) => {
            /*set the left outboudn element*/
            graphicsTilesMap[r] = {};
            graphicsTilesMap[r][-1] = this.placeTileInContainer(r, -1, 0, pixiContainer);
            row.forEach((cell, c) => {
                if (r === 0) {
                    /*place top and bottom in columns*/
                    graphicsTilesMap[-1][c] = this.placeTileInContainer(-1, c, 0,
                        pixiContainer);
                    graphicsTilesMap[rows][c] = this.placeTileInContainer(
                        rows, c, 0, pixiContainer);
                }
                graphicsTilesMap[r][c] = this.placeTileInContainer(r, c, cell,
                    pixiContainer);

            });
            /*place the right outbound element*/
            graphicsTilesMap[r][cols] = this.placeTileInContainer(r, cols, 0,
                pixiContainer);
        });
        console.log("loggin tiles maep: ", this.tilesMap);
    };
    static buildAnimationTexturesList(_PIXI_APP: PIXI.Application, _main_graphics_config: graphicsConfiguration): Object {

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
        let auxTilesList: Object = {};
        let TILE_TEXTURES_LIST: PIXI.Texture[] = [];
        for (let i = -9; i < 10; ++i) {
            if (i == 0) { continue; }
            auxTilesList[i] = new PixiTile(_main_graphics_config, _PIXI_APP, TILE_TEXTURES_LIST, ANIMATION_TEXTURES_LIST, i);
            auxTilesList[i].setGraphicsMode();
            let tmpTile = auxTilesList[i];

            //12
            ANIMATION_TEXTURES_LIST["12"][i] = [];
            tmpTile._prepareAnimateBorderTextGraphics(12);
            for (let j = 0; j < 12; ++j) {
                tmpTile._animateBorderTextStep();
                let tmpTexture = tmpTile.getGraphics().generateCanvasTexture();//_PIXI_APP.renderer.generateTexture(tmpTile.getGraphics() as PIXI.Graphics);
                ANIMATION_TEXTURES_LIST["12"][i].push(tmpTexture);

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

        return ANIMATION_TEXTURES_LIST;
    };
    static buildTilesTexturesList(renderer: any, _main_graphics_config: graphicsConfiguration): PIXI.Texture[] {
        let TILE_TEXTURES_LIST: PIXI.Texture[] = [];
        for (let i = -9; i < 10; ++i) {
            let tempTile: PIXI.Graphics = PixiTile.createTileAsGraphics(_main_graphics_config, i);
            TILE_TEXTURES_LIST[i] = tempTile.generateCanvasTexture();//renderer.generateTexture(tempTile);
        }
        return TILE_TEXTURES_LIST;
    };
    static setMainGraphicsConfig(tileFullSize: number, mainConfig: graphicsConfiguration): void {

        mainConfig.tileSize = tileFullSize;
        mainConfig.tileFullSize = tileFullSize;

        mainConfig.margins = Math.ceil(tileFullSize * mainConfig.marginPercent);
        mainConfig.tileSize = tileFullSize - 2 * mainConfig.margins;
        mainConfig.fontSize = Math.round((tileFullSize - 2 * mainConfig.margins) * mainConfig.fontSizePercent);
        mainConfig.biggerFontSize = Math.round((tileFullSize - 2 * mainConfig.margins) * mainConfig.doubleFontSizePercent);
        mainConfig.strokeThicknessDouble = mainConfig.margins * 2.5;
        mainConfig.roundBorderFactor = Math.ceil(tileFullSize * mainConfig.borderPercent);
        mainConfig.doubleBorderFactor = Math.ceil(tileFullSize * mainConfig.doubleBorderPercent);
    };
};


/**generate prerendered textures */
console.time("textures");
(() => {
    let PIXI_APP = new PIXI.Application(1000, 1000, {
        antialias: true,
        transparent: true,
        autoResize: true
    });
    let config = Object.assign({}, MAIN_GRAPHICS_CONFIG);
    TorusViewFactory.setMainGraphicsConfig(262, config);

    TEXTURES_GLOBAL.TILE_TEXTURES = TorusViewFactory.buildTilesTexturesList(PIXI_APP.renderer, config);
    TEXTURES_GLOBAL.ANIMATION_TEXTURES = TorusViewFactory.buildAnimationTexturesList(PIXI_APP, config);
    PIXI_APP.renderer.destroy();
    PIXI_APP.stage.destroy();
})();
console.timeEnd("textures");