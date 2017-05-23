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

export default class CollisionBox {
  x: number
  y: number
  width: number
  height: number

  /**
   * Collision box object.
   */
  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  clone() {
    return new CollisionBox(this.x, this.y, this.width, this.height);
  }
}



// /**
//  * Check for a collision.
//  * @param {!Obstacle} obstacle
//  * @param {!Trex} tRex T-rex object.
//  * @param {!CanvasRenderingContext2D=} opt_canvasCtx Optional canvas context for
//  *    drawing collision boxes.
//  * @return {boolean}
//  */
// function checkForCollision(obstacle, tRex, opt_canvasCtx) {
//   // Adjustments are made to the bounding box as there is a 1 pixel white
//   // border around the t-rex and obstacles.
//   var tRexBox = new CollisionBox(
//       tRex.xPos + 1,
//       tRex.yPos + 1,
//       tRex.config.WIDTH - 2,
//       tRex.config.HEIGHT - 2);

//   var obstacleBox = new CollisionBox(
//       obstacle.xPos + 1,
//       obstacle.yPos + 1,
//       obstacle.typeConfig.width * obstacle.size - 2,
//       obstacle.typeConfig.height - 2);

//   // Debug outer box
//   if (opt_canvasCtx) {
//     drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
//   }

//   // Simple outer bounds check.
//   if (boxCompare(tRexBox, obstacleBox)) {
//     var collisionBoxes = obstacle.collisionBoxes;
//     var tRexCollisionBoxes = tRex.ducking ?
//         Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;

//     // Detailed axis aligned box check.
//     for (var t = 0; t < tRexCollisionBoxes.length; t++) {
//       for (var i = 0; i < collisionBoxes.length; i++) {
//         // Adjust the box to actual positions.
//         var adjTrexBox =
//             createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
//         var adjObstacleBox =
//             createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
//         var crashed = boxCompare(adjTrexBox, adjObstacleBox);

//         // Draw boxes for debug.
//         if (opt_canvasCtx) {
//           drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
//         }

//         if (crashed) {
//           return true;
//         }
//       }
//     }
//   }
//   return false;
// }


// /**
//  * Adjust the collision box.
//  * @param {!CollisionBox} box The original box.
//  * @param {!CollisionBox} adjustment Adjustment box.
//  * @return {!CollisionBox} The adjusted collision box object.
//  */
// function createAdjustedCollisionBox(box, adjustment) {
//   return new CollisionBox(
//       box.x + adjustment.x,
//       box.y + adjustment.y,
//       box.width,
//       box.height);
// }


// /**
//  * Draw the collision boxes for debug.
//  */
// function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
//   canvasCtx.save();
//   canvasCtx.strokeStyle = '#f00';
//   canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);

//   canvasCtx.strokeStyle = '#0f0';
//   canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y,
//       obstacleBox.width, obstacleBox.height);
//   canvasCtx.restore();
// }


// /**
//  * Compare two collision boxes for a collision.
//  * @param {CollisionBox} tRexBox
//  * @param {CollisionBox} obstacleBox
//  * @return {boolean} Whether the boxes intersected.
//  */
// function boxCompare(tRexBox, obstacleBox) {
//   var crashed = false;

//   // Axis-Aligned Bounding Box method.
//   if (tRexBox.x < obstacleBox.x + obstacleBox.width &&
//       tRexBox.x + tRexBox.width > obstacleBox.x &&
//       tRexBox.y < obstacleBox.y + obstacleBox.height &&
//       tRexBox.height + tRexBox.y > obstacleBox.y) {
//     crashed = true;
//   }

//   return crashed;
// }
