import { TorusViewFactory } from "./TorusViewBundle";
declare var gridModel: any;
const canvasContainer = document.getElementById("game-play");

const torusModel = gridModel.GridFactory("44440n406066n60n0606550n550n5nnnn10n11n12n2n2n2n0r7c7");
torusModel.setHistoryOn();
torusModel.valuate();

let TWF = new TorusViewFactory(torusModel, canvasContainer);

//@ts-ignore
window.TWF = TWF;


/*setTimeout(() => {
let animations = TWF.syncTilesWeights();
console.log(animations);
TWF.runAnimationVector(animations, "callWeightChangeAnimationStep", 12).then(res => console.log(res));
}, 1000); */
