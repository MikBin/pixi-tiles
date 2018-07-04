# PixiTiles 

This is a class to test performance of moving and animating tiles in pixijs.
At time of writing performance of moving hundrests of sprites is tested against moving same amount of graphics Object
Rounded Rectangles with numbers(text)
The results in chrome DevTools shows a huge improvement in using Sprites with rectangles cached as textures
Increasing the number of elements slightly affects the animation in case of Sprites Mode.
/screenshots contains screenshots of chrome DevTools showing above results
### Tech
tech used
* [PixiJs] 
* [Typescript] 
* [Rollup] 


### Installation
clone repo then:

```sh
$ npm install 
$ npm run build
```


