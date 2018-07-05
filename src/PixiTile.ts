import { slideData, doubleGraphicsAnimation, textureBasedAnimationData, directionFB } from "./interfaces";
import { tintAnimationData } from "./interfaces";
import { graphicsConfiguration } from "./interfaces";
import { Graphics, GraphicsData } from "pixi.js";
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
    private graphicsType: mainGraphicType;
    private doubleValueFilter: GlowFilter;
    /**integer coordinates relative to rowsXcols grid size  --> independent of canvas size */
    private absX: number;
    private absY: number;
    constructor(private globalConfig: graphicsConfiguration, private APP: PIXI.Application, private _TEXTURES_LIST: PIXI.Texture[], private _ANIMATION_TEXTURES: Object, private _value: number | string = 0) {

        this.graphicsType = mainGraphicType.Sprite;
        this._GRAPHICS_OBJECT = PixiTile.createTileAsGraphics(globalConfig, _value);
        this._SPRITE_OBJECT = new PIXI.Sprite(_TEXTURES_LIST[_value as number]);
        this._SLIDE_DATA = { currentStep: 0, slideAmountX: 0, slideAmountY: 0, totalSteps: 0, objectToMove: this._SPRITE_OBJECT };
        this._TINT_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, tintStep_RED: 0, tintStep_BLUE: 0, tintStep_GREEN: 0, objectToAnimate: this._SPRITE_OBJECT };
        this._GRAPHICS_ANIMATE_DATA = { currentStep: 0, totalSteps: 0, textSizeStep: 0, strokeThicknessStep: 0, borderRadiusStep: 0, currentRadius: globalConfig.roundBorderFactor };
        this._TEXTURE_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, texturesList: [], direction: directionFB.forward, _index: 0 };
        //this.doubleValueFilter = new GlowFilter();
        // this._SPRITE_OBJECT.filters = [this.doubleValueFilter];

    }
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
        this._SLIDE_DATA.slideAmountX = x / this.globalConfig.tileFullSize;
        this._SLIDE_DATA.slideAmountY = y / this.globalConfig.tileFullSize;
        this._SLIDE_DATA.objectToMove = this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
        /**calculate steps amount for X and Y */
    };
    slideOf_percent_PrepareFn(x: number, y: number, steps: number): void {
        /**call slideOfPrepare */
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
    set faceValue(v: number | string) {
        /**depending on graphicsType change one of the two */
        this._value = v;
        if (this.graphicsType === mainGraphicType.Sprite) {
            this._SPRITE_OBJECT.texture = this._TEXTURES_LIST[this._value as number];
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
    set X(x: number) {
        this.absX = x;
    };
    set Y(y: number) {
        this.absY = y;
    };
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
    preapreAnimateDouble(steps: number, dir: directionFB): void {
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

    };
    animateTintStep(): number {

        let _TINT_ANIMATION_DATA = this._TINT_ANIMATION_DATA;
        if (_TINT_ANIMATION_DATA.currentStep === _TINT_ANIMATION_DATA.totalSteps) {
            //resetHere?
            return 0;
        }
        _TINT_ANIMATION_DATA.currentStep++;
        let objectToAnimate = _TINT_ANIMATION_DATA.objectToAnimate;

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

    static createTileAsGraphics(_CONF: graphicsConfiguration, val: number | string | null) {

        let aTile: PIXI.RoundedRectangle | PIXI.Graphics = new PIXI.Graphics();

        aTile.beginFill(_CONF.tileBackColor, _CONF.defaultAlpha);

        aTile.drawRoundedRect(0, 0, _CONF.tileSize, _CONF.tileSize, _CONF.roundBorderFactor);
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