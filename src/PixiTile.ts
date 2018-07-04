import { slideData } from "./interfaces";
import { tintAnimationData } from "./interfaces";
import { graphicsConfiguration } from "./interfaces";
import { Graphics } from "pixi.js";
import { GlowFilter } from "pixi-filters";

// @ts-ignore
//const __filters = window.__filters;

enum mainGraphicType { Graphics, Sprite };
const startGlowFilterValues: number[] = [0, 0, 0, 0xFFFFFF, 0.1];

class PixiTile {
    private _GRAPHICS_OBJECT: PIXI.Graphics;
    private _SPRITE_OBJECT: PIXI.Sprite;
    private _SLIDE_DATA: slideData;
    private _TINT_ANIMATION_DATA: tintAnimationData;
    private graphicsType: mainGraphicType;
    private doubleValueFilter: GlowFilter;
    /**integer coordinates relative to rowsXcols grid size  --> independent of canvas size */
    private absX: number;
    private absY: number;
    constructor(private globalConfig: any, private APP: PIXI.Application, private _TEXTURES_LIST: PIXI.Texture[], private _value: number | string = 0) {

        this._TINT_ANIMATION_DATA = { currentStep: 0, totalSteps: 0, tintStep: 0 };
        this.graphicsType = mainGraphicType.Graphics;
        this._GRAPHICS_OBJECT = PixiTile.createTileAsGraphics(globalConfig, _value);
        this._SPRITE_OBJECT = new PIXI.Sprite(_TEXTURES_LIST[_value as number]);
        this._SLIDE_DATA = { currentStep: 0, slideAmountX: 0, slideAmountY: 0, totalSteps: 0, objectToMove: this._GRAPHICS_OBJECT };
        this.doubleValueFilter = new GlowFilter();
        // this._SPRITE_OBJECT.filters = [this.doubleValueFilter];

    }
    setSpriteMode(): void {
        this.graphicsType = mainGraphicType.Sprite;
        this._SLIDE_DATA.objectToMove = this._SPRITE_OBJECT;
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
    set faceValue(v: number | string) {
        /**depending on graphicsType change one of the two */
        this._value = v;
        if (this.graphicsType === mainGraphicType.Sprite) {
            this._SPRITE_OBJECT.texture = this._TEXTURES_LIST[this._value as number];
        } else {

            let numberElement = this._GRAPHICS_OBJECT.children[0] as PIXI.Text;

            if (v !== 0) {
                numberElement.text = `${v}`;
                numberElement.style.fill = v > 0 ? this.globalConfig.tileNumberColors[v] : this.globalConfig.negativeNumberColor;
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
    getGraphics(): PIXI.Graphics {
        return this._GRAPHICS_OBJECT;
    };
    getSprite(): PIXI.Sprite {
        return this._SPRITE_OBJECT;
    };
    getObjectToUse(): PIXI.Sprite | PIXI.Graphics {
        return this.graphicsType === mainGraphicType.Graphics ? this._GRAPHICS_OBJECT : this._SPRITE_OBJECT;
    };
    setGraphicsFaceValue() { };
    setSpriteFaceValue() { };
    prepareAnimateTint(tint: number, steps: number): void { };
    animateTintStep(): number {
        return 0;
    };
    static createTileAsGraphics(_CONF: graphicsConfiguration, val: number | string | null) {

        let aTile: PIXI.Graphics = new PIXI.Graphics();

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