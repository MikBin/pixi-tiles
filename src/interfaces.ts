export interface animationData {
    totalSteps: number;
    currentStep: number;
};
export interface slideData extends animationData {
    slideAmountX: number;
    slideAmountY: number;
    objectToMove: PIXI.Sprite | PIXI.Graphics;
};

export interface tintAnimationData extends animationData {
    tintStep_RED: number;
    tintStep_GREEN: number;
    tintStep_BLUE: number;
    objectToAnimate: PIXI.Sprite | PIXI.Graphics;
};

export interface graphicsConfiguration {
    marginPercent: number;
    fontSizePercent: number;
    doubleFontSizePercent: number;
    borderPercent: number;
    doubleBorderPercent: number;
    _16_9_MOD: number;
    containerHeightModifier: number;
    sizeNormalizer: number;
    rows: number;
    cols: number;
    tileSize: number;
    tileFullSize: number;
    fontSize: number;
    biggerFontSize: number;
    tileBackColor: number;
    defaultAlpha: number;
    strokeThicknessBase: number;
    strokeThicknessDouble: number;
    roundBorderFactor: number;
    doubleBorderFactor: number;
    tileNumberColors: number[];
    tileNumberBackColors: number[];
    negativeNumberColor: number;
    negativeBackNumberColor: number;
    animationSteps: number;
    stepsFor_60_FPS: number;
    stepsLimit: number;
    margins: number;
    animationTiming: number;
    slideChangeThreshold: number;

}