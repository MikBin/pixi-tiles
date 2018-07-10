import { slideData, doubleGraphicsAnimation, textureBasedAnimationData, directionFB } from "./interfaces";
import { tintAnimationData, WEIGHTS } from "./interfaces";
import { graphicsConfiguration } from "./interfaces";
import { Graphics, GraphicsData, Point } from "pixi.js";
import { GlowFilter } from "pixi-filters";

// @ts-ignore
//const __filters = window.__filters;

enum mainGraphicType { Graphics, Sprite };
const startGlowFilterValues: number[] = [0, 0, 0, 0xFFFFFF, 0.1];

class PixiTile {
    private _GRAPHICS_OBJECT: PIXI.RoundedRectangle | PIXI.Graphics;
    private _SPRITE_OBJECT: PIXI.Sprite;
    private _SLIDE_DATA: slideData;
    private _GRAPHICS_ANIMATE_DATA: doubleGraphicsAnimation;
    private _TINT_ANIMATION_DATA: tintAnimationData;
    private _TEXTURE_ANIMATION_DATA: textureBasedAnimationData;
    private _WEIGHT_CHANGE_ANIMATION_FN: Function;
    private graphicsType: mainGraphicType;
    private doubleValueFilter: GlowFilter;
    /**integer coordinates relative to rowsXcols grid size  --> independent of canvas size */
    private absX: number;
    private absY: number;
    private _weight: WEIGHTS;
    private _row: number;
    private _col: number;
    private weightChangeCode: string;
    private weightChangeAnimationCode: number;
    private scaleFactor: number;

    constructor(private globalConfig: graphicsConfiguration, private APP: PIXI.Application, private _TEXTURES_LIST: PIXI.Texture[], private _ANIMATION_TEXTURES: Object, private _value: number | string = 0, forceSprite: boolean = false) {

        this.graphicsType = mainGraphicType.Sprite;
        if (!forceSprite) {
            this._GRAPHICS_OBJECT = PixiTile.createTileAsGraphics(globalConfig, _value);
        }
        this.scaleFactor = globalConfig.tileFullSize / globalConfig.sourceTileTextureSize;
        this._SPRITE_OBJECT = new PIXI.Sprite(_TEXTURES_LIST[_value as number]);
        this._SPRITE_OBJECT.scale = { x: this.scaleFactor, y: this.scaleFactor } as Point;
        this._SLIDE_DATA = { currentStep: 0, slideAmountX: 0, slideAmountY: 0, totalSteps: 0, objectToMove: this._SPRITE_OBJECT };
        this._TINT_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, tintStep_RED: 0, tintStep_BLUE: 0, tintStep_GREEN: 0, endTint: 0, objectToAnimate: this._SPRITE_OBJECT };
        this._GRAPHICS_ANIMATE_DATA = { currentStep: 0, totalSteps: 0, textSizeStep: 0, strokeThicknessStep: 0, borderRadiusStep: 0, currentRadius: globalConfig.roundBorderFactor };
        this._TEXTURE_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, texturesList: [], direction: directionFB.forward, _index: 0 };
        this._weight = WEIGHTS.zero;
        this._row = 0;
        this._col = 0;
        this.weightChangeAnimationCode = 0;
        this.weightChangeCode = "00";
        this._WEIGHT_CHANGE_ANIMATION_FN = () => { };

        //this.doubleValueFilter = new GlowFilter();
        // this._SPRITE_OBJECT.filters = [this.doubleValueFilter];

    }
    setSpriteScale() { };
    setSpriteMode(): void {
        this.graphicsType = mainGraphicType.Sprite;
        this._SLIDE_DATA.objectToMove = this._SPRITE_OBJECT;
    };
    setGraphicsMode(): void {
        this.graphicsType = mainGraphicType.Graphics;
        this._SLIDE_DATA.objectToMove = this._GRAPHICS_OBJECT;
    };
    createGraphics(): PixiTile {
        this._GRAPHICS_OBJECT = PixiTile.createTileAsGraphics(this.globalConfig, this._value);
        return this;
    };
    moveTo(x: number, y: number): void {
        let objectToMove = this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
        objectToMove.x = x;
        objectToMove.y = y;
    };
    prepareFilterAnimation() { };
    resetFilterAnimation() { };
    slideOfPrepareFn(x: number, y: number, steps: number): void {
        this._SLIDE_DATA.currentStep = 0;
        this._SLIDE_DATA.totalSteps = steps;
        this._SLIDE_DATA.slideAmountX = x / steps; /// this.globalConfig.tileFullSize;
        this._SLIDE_DATA.slideAmountY = y / steps; /// this.globalConfig.tileFullSize;
        this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;

    };
    slideOf_percent_PrepareFn(x: number, y: number, steps: number): void {
        /**call slideOfPrepare */
        return this.slideOfPrepareFn(x * this.globalConfig.tileFullSize, y * this.globalConfig.tileFullSize, steps);
    };
    slideToPrepareFn(x: number, y: number, steps: number): void {
        /**call slideOfPrepare */
    };
    slideStep(): number {
        let _SLIDE_DATA = this._SLIDE_DATA;
        if (_SLIDE_DATA.currentStep === _SLIDE_DATA.totalSteps) {
            //resetHere?
            return 0;
        }
        _SLIDE_DATA.currentStep++;
        let objectToMove = _SLIDE_DATA.objectToMove;
        objectToMove.x += _SLIDE_DATA.slideAmountX;
        objectToMove.y += _SLIDE_DATA.slideAmountY;
        return _SLIDE_DATA.currentStep;
    };
    resetSlideData(): PixiTile {
        this._SLIDE_DATA.currentStep = 0;
        this._SLIDE_DATA.totalSteps = 0;
        this._SLIDE_DATA.slideAmountX = 0;
        this._SLIDE_DATA.slideAmountY = 0;
        return this;
    };
    resetAllAnimationsData(): PixiTile {
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

        //TODO reset texture ones
        return this;
    };
    setOutside(): void {
        this.faceValue = 0;
        this._weight = 0;
        this.weightChangeCode = "00";
    };
    set faceValue(v: number | string) {
        /**depending on graphicsType change one of the two */
        this._value = v;
        if (this.graphicsType === mainGraphicType.Sprite) {
            this._SPRITE_OBJECT.texture = this._TEXTURES_LIST[this._value as number];
            /**tint to be reset too */
            this._SPRITE_OBJECT.tint = this.globalConfig.tileBackColor;
        } else {

            let numberElement = (<PIXI.Graphics>this._GRAPHICS_OBJECT).children[0] as PIXI.Text;

            if (v !== 0) {
                numberElement.text = `${v}`;
                numberElement.style.fill = v > 0 ? this.globalConfig.tileNumberColors[v] : this.globalConfig.negativeNumberColor;
                numberElement.style.fontSize = this.globalConfig.fontSize;
                numberElement.style.strokeThickness = this.globalConfig.strokeThicknessBase;
            } else {
                numberElement.text = '';
            }

        }
    };
    get faceValue(): number | string {
        return this._value;
    };
    set row(r: number) { this._row = r; };
    set col(c: number) { this._col = c; };
    get row() { return this._row; };
    get col() { return this._col; };
    positionByRowAndCol(): void {
        let objectToMove = this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
        let r = this._row;
        let c = this._col;
        let cellSize = this.globalConfig.tileSize;
        let margins = this.globalConfig.margins;
        objectToMove.x = c * cellSize + (2 * c + 1) * margins;
        objectToMove.y = r * cellSize + (2 * r + 1) * margins;
    };
    set X(x: number) {
        this.absX = x;

    };
    set Y(y: number) {
        this.absY = y;
    };
    get weight() {
        return this._weight;
    };
    set weight(w: WEIGHTS) {
        //console.log(`setting W: ${this._weight} --> ${w}   value: ${this._value}  rc: ${this.row}-${this.col}`);
        if (w === null) {
            w = WEIGHTS.zero;
        }
        this.weightChangeCode = `${this._weight}${w}`;//reset to zero when animation is done
        this._weight = w;
    };
    setWeight(w: WEIGHTS) { };
    getGraphics(): PIXI.Sprite | PIXI.Graphics | PIXI.RoundedRectangle {
        return this._GRAPHICS_OBJECT;
    };
    getSprite(): PIXI.Sprite {
        return this._SPRITE_OBJECT;
    };
    getObjectToUse(): PIXI.Sprite | PIXI.Graphics | PIXI.RoundedRectangle {
        return this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
    };
    setGraphicsFaceValue() { };
    setSpriteFaceValue() { };
    getBackTint(): number {
        if (this._value > 0) {
            return this.globalConfig.tileNumberBackColors[this._value];
        } else if (this._value < 0) {
            return this.globalConfig.negativeNumberColor;
        } else {
            return this.globalConfig.tileBackColor;
        }
    };
    prepareWeightChangeAnimationFn(steps: number): boolean {
        if (this._value === null) {
            return false;
        }
        let weightChangeCode = this.weightChangeCode;
        this.weightChangeCode = "00";
        if (weightChangeCode == "00" || weightChangeCode == "11" || weightChangeCode == "22") {
            //console.log("NO-WCAC: ", this.row, this.col, this.faceValue, this.weightChangeAnimationCode, this.weightChangeCode);
            return false;
        } else if (weightChangeCode == "01") {
            this.prepareAnimateTint(this.getBackTint(), steps);
            this.weightChangeAnimationCode = 1;
        } else if (weightChangeCode == "02") {
            this.prepareAnimateTint(this.getBackTint(), steps);
            this.preapreAnimateDouble(steps, directionFB.forward);
            this.weightChangeAnimationCode = 3;

        } else if (weightChangeCode == "10") {
            this.prepareAnimateTint(this.globalConfig.tileBackColor, steps);
            this.weightChangeAnimationCode = 1;
        } else if (weightChangeCode == "12") {
            this.preapreAnimateDouble(steps, directionFB.forward);
            this.weightChangeAnimationCode = 2;
        } else if (weightChangeCode == "20") {
            this.preapreAnimateDouble(steps, directionFB.backward);
            this.prepareAnimateTint(this.globalConfig.tileBackColor, steps);
            this.weightChangeAnimationCode = 3;
        } else if (weightChangeCode == "21") {
            this.preapreAnimateDouble(steps, directionFB.backward);
            this.weightChangeAnimationCode = 2;
        }
        //console.log("WCAC: ", this.row, this.col, this.faceValue, this.weightChangeAnimationCode, this.weightChangeCode);
        return true;
    };
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

    };
    preapreAnimateDouble(steps: number, dir: directionFB): void {
        // console.log(this._value, this.faceValue, this.col, this.row, this._ANIMATION_TEXTURES[steps][this._value]);
        this._TEXTURE_ANIMATION_DATA.totalSteps = steps;
        this._TEXTURE_ANIMATION_DATA.direction = dir;
        this._TEXTURE_ANIMATION_DATA._index = dir === directionFB.forward ? 0 : steps - 1;
        this._TEXTURE_ANIMATION_DATA.currentStep = 0;
        this._TEXTURE_ANIMATION_DATA.texturesList = this._ANIMATION_TEXTURES[steps][this._value];


    };
    stepAnimateDouble(): number {

        let _TEXTURE_ANIMATION_DATA = this._TEXTURE_ANIMATION_DATA;
        if (_TEXTURE_ANIMATION_DATA.currentStep == _TEXTURE_ANIMATION_DATA.totalSteps) {
            return _TEXTURE_ANIMATION_DATA.totalSteps;
        }

        this._SPRITE_OBJECT.texture = _TEXTURE_ANIMATION_DATA.texturesList[_TEXTURE_ANIMATION_DATA._index];

        _TEXTURE_ANIMATION_DATA._index += _TEXTURE_ANIMATION_DATA.direction;
        _TEXTURE_ANIMATION_DATA.currentStep++;
        return _TEXTURE_ANIMATION_DATA.currentStep;
    };
    prepareAnimateTint(tint: number, steps: number): void {

        let graphicsData = this._TINT_ANIMATION_DATA.objectToAnimate = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
        this._TINT_ANIMATION_DATA.currentStep = 0;
        this._TINT_ANIMATION_DATA.totalSteps = steps;
        let fillColor: number = (<PIXI.Graphics>graphicsData).tint;
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
    };
    animateTintStep(): number {

        let _TINT_ANIMATION_DATA = this._TINT_ANIMATION_DATA;
        let objectToAnimate = _TINT_ANIMATION_DATA.objectToAnimate;
        if (_TINT_ANIMATION_DATA.currentStep === _TINT_ANIMATION_DATA.totalSteps - 1) {
            // console.log("end animation tint", this._value, this._col, this._row);
            (<PIXI.Graphics>objectToAnimate).tint = _TINT_ANIMATION_DATA.endTint;
            return 0;
        }
        _TINT_ANIMATION_DATA.currentStep++;


        let paintTint: number =
            (_TINT_ANIMATION_DATA.tintStep_RED << 16) + (_TINT_ANIMATION_DATA.tintStep_GREEN << 8) + _TINT_ANIMATION_DATA.tintStep_BLUE;

        (<PIXI.Graphics>objectToAnimate).tint += paintTint;

        return _TINT_ANIMATION_DATA.currentStep;
    };
    _resetBorderAndTextGraphics() {
        /**graphics mode only */
        let _GRAPHICS_OBJECT = this._GRAPHICS_OBJECT as PIXI.Graphics;
        this.faceValue = this._value;
        _GRAPHICS_OBJECT.clear();
        _GRAPHICS_OBJECT.beginFill(this.globalConfig.tileBackColor, this.globalConfig.defaultAlpha);
        _GRAPHICS_OBJECT.drawRoundedRect(0, 0, this.globalConfig.tileSize, this.globalConfig.tileSize, this.globalConfig.roundBorderFactor);
        _GRAPHICS_OBJECT.endFill();
    };
    _prepareAnimateBorderTextGraphics(steps: number): void {
        /**used for prerendering textures only */
        let _GRAPHICS_OBJECT = this._GRAPHICS_OBJECT;
        let text: PIXI.Text = (<PIXI.Graphics>_GRAPHICS_OBJECT).children[0] as PIXI.Text;
        let textStyle: PIXI.TextStyle = text.style;
        let fontSize: number | string = textStyle.fontSize as number;
        let _GRAPHICS_ANIMATE_DATA = this._GRAPHICS_ANIMATE_DATA;
        _GRAPHICS_ANIMATE_DATA.currentStep = 0;
        _GRAPHICS_ANIMATE_DATA.totalSteps = steps;
        _GRAPHICS_ANIMATE_DATA.borderRadiusStep = (this.globalConfig.doubleBorderFactor - this.globalConfig.roundBorderFactor) / steps;
        _GRAPHICS_ANIMATE_DATA.strokeThicknessStep = (this.globalConfig.strokeThicknessDouble - textStyle.strokeThickness) / steps;
        _GRAPHICS_ANIMATE_DATA.textSizeStep = (this.globalConfig.biggerFontSize - fontSize) / steps;
    };
    _animateBorderTextStep(): number {
        /**used for prerendering textures only */
        let _GRAPHICS_ANIMATE_DATA = this._GRAPHICS_ANIMATE_DATA;
        if (_GRAPHICS_ANIMATE_DATA.currentStep === _GRAPHICS_ANIMATE_DATA.totalSteps) {
            return 0;
        }
        let _GRAPHICS_OBJECT = this._GRAPHICS_OBJECT as PIXI.Graphics;
        let text: PIXI.Text = (<PIXI.Graphics>_GRAPHICS_OBJECT).children[0] as PIXI.Text;
        let textStyle: PIXI.TextStyle = text.style;
        let fontSize: number | string = textStyle.fontSize as number;
        let rad = (<PIXI.RoundedRectangle>this._GRAPHICS_OBJECT).radius;
        let h: number = this.globalConfig.tileSize;
        let w: number = this.globalConfig.tileSize;
        let alpha: number = this.globalConfig.defaultAlpha;
        let color: number = this.globalConfig.tileBackColor;
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
    };


    static createTileAsGraphics(_CONF: graphicsConfiguration, val: number | string | null, forcedSize?: number) {

        let aTile: PIXI.RoundedRectangle | PIXI.Graphics = new PIXI.Graphics();

        aTile.beginFill(_CONF.tileBackColor, _CONF.defaultAlpha);

        aTile.drawRoundedRect(0, 0, forcedSize || _CONF.tileSize, _CONF.tileSize, _CONF.roundBorderFactor);
        aTile.endFill();
        aTile.interactiveChildren = false;

        if (val !== 0 && val !== null) {
            let cellNumber: number | string | null = '';
            cellNumber = val;
            let textColor: number = cellNumber > 0 ? _CONF.tileNumberColors[cellNumber as number] : _CONF.negativeNumberColor;


            let number: PIXI.Text = new PIXI.Text(`${cellNumber}`, {
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
    };
}


export { PixiTile };