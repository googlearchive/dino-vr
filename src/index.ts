/*
  Copyright 2017 Google Inc. All Rights Reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import getRunner from './Runner';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

getRunner().then((runner) => {
  console.log(runner);
});

// import {canvas} from './display';
// import Cloud from './Cloud';
// import DistanceMeter from './DistanceMeter';
// import GameOverPanel from './GameOverPanel';
// import Geometry from './Geometry';
// import Model from './Model';
// import Renderer from './Renderer';
// import Texture from './Texture';
// import Trex from './Trex';

// import {ribbon, quad} from './geometries';

// const spriteMap = document.getElementById('sprites') as HTMLImageElement;
// const spriteTexture = new Texture(spriteMap);

// const gameOver = new GameOverPanel(spriteTexture);
// gameOver.position[2] = -4;
// gameOver.position[1] = 1.6;

// const distanceMeter = new DistanceMeter(spriteMap, 655, 2);
// distanceMeter.position[2] = -4.3;
// distanceMeter.position[1] = 1.6;

// const floorCanvas = document.createElement('canvas');
// const floorCtx = floorCanvas.getContext('2d');
// if (floorCtx) {
//   const floorGradient = floorCtx.createLinearGradient(0, 0, floorCanvas.width, 0);
//   floorGradient.addColorStop(0, 'yellow');
//   floorGradient.addColorStop(0.5, 'red');
//   floorGradient.addColorStop(1, 'yellow');
//   floorCtx.fillStyle = floorGradient;
//   floorCtx.fillRect(0, 0, floorCanvas.width, floorCanvas.height);
// }
// const floorTexture = new Texture(floorCanvas);
// const horizon = new Model(ribbon, floorTexture);
// horizon.position[1] = 0;

// const trex = new Trex(spriteTexture);
// trex.position[2] = -10;

// const models: Model[] = [];
// const clouds: Cloud[] = [];

// for (let i = 0; i < 10; i++) {
//   const cloud = new Cloud(spriteTexture);
//   cloud.position[2] = -15;
//   cloud.position[1] = Math.random() * 2 + 2
//   cloud.euler[1] = 2 * Math.PI * Math.random();
//   models.push(cloud);
//   clouds.push(cloud);
// }

// models.push(horizon);
// models.push(trex);
// models.push(distanceMeter);
// models.push(gameOver);

// let frameNumber = 0;

// const renderer = new Renderer();

// function main() {
//   renderer.requestAnimationFrame(main);

//   frameNumber++;
//   // TODO: proper frame timing
//   const elapsed = 1000 / 60;

//   distanceMeter.update(elapsed, frameNumber * 5);
//   for (const cloud of clouds) {
//     cloud.update(0.001);
//   }
//   trex.update(elapsed);
//   if (trex.jumping) {
//     trex.updateJump(elapsed);
//   }
//   horizon.euler[1] += 0.002;
//   horizon.needsUpdate = true;

//   renderer.render(models);
// }

// canvas.addEventListener('click', () => renderer.requestVR());

// main();
