(function (pixiFilters,PIXI$1) {
    'use strict';

    var mainGraphicType;
    (function (mainGraphicType) {
        mainGraphicType[mainGraphicType["Graphics"] = 0] = "Graphics";
        mainGraphicType[mainGraphicType["Sprite"] = 1] = "Sprite";
    })(mainGraphicType || (mainGraphicType = {}));
    class PixiTile {
        constructor(globalConfig, APP, _TEXTURES_LIST, _value = 0) {
            this.globalConfig = globalConfig;
            this.APP = APP;
            this._TEXTURES_LIST = _TEXTURES_LIST;
            this._value = _value;
            this.graphicsType = mainGraphicType.Sprite;
            this._GRAPHICS_OBJECT = PixiTile.createTileAsGraphics(globalConfig, _value);
            this._SPRITE_OBJECT = new PIXI.Sprite(_TEXTURES_LIST[_value]);
            this._SLIDE_DATA = { currentStep: 0, slideAmountX: 0, slideAmountY: 0, totalSteps: 0, objectToMove: this._SPRITE_OBJECT };
            this._TINT_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, tintStep_RED: 0, tintStep_BLUE: 0, tintStep_GREEN: 0, objectToAnimate: this._SPRITE_OBJECT };
            this.doubleValueFilter = new pixiFilters.GlowFilter();
        }
        setSpriteMode() {
            this.graphicsType = mainGraphicType.Sprite;
            this._SLIDE_DATA.objectToMove = this._SPRITE_OBJECT;
        }
        ;
        setGraphicsMode() {
            this.graphicsType = mainGraphicType.Graphics;
            this._SLIDE_DATA.objectToMove = this._GRAPHICS_OBJECT;
        }
        ;
        createGraphics() {
            this._GRAPHICS_OBJECT = PixiTile.createTileAsGraphics(this.globalConfig, this._value);
            return this;
        }
        ;
        moveTo(x, y) {
            let objectToMove = this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
            objectToMove.x = x;
            objectToMove.y = y;
        }
        ;
        prepareFilterAnimation() { }
        ;
        resetFilterAnimation() { }
        ;
        slideOfPrepareFn(x, y, steps) {
            this._SLIDE_DATA.currentStep = 0;
            this._SLIDE_DATA.totalSteps = steps;
            this._SLIDE_DATA.slideAmountX = x / this.globalConfig.tileFullSize;
            this._SLIDE_DATA.slideAmountY = y / this.globalConfig.tileFullSize;
            this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
        }
        ;
        slideOf_percent_PrepareFn(x, y, steps) {
        }
        ;
        slideToPrepareFn(x, y, steps) {
        }
        ;
        slideStep() {
            let _SLIDE_DATA = this._SLIDE_DATA;
            if (_SLIDE_DATA.currentStep === _SLIDE_DATA.totalSteps) {
                return 0;
            }
            _SLIDE_DATA.currentStep++;
            let objectToMove = _SLIDE_DATA.objectToMove;
            objectToMove.x += _SLIDE_DATA.slideAmountX;
            objectToMove.y += _SLIDE_DATA.slideAmountY;
            return _SLIDE_DATA.currentStep;
        }
        ;
        resetSlideData() {
            this._SLIDE_DATA.currentStep = 0;
            this._SLIDE_DATA.totalSteps = 0;
            this._SLIDE_DATA.slideAmountX = 0;
            this._SLIDE_DATA.slideAmountY = 0;
            return this;
        }
        ;
        resetAllAnimationsData() {
            this._SLIDE_DATA.currentStep = 0;
            this._SLIDE_DATA.totalSteps = 0;
            this._SLIDE_DATA.slideAmountX = 0;
            this._SLIDE_DATA.slideAmountY = 0;
            this._TINT_ANIMATION_DATA.currentStep = 0;
            this._TINT_ANIMATION_DATA.totalSteps = 0;
            this._TINT_ANIMATION_DATA.tintStep_BLUE = 0;
            this._TINT_ANIMATION_DATA.tintStep_GREEN = 0;
            this._TINT_ANIMATION_DATA.tintStep_RED = 0;
            return this;
        }
        ;
        set faceValue(v) {
            this._value = v;
            if (this.graphicsType === mainGraphicType.Sprite) {
                this._SPRITE_OBJECT.texture = this._TEXTURES_LIST[this._value];
            }
            else {
                let numberElement = this._GRAPHICS_OBJECT.children[0];
                if (v !== 0) {
                    numberElement.text = `${v}`;
                    numberElement.style.fill = v > 0 ? this.globalConfig.tileNumberColors[v] : this.globalConfig.negativeNumberColor;
                }
                else {
                    numberElement.text = '';
                }
            }
        }
        ;
        get faceValue() {
            return this._value;
        }
        ;
        set X(x) {
            this.absX = x;
        }
        ;
        set Y(y) {
            this.absY = y;
        }
        ;
        getGraphics() {
            return this._GRAPHICS_OBJECT;
        }
        ;
        getSprite() {
            return this._SPRITE_OBJECT;
        }
        ;
        getObjectToUse() {
            return this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
        }
        ;
        setGraphicsFaceValue() { }
        ;
        setSpriteFaceValue() { }
        ;
        prepareAnimateTint(tint, steps) {
            let graphicsData = this._TINT_ANIMATION_DATA.objectToAnimate = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
            this._TINT_ANIMATION_DATA.currentStep = 0;
            this._TINT_ANIMATION_DATA.totalSteps = steps;
            let fillColor = graphicsData.tint;
            let r = (fillColor & 0xFF0000) >> 16;
            let g = (fillColor & 0x00FF00) >> 8;
            let b = fillColor & 0x0000FF;
            let tr = (tint & 0xFF0000) >> 16;
            let tg = (tint & 0x00FF00) >> 8;
            let tb = tint & 0x0000FF;
            this._TINT_ANIMATION_DATA.tintStep_RED = (tr - r) / steps;
            this._TINT_ANIMATION_DATA.tintStep_GREEN = (tg - g) / steps;
            this._TINT_ANIMATION_DATA.tintStep_BLUE = (tb - b) / steps;
        }
        ;
        animateTintStep() {
            let _TINT_ANIMATION_DATA = this._TINT_ANIMATION_DATA;
            if (_TINT_ANIMATION_DATA.currentStep === _TINT_ANIMATION_DATA.totalSteps) {
                return 0;
            }
            _TINT_ANIMATION_DATA.currentStep++;
            let objectToAnimate = _TINT_ANIMATION_DATA.objectToAnimate;
            let paintTint = (_TINT_ANIMATION_DATA.tintStep_RED << 16) + (_TINT_ANIMATION_DATA.tintStep_GREEN << 8) + _TINT_ANIMATION_DATA.tintStep_BLUE;
            objectToAnimate.tint += paintTint;
            return _TINT_ANIMATION_DATA.currentStep;
        }
        ;
        static createTileAsGraphics(_CONF, val) {
            let aTile = new PIXI.Graphics();
            aTile.beginFill(_CONF.tileBackColor, _CONF.defaultAlpha);
            aTile.drawRoundedRect(0, 0, _CONF.tileSize, _CONF.tileSize, _CONF.roundBorderFactor);
            aTile.endFill();
            aTile.interactiveChildren = false;
            if (val !== 0 && val !== null) {
                let cellNumber = '';
                cellNumber = val;
                let textColor = cellNumber > 0 ? _CONF.tileNumberColors[cellNumber] : _CONF.negativeNumberColor;
                let number = new PIXI.Text(`${cellNumber}`, {
                    fontWeight: 'bold',
                    fontSize: _CONF.fontSize,
                    fontFamily: 'Roboto',
                    fill: textColor,
                    align: 'center'
                });
                number.x = aTile.width / 2;
                number.y = aTile.height / 2;
                number.anchor.set(0.5, 0.5);
                aTile.addChild(number);
            }
            return aTile;
        }
        ;
    }

    const canvasContainer = document.getElementById("game-play");
    const _PIXI_APP = new PIXI$1.Application(1000, 1000, {
        antialias: true,
        transparent: true,
        autoResize: true
    });
    _PIXI_APP.renderer.autoResize = true;
    canvasContainer.appendChild(_PIXI_APP.view);
    const torusContainer = new PIXI$1.Container();
    _PIXI_APP.stage.addChild(torusContainer);
    torusContainer.x = 0;
    torusContainer.y = 0;
    torusContainer.interactiveChildren = false;
    _PIXI_APP.stage.interactive = true;
    const tileFullSize = 100;
    const MAIN_GRAPHICS_CONFIG = {
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
    const TILE_TEXTURES_LIST = [];
    for (let i = -9; i < 10; ++i) {
        let tempTile = PixiTile.createTileAsGraphics(MAIN_GRAPHICS_CONFIG, i);
        TILE_TEXTURES_LIST[i] = _PIXI_APP.renderer.generateTexture(tempTile);
    }
    let TOTAL_TILES = 500;
    let tilesList = [];
    for (let i = 0; i < TOTAL_TILES; ++i) {
        tilesList.push(new PixiTile(MAIN_GRAPHICS_CONFIG, _PIXI_APP, TILE_TEXTURES_LIST, i % 9 + 1));
        tilesList[i].moveTo(Math.random() * 500, Math.random() * 500);
        _PIXI_APP.stage.addChild(tilesList[i].getObjectToUse());
    }
    _PIXI_APP.ticker.stop();
    _PIXI_APP.ticker.update();
    let globalCounter = 0;
    const moveTilesGroup = (totalSteps) => {
        return new Promise(function (resolve, reject) {
            let stepsCounter = 0;
            if (globalCounter >= 100) {
                return reject(globalCounter);
            }
            globalCounter++;
            for (let j = 0; j < TOTAL_TILES; ++j) {
                tilesList[j].slideOfPrepareFn(Math.random() * 500 - 250, Math.random() * 500 - 250, totalSteps);
                tilesList[j].prepareAnimateTint(Math.random() * 0xFFFFFF, 12);
                tilesList[j].faceValue = globalCounter % 10;
            }
            let move = (t) => {
                if (stepsCounter < totalSteps) {
                    for (let j = 0; j < TOTAL_TILES; ++j) {
                        tilesList[j].slideStep();
                        tilesList[j].animateTintStep();
                    }
                    stepsCounter++;
                    _PIXI_APP.ticker.update();
                    return requestAnimationFrame(move);
                }
                else {
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
    moveTilesGroup(12);

}(PIXI.filters,PIXI));
//# sourceMappingURL=main.es6.js.map
