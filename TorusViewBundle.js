var TorusViewBundle = (function (exports,PIXI$1) {
    'use strict';

    var directionFB;
    (function (directionFB) {
        directionFB[directionFB["forward"] = 1] = "forward";
        directionFB[directionFB["backward"] = -1] = "backward";
    })(directionFB || (directionFB = {}));
    var WEIGHTS;
    (function (WEIGHTS) {
        WEIGHTS[WEIGHTS["zero"] = 0] = "zero";
        WEIGHTS[WEIGHTS["one"] = 1] = "one";
        WEIGHTS[WEIGHTS["double"] = 2] = "double";
    })(WEIGHTS || (WEIGHTS = {}));

    var mainGraphicType;
    (function (mainGraphicType) {
        mainGraphicType[mainGraphicType["Graphics"] = 0] = "Graphics";
        mainGraphicType[mainGraphicType["Sprite"] = 1] = "Sprite";
    })(mainGraphicType || (mainGraphicType = {}));
    class PixiTile {
        constructor(globalConfig, APP, _TEXTURES_LIST, _ANIMATION_TEXTURES, _value = 0, forceSprite = false) {
            this.globalConfig = globalConfig;
            this.APP = APP;
            this._TEXTURES_LIST = _TEXTURES_LIST;
            this._ANIMATION_TEXTURES = _ANIMATION_TEXTURES;
            this._value = _value;
            this.graphicsType = mainGraphicType.Sprite;
            if (!forceSprite) {
                this._GRAPHICS_OBJECT = PixiTile.createTileAsGraphics(globalConfig, _value);
            }
            this.scaleFactor = globalConfig.tileFullSize / globalConfig.sourceTileTextureSize;
            this._SPRITE_OBJECT = new PIXI.Sprite(_TEXTURES_LIST[_value]);
            this._SPRITE_OBJECT.scale = { x: this.scaleFactor, y: this.scaleFactor };
            this._SLIDE_DATA = { currentStep: 0, slideAmountX: 0, slideAmountY: 0, totalSteps: 0, objectToMove: this._SPRITE_OBJECT };
            this._TINT_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, tintStep_RED: 0, tintStep_BLUE: 0, tintStep_GREEN: 0, endTint: 0, objectToAnimate: this._SPRITE_OBJECT };
            this._GRAPHICS_ANIMATE_DATA = { currentStep: 0, totalSteps: 0, textSizeStep: 0, strokeThicknessStep: 0, borderRadiusStep: 0, currentRadius: globalConfig.roundBorderFactor };
            this._TEXTURE_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, texturesList: [], direction: directionFB.forward, _index: 0 };
            this._weight = WEIGHTS.zero;
            this._row = 0;
            this._col = 0;
            this.weightChangeAnimationCode = 0;
            this.weightChangeCode = "00";
        }
        remove() {
            this.graphicsType = null;
            this._GRAPHICS_OBJECT = null;
            this.scaleFactor = null;
            this._SPRITE_OBJECT = null;
            this._SLIDE_DATA = null;
            this._TINT_ANIMATION_DATA = null;
            this._GRAPHICS_ANIMATE_DATA = null;
            this._TEXTURE_ANIMATION_DATA = null;
            this._weight = null;
            this._row = null;
            this._col = null;
            this.weightChangeAnimationCode = null;
            this.weightChangeCode = null;
        }
        ;
        setSpriteScale() { }
        ;
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
            this._SLIDE_DATA.slideAmountX = x / steps;
            this._SLIDE_DATA.slideAmountY = y / steps;
            this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
        }
        ;
        slideOf_percent_PrepareFn(x, y, steps) {
            return this.slideOfPrepareFn(x * this.globalConfig.tileFullSize, y * this.globalConfig.tileFullSize, steps);
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
            this._TEXTURE_ANIMATION_DATA.totalSteps = 0;
            this._TEXTURE_ANIMATION_DATA.direction = directionFB.forward;
            this._TEXTURE_ANIMATION_DATA._index = 0;
            this._TEXTURE_ANIMATION_DATA.currentStep = 0;
            return this;
        }
        ;
        setOutside() {
            this.faceValue = 0;
            this._weight = 0;
            this.weightChangeCode = "00";
        }
        ;
        resetWeights() {
            this._weight = 0;
            this.weightChangeCode = "00";
        }
        ;
        set faceValue(v) {
            this._value = v;
            let vaux = v !== null ? v : 0;
            if (this.graphicsType === mainGraphicType.Sprite) {
                this._SPRITE_OBJECT.texture = this._TEXTURES_LIST[vaux];
                this._SPRITE_OBJECT.tint = this.globalConfig.tileBackColor;
                if (v === null) {
                    this._weight = 0;
                    this.weightChangeCode = "00";
                    this.weightChangeAnimationCode = 0;
                }
            }
            else {
                let numberElement = this._GRAPHICS_OBJECT.children[0];
                if (v !== 0 && v !== null) {
                    numberElement.text = `${v}`;
                    numberElement.style.fill = v > 0 ? this.globalConfig.tileNumberColors[vaux] : this.globalConfig.negativeNumberColor;
                    numberElement.style.fontSize = this.globalConfig.fontSize;
                    numberElement.style.strokeThickness = this.globalConfig.strokeThicknessBase;
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
        set row(r) { this._row = r; }
        ;
        set col(c) { this._col = c; }
        ;
        get row() { return this._row; }
        ;
        get col() { return this._col; }
        ;
        positionByRowAndCol() {
            let objectToMove = this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
            let r = this._row;
            let c = this._col;
            let cellSize = this.globalConfig.tileSize;
            let margins = this.globalConfig.margins;
            objectToMove.x = c * cellSize + (2 * c + 1) * margins;
            objectToMove.y = r * cellSize + (2 * r + 1) * margins;
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
        get weight() {
            return this._weight;
        }
        ;
        set weight(w) {
            console.log(`setting W: ${this._weight} --> ${w}   value: ${this._value}  rc: ${this.row}-${this.col}`);
            if (w === null) {
                w = WEIGHTS.zero;
            }
            this.weightChangeCode = `${this._weight}${w}`;
            this._weight = w;
        }
        ;
        setWeight(w) { }
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
        getBackTint() {
            if (this._value > 0) {
                return this.globalConfig.tileNumberBackColors[this._value];
            }
            else if (this._value < 0) {
                return this.globalConfig.negativeNumberColor;
            }
            else {
                return this.globalConfig.tileBackColor;
            }
        }
        ;
        prepareWeightChangeAnimationFn(steps) {
            if (this._value === null || this._value === 0) {
                return false;
            }
            let weightChangeCode = this.weightChangeCode;
            this.weightChangeCode = "00";
            if (weightChangeCode == "00" || weightChangeCode == "11" || weightChangeCode == "22") {
                console.log("NO-WCAC: ", this.row, this.col, this.faceValue, this.weightChangeAnimationCode, this.weightChangeCode);
                return false;
            }
            else if (weightChangeCode == "01") {
                this.prepareAnimateTint(this.getBackTint(), steps);
                this.weightChangeAnimationCode = 1;
            }
            else if (weightChangeCode == "02") {
                this.prepareAnimateTint(this.getBackTint(), steps);
                this.preapreAnimateDouble(steps, directionFB.forward);
                this.weightChangeAnimationCode = 3;
            }
            else if (weightChangeCode == "10") {
                this.prepareAnimateTint(this.globalConfig.tileBackColor, steps);
                this.weightChangeAnimationCode = 1;
            }
            else if (weightChangeCode == "12") {
                this.preapreAnimateDouble(steps, directionFB.forward);
                this.weightChangeAnimationCode = 2;
            }
            else if (weightChangeCode == "20") {
                this.preapreAnimateDouble(steps, directionFB.backward);
                this.prepareAnimateTint(this.globalConfig.tileBackColor, steps);
                this.weightChangeAnimationCode = 3;
            }
            else if (weightChangeCode == "21") {
                this.preapreAnimateDouble(steps, directionFB.backward);
                this.weightChangeAnimationCode = 2;
            }
            console.log("WCAC: ", this.row, this.col, this.faceValue, this.weightChangeAnimationCode, this.weightChangeCode);
            return true;
        }
        ;
        callWeightChangeAnimationStep() {
            let weightChangeAnimationCode = this.weightChangeAnimationCode;
            let res = 0;
            if ((weightChangeAnimationCode & 1) == 1) {
                res = this.animateTintStep();
            }
            if ((weightChangeAnimationCode & 2) == 2) {
                res = this.stepAnimateDouble();
            }
            return res;
        }
        ;
        preapreAnimateDouble(steps, dir) {
            this._TEXTURE_ANIMATION_DATA.totalSteps = steps;
            this._TEXTURE_ANIMATION_DATA.direction = dir;
            this._TEXTURE_ANIMATION_DATA._index = dir === directionFB.forward ? 0 : steps - 1;
            this._TEXTURE_ANIMATION_DATA.currentStep = 0;
            this._TEXTURE_ANIMATION_DATA.texturesList = this._ANIMATION_TEXTURES[steps][this._value];
        }
        ;
        stepAnimateDouble() {
            let _TEXTURE_ANIMATION_DATA = this._TEXTURE_ANIMATION_DATA;
            if (_TEXTURE_ANIMATION_DATA.currentStep == _TEXTURE_ANIMATION_DATA.totalSteps) {
                return _TEXTURE_ANIMATION_DATA.totalSteps;
            }
            this._SPRITE_OBJECT.texture = _TEXTURE_ANIMATION_DATA.texturesList[_TEXTURE_ANIMATION_DATA._index];
            _TEXTURE_ANIMATION_DATA._index += _TEXTURE_ANIMATION_DATA.direction;
            _TEXTURE_ANIMATION_DATA.currentStep++;
            return _TEXTURE_ANIMATION_DATA.currentStep;
        }
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
            this._TINT_ANIMATION_DATA.endTint = tint;
        }
        ;
        animateTintStep() {
            let _TINT_ANIMATION_DATA = this._TINT_ANIMATION_DATA;
            let objectToAnimate = _TINT_ANIMATION_DATA.objectToAnimate;
            if (_TINT_ANIMATION_DATA.currentStep === _TINT_ANIMATION_DATA.totalSteps - 1) {
                console.log("end animation tint", this._value, this._col, this._row);
                objectToAnimate.tint = _TINT_ANIMATION_DATA.endTint;
                return 0;
            }
            _TINT_ANIMATION_DATA.currentStep++;
            let paintTint = (_TINT_ANIMATION_DATA.tintStep_RED << 16) + (_TINT_ANIMATION_DATA.tintStep_GREEN << 8) + _TINT_ANIMATION_DATA.tintStep_BLUE;
            objectToAnimate.tint += paintTint;
            return _TINT_ANIMATION_DATA.currentStep;
        }
        ;
        _resetBorderAndTextGraphics() {
            let _GRAPHICS_OBJECT = this._GRAPHICS_OBJECT;
            this.faceValue = this._value;
            _GRAPHICS_OBJECT.clear();
            _GRAPHICS_OBJECT.beginFill(this.globalConfig.tileBackColor, this.globalConfig.defaultAlpha);
            _GRAPHICS_OBJECT.drawRoundedRect(0, 0, this.globalConfig.tileSize, this.globalConfig.tileSize, this.globalConfig.roundBorderFactor);
            _GRAPHICS_OBJECT.endFill();
        }
        ;
        _prepareAnimateBorderTextGraphics(steps) {
            let _GRAPHICS_OBJECT = this._GRAPHICS_OBJECT;
            let text = _GRAPHICS_OBJECT.children[0];
            let textStyle = text.style;
            let fontSize = textStyle.fontSize;
            let _GRAPHICS_ANIMATE_DATA = this._GRAPHICS_ANIMATE_DATA;
            _GRAPHICS_ANIMATE_DATA.currentStep = 0;
            _GRAPHICS_ANIMATE_DATA.totalSteps = steps;
            _GRAPHICS_ANIMATE_DATA.borderRadiusStep = (this.globalConfig.doubleBorderFactor - this.globalConfig.roundBorderFactor) / steps;
            _GRAPHICS_ANIMATE_DATA.strokeThicknessStep = (this.globalConfig.strokeThicknessDouble - textStyle.strokeThickness) / steps;
            _GRAPHICS_ANIMATE_DATA.textSizeStep = (this.globalConfig.biggerFontSize - fontSize) / steps;
        }
        ;
        _animateBorderTextStep() {
            let _GRAPHICS_ANIMATE_DATA = this._GRAPHICS_ANIMATE_DATA;
            if (_GRAPHICS_ANIMATE_DATA.currentStep === _GRAPHICS_ANIMATE_DATA.totalSteps) {
                return 0;
            }
            let _GRAPHICS_OBJECT = this._GRAPHICS_OBJECT;
            let text = _GRAPHICS_OBJECT.children[0];
            let textStyle = text.style;
            let fontSize = textStyle.fontSize;
            let rad = this._GRAPHICS_OBJECT.radius;
            let h = this.globalConfig.tileSize;
            let w = this.globalConfig.tileSize;
            let alpha = this.globalConfig.defaultAlpha;
            let color = this.globalConfig.tileBackColor;
            _GRAPHICS_ANIMATE_DATA.currentStep++;
            fontSize += _GRAPHICS_ANIMATE_DATA.textSizeStep;
            textStyle.fontSize = fontSize;
            textStyle.strokeThickness += _GRAPHICS_ANIMATE_DATA.strokeThicknessStep;
            _GRAPHICS_ANIMATE_DATA.currentRadius += _GRAPHICS_ANIMATE_DATA.borderRadiusStep;
            _GRAPHICS_OBJECT.clear();
            _GRAPHICS_OBJECT.beginFill(color, alpha);
            _GRAPHICS_OBJECT.drawRoundedRect(0, 0, h, w, _GRAPHICS_ANIMATE_DATA.currentRadius);
            _GRAPHICS_OBJECT.endFill();
            return _GRAPHICS_ANIMATE_DATA.currentStep;
        }
        ;
        static createTileAsGraphics(_CONF, val, forcedSize) {
            let aTile = new PIXI.Graphics();
            aTile.beginFill(_CONF.tileBackColor, _CONF.defaultAlpha);
            aTile.drawRoundedRect(0, 0, forcedSize || _CONF.tileSize, _CONF.tileSize, _CONF.roundBorderFactor);
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

    const SLIDE_LEFT = 1, SLIDE_RIGHT = 0, SLIDE_UP = 2, SLIDE_DOWN = 3;
    const getCanvasSize = (tileSize, torusModel) => {
        console.log(tileSize, torusModel.rows, torusModel.cols);
        return {
            width: tileSize * torusModel.cols,
            height: tileSize * torusModel.rows
        };
    };
    const getTileSize = (containerHeight, containerWidth, torusModel, normalizer) => {
        let fullTileSize = 0;
        if (torusModel.rows > torusModel.cols) {
            fullTileSize = containerHeight / (normalizer * torusModel.rows);
        }
        else {
            fullTileSize = containerWidth / (normalizer * torusModel.cols);
        }
        return fullTileSize;
    };
    const getSegmentSlopeDirection = (Xa, Xb, Ya, Yb) => {
        let deltaX = Xa - Xb;
        let deltaY = Ya - Yb;
        let delta = (Ya - Yb) / (Xa - Xb);
        let absDelta = Math.abs(delta);
        if (absDelta < 1) {
            if (Math.abs(Xa - Xb) < 20) {
                return -1;
            }
            return deltaX > 0 ? SLIDE_LEFT : SLIDE_RIGHT;
        }
        else {
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
    const buildMask = (torusMatrix, pixiMaskObject, conf) => {
        let cellSize = conf.tileSize + 2 * conf.margins;
        pixiMaskObject.beginFill(0xFFFFFF, 1);
        torusMatrix.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell !== null) {
                    pixiMaskObject.drawRect(c * cellSize, r * cellSize, cellSize, cellSize);
                }
            });
        });
        pixiMaskObject.endFill();
    };
    const MAIN_GRAPHICS_CONFIG = {
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
    class TorusViewFactory {
        constructor(torus, canvasContainer, _configuration = Object.assign({}, MAIN_GRAPHICS_CONFIG), playSlideSound = () => { }, publishScore = () => { }) {
            this.torus = torus;
            this.canvasContainer = canvasContainer;
            this._configuration = _configuration;
            this.playSlideSound = playSlideSound;
            this.publishScore = publishScore;
            this.animationTimingEMA = _configuration.animationTiming;
            if (_configuration.tileFullSize === 0) {
                let w = window.innerWidth;
                let h = window.innerHeight;
                if (w > h) {
                    w = _configuration._16_9_MOD * h;
                }
                else {
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
            this.PIXI_APP = new PIXI$1.Application(this.canvasSizes.width, this.canvasSizes.height, {
                antialias: true,
                transparent: true,
                autoResize: true
            });
            this.TILE_TEXTURES_LIST = TEXTURES_GLOBAL.TILE_TEXTURES;
            this.ANIMATION_TEXTURES_LIST = TEXTURES_GLOBAL.ANIMATION_TEXTURES;
            canvasContainer.appendChild(this.PIXI_APP.view);
            const torusContainer = this.torusContainer = new PIXI$1.Container();
            this.PIXI_APP.stage.addChild(torusContainer);
            torusContainer.x = 0;
            torusContainer.y = 0;
            torusContainer.interactiveChildren = false;
            this.PIXI_APP.stage.interactive = true;
            const mainMask = this.mask = new PIXI$1.Graphics();
            mainMask.x = 0;
            mainMask.y = 0;
            const layer = new PIXI$1.Graphics();
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
            this.PIXI_APP.stage.on('pointerdown', this.onDown.bind(this));
            this.PIXI_APP.stage.on('pointerup', this.onUp.bind(this));
            this.PIXI_APP.ticker.stop();
            this.runAnimationVector(this.syncTilesWeights(), "callWeightChangeAnimationStep", _configuration.animationSteps);
        }
        ;
        updateSlidesSteps(time) {
            let config = this._configuration;
            let delta = time - config.animationTiming;
            if (Math.abs(delta) > config.slideChangeThreshold) {
                delta > 0 ? config.animationSteps-- : config.animationSteps++;
            }
            if (config.animationSteps > config.stepsLimit) {
                config.animationSteps = config.stepsLimit;
            }
            else if (config.animationSteps < 3) {
                config.animationSteps = 3;
            }
            console.log(config.animationSteps, delta);
        }
        ;
        onDown(e) {
            this.lastPointerDown.x = e.data.global.x;
            this.lastPointerDown.y = e.data.global.y;
        }
        ;
        onUp(e) {
            let direction = getSegmentSlopeDirection(this.lastPointerDown.x, e.data.global.x, this.lastPointerDown.y, e.data.global.y);
            if (direction === -1) {
                return false;
            }
            if (!this.SEMAPHORES.slide) {
                return false;
            }
            if (direction > 1) {
                let colIdx = getColToSlide(e.data.global.x, this.lastPointerDown.x, this._configuration.tileFullSize);
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
            }
            else {
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
        }
        ;
        syncTilesWeights() {
            let tilesMap = this.tilesMap;
            let torus = this.torus;
            let rows = this.torus.rows;
            let cols = this.torus.cols;
            let animationsList = [];
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
        }
        ;
        prepareTileWeightChange(tile, r, c) {
            let torus = this.torus;
            let w = torus.getValueWeight(r, c);
            tile.weight = w;
            if (tile.prepareWeightChangeAnimationFn(this._configuration.animationSteps)) {
                return true;
            }
            return false;
        }
        ;
        syncColTilesWeights(colIdx) {
            let animationsList = [];
            let torus = this.torus;
            let tilesMap = this.tilesMap;
            let prevCol = colIdx > 0 ? colIdx - 1 : -1;
            let nextCol = colIdx < torus.cols - 1 ? colIdx + 1 : -1;
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
        }
        ;
        syncRowTilesWeights(rowIdx) {
            let animationsList = [];
            let torus = this.torus;
            let tilesMap = this.tilesMap;
            let prevRow = rowIdx > 0 ? rowIdx - 1 : -1;
            let nextRow = rowIdx < torus.rows - 1 ? rowIdx + 1 : -1;
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
        }
        ;
        runAnimationVector(animationVector, stepFunctionName, totalSteps) {
            const self = this;
            return new Promise(function (resolve, reject) {
                let stepsCounter = 0;
                const totalTiles = animationVector.length;
                const _PIXI_APP = self.PIXI_APP;
                let animate = (t) => {
                    if (stepsCounter < totalSteps) {
                        for (let j = 0; j < totalTiles; ++j) {
                            animationVector[j][stepFunctionName]();
                        }
                        stepsCounter++;
                        _PIXI_APP.ticker.update();
                        return requestAnimationFrame(animate);
                    }
                    else {
                        for (let j = 0; j < totalTiles; ++j) {
                            animationVector[j].resetAllAnimationsData();
                        }
                        _PIXI_APP.ticker.update();
                        return resolve(totalSteps);
                    }
                };
                requestAnimationFrame(animate);
            });
        }
        ;
        resize() { }
        ;
        resync() {
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
        }
        ;
        remove() {
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
        }
        ;
        isTileOutBound(tileObj) {
            let ans = tileObj.row <= -1 || tileObj.col <= -1 || tileObj.row >= this.torus.rows || tileObj
                .col >= this.torus.cols;
            return ans;
        }
        ;
        resetTilePosition(tileObj) {
            console.log(`reset tile position called for tile: ${tileObj.faceValue}-r:${tileObj.row}-c:${tileObj.col}`);
            let tileGraphics = tileObj.getObjectToUse();
            let conf = this._configuration;
            let rows = this.torus.rows;
            let cols = this.torus.cols;
            if (tileObj.row == -2) {
                console.log(`row -2  old position: r:${tileObj.row} c:${tileObj.col}`);
                tileObj.row = rows;
                console.log(`new position: r:${tileObj.row} c:${tileObj.col}`);
                tileGraphics.y = rows * conf.tileFullSize + conf.margins;
            }
            else if (tileObj.row > rows) {
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
            }
            else if (tileObj.col > cols) {
                console.log(`col > row old position: r:${tileObj.row} c:${tileObj.col}`);
                tileObj.col = -1;
                tileGraphics.x = -conf.tileFullSize + conf.margins;
                console.log(`new position: r:${tileObj.row} c:${tileObj.col}`);
            }
        }
        ;
        slideRow(rowIdx, direction) {
            this.SEMAPHORES.slide = false;
            console.log("---------------------------------------");
            console.log(`slide row: ${rowIdx} -- ${direction}`);
            let conf = this._configuration;
            let torus = this.torus;
            let moveOf = this._configuration.tileFullSize;
            let moveOfAbs = 1;
            let tilesMap = this.tilesMap;
            let rowToSlide = tilesMap[rowIdx];
            if (direction === SLIDE_LEFT) {
                moveOf = -moveOf;
                moveOfAbs = -1;
                torus.slideRowLeft(rowIdx);
            }
            else {
                torus.slideRowRight(rowIdx);
            }
            torus.valuate();
            this.beforeSlideSetRow(rowIdx, direction);
            let animations = [];
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
        }
        ;
        slideColumn(colIdx, direction) {
            console.log("---------------------------------------");
            console.log(`slide column: ${colIdx} -- ${direction}`);
            this.SEMAPHORES.slide = false;
            let conf = this._configuration;
            let torus = this.torus;
            let moveOf = this._configuration.tileFullSize;
            let moveOfAbs = 1;
            let tilesMap = this.tilesMap;
            if (direction === SLIDE_UP) {
                moveOf = -moveOf;
                moveOfAbs = -1;
                torus.slideColUp(colIdx);
            }
            else {
                torus.slideColDown(colIdx);
            }
            torus.valuate();
            this.beforeSlideSetCol(colIdx, direction);
            let animations = [];
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
        }
        ;
        setMouseGestureReaction() { }
        ;
        getTileSize() { }
        ;
        beforeSlideSetRow(rowIdx, direction) {
            let torus = this.torus;
            let tilesMap = this.tilesMap;
            let conf = this._configuration;
            let cols = torus.cols;
            let rows = torus.rows;
            if (direction === SLIDE_RIGHT) {
                let outSideTile = tilesMap[rowIdx][-1];
                let tempValue = torus.getValueRC(rowIdx, 0);
                if (tempValue !== null) {
                    outSideTile.faceValue = tempValue;
                }
                for (let c = cols - 2; c >= 0; --c) {
                    if (torus.getValueRC(rowIdx, c) === null) {
                        let tmpVal = torus.getValueRC(rowIdx, c + 1);
                        if (tmpVal !== null) {
                            tilesMap[rowIdx][c].faceValue = tmpVal;
                        }
                    }
                }
            }
            else {
                let outSideTile = tilesMap[rowIdx][cols];
                let tempValue = torus.getValueRC(rowIdx, cols - 1);
                if (tempValue !== null) {
                    outSideTile.faceValue = tempValue;
                }
                for (let c = 1; c < cols; ++c) {
                    if (torus.getValueRC(rowIdx, c) === null) {
                        let tmpVal = torus.getValueRC(rowIdx, c - 1);
                        if (tmpVal !== null) {
                            tilesMap[rowIdx][c].faceValue = tmpVal;
                        }
                    }
                }
            }
        }
        ;
        beforeSlideSetCol(colIdx, direction) {
            let torus = this.torus;
            let tilesMap = this.tilesMap;
            let conf = this._configuration;
            let cols = torus.cols;
            let rows = torus.rows;
            if (direction === SLIDE_DOWN) {
                let outSideTile = tilesMap[-1][colIdx];
                let tempValue = torus.getValueRC(0, colIdx);
                if (tempValue !== null) {
                    outSideTile.faceValue = tempValue;
                }
                for (let r = rows - 2; r >= 0; --r) {
                    if (torus.getValueRC(r, colIdx) === null) {
                        let tmpVal = torus.getValueRC(r + 1, colIdx);
                        if (tmpVal !== null) {
                            tilesMap[r][colIdx].faceValue = tmpVal;
                        }
                    }
                }
            }
            else {
                let outSideTile = tilesMap[rows][colIdx];
                let tempValue = torus.getValueRC(rows - 1, colIdx);
                if (tempValue !== null) {
                    outSideTile.faceValue = tempValue;
                }
                for (let r = 1; r < rows; ++r) {
                    if (torus.getValueRC(r, colIdx) === null) {
                        let tmpVal = torus.getValueRC(r - 1, colIdx);
                        if (tmpVal !== null) {
                            tilesMap[r][colIdx].faceValue = tmpVal;
                        }
                    }
                }
            }
        }
        ;
        placeTileInContainer(r, c, val, pixiContainer) {
            let aTile = new PixiTile(this._configuration, this.PIXI_APP, this.TILE_TEXTURES_LIST, this.ANIMATION_TEXTURES_LIST, val);
            pixiContainer.addChild(aTile.getObjectToUse());
            aTile.row = r;
            aTile.col = c;
            aTile.positionByRowAndCol();
            return aTile;
        }
        ;
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
                graphicsTilesMap[r] = {};
                graphicsTilesMap[r][-1] = this.placeTileInContainer(r, -1, 0, pixiContainer);
                row.forEach((cell, c) => {
                    if (r === 0) {
                        graphicsTilesMap[-1][c] = this.placeTileInContainer(-1, c, 0, pixiContainer);
                        graphicsTilesMap[rows][c] = this.placeTileInContainer(rows, c, 0, pixiContainer);
                    }
                    graphicsTilesMap[r][c] = this.placeTileInContainer(r, c, cell, pixiContainer);
                });
                graphicsTilesMap[r][cols] = this.placeTileInContainer(r, cols, 0, pixiContainer);
            });
            console.log("loggin tiles maep: ", this.tilesMap);
        }
        ;
        static buildAnimationTexturesList(_PIXI_APP, _main_graphics_config) {
            const ANIMATION_TEXTURES_LIST = {
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
            let auxTilesList = {};
            let TILE_TEXTURES_LIST = [];
            for (let i = -9; i < 10; ++i) {
                if (i == 0) {
                    continue;
                }
                auxTilesList[i] = new PixiTile(_main_graphics_config, _PIXI_APP, TILE_TEXTURES_LIST, ANIMATION_TEXTURES_LIST, i);
                auxTilesList[i].setGraphicsMode();
                let tmpTile = auxTilesList[i];
                ANIMATION_TEXTURES_LIST["12"][i] = [];
                tmpTile._prepareAnimateBorderTextGraphics(12);
                for (let j = 0; j < 12; ++j) {
                    tmpTile._animateBorderTextStep();
                    let tmpTexture = tmpTile.getGraphics().generateCanvasTexture();
                    ANIMATION_TEXTURES_LIST["12"][i].push(tmpTexture);
                }
                ANIMATION_TEXTURES_LIST["11"][i] = [];
                for (let j = 0; j < 11; ++j) {
                    ANIMATION_TEXTURES_LIST["11"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j + 1]);
                }
                ANIMATION_TEXTURES_LIST["10"][i] = [];
                for (let j = 0; j < 10; ++j) {
                    let t = j < 9 ? j + 1 : j + 2;
                    ANIMATION_TEXTURES_LIST["10"][i].push(ANIMATION_TEXTURES_LIST["12"][i][t]);
                }
                ANIMATION_TEXTURES_LIST["9"][i] = [];
                for (let j = 0; j < 9; ++j) {
                    ANIMATION_TEXTURES_LIST["9"][i].push(ANIMATION_TEXTURES_LIST["10"][i][j + 1]);
                }
                ANIMATION_TEXTURES_LIST["8"][i] = [];
                for (let j = 0; j < 8; ++j) {
                    ANIMATION_TEXTURES_LIST["8"][i].push(ANIMATION_TEXTURES_LIST["9"][i][j + 1]);
                }
                ANIMATION_TEXTURES_LIST["7"][i] = [];
                for (let j = 0; j < 12; j++) {
                    if (j > 1) {
                        j++;
                    }
                    ANIMATION_TEXTURES_LIST["7"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j]);
                }
                ANIMATION_TEXTURES_LIST["6"][i] = [];
                for (let j = 0; j < 12; j += 2) {
                    ANIMATION_TEXTURES_LIST["6"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j]);
                }
                ANIMATION_TEXTURES_LIST["5"][i] = [];
                for (let j = 0; j < 10; j += 2) {
                    ANIMATION_TEXTURES_LIST["5"][i].push(ANIMATION_TEXTURES_LIST["10"][i][j]);
                }
                ANIMATION_TEXTURES_LIST["4"][i] = [];
                for (let j = 0; j < 12; j += 3) {
                    ANIMATION_TEXTURES_LIST["4"][i].push(ANIMATION_TEXTURES_LIST["12"][i][j]);
                }
            }
            return ANIMATION_TEXTURES_LIST;
        }
        ;
        static buildTilesTexturesList(renderer, _main_graphics_config) {
            let TILE_TEXTURES_LIST = [];
            for (let i = -9; i < 10; ++i) {
                let tempTile = PixiTile.createTileAsGraphics(_main_graphics_config, i);
                TILE_TEXTURES_LIST[i] = tempTile.generateCanvasTexture();
            }
            return TILE_TEXTURES_LIST;
        }
        ;
        static setMainGraphicsConfig(tileFullSize, mainConfig) {
            mainConfig.tileSize = tileFullSize;
            mainConfig.tileFullSize = tileFullSize;
            mainConfig.margins = Math.ceil(tileFullSize * mainConfig.marginPercent);
            mainConfig.tileSize = tileFullSize - 2 * mainConfig.margins;
            mainConfig.fontSize = Math.round((tileFullSize - 2 * mainConfig.margins) * mainConfig.fontSizePercent);
            mainConfig.biggerFontSize = Math.round((tileFullSize - 2 * mainConfig.margins) * mainConfig.doubleFontSizePercent);
            mainConfig.strokeThicknessDouble = mainConfig.margins * 2.5;
            mainConfig.roundBorderFactor = Math.ceil(tileFullSize * mainConfig.borderPercent);
            mainConfig.doubleBorderFactor = Math.ceil(tileFullSize * mainConfig.doubleBorderPercent);
        }
        ;
    }
    console.time("textures");
    (() => {
        let PIXI_APP = new PIXI$1.Application(1000, 1000, {
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

    exports.MAIN_GRAPHICS_CONFIG = MAIN_GRAPHICS_CONFIG;
    exports.TorusViewFactory = TorusViewFactory;

    return exports;

}({},PIXI));
//# sourceMappingURL=TorusViewBundle.js.map
