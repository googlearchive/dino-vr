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

import Texture from './Texture';

/**
 * Horizon line dimensions.
 */
const dimensions = {
  X: 2,
  Y: 54,
  WIDTH: 600,
  HEIGHT: 12,
  YPOS: 127
};

export default class HorizonLine {
  bumpThreshold: number
  canvas: HTMLCanvasElement
  canvasCtx: CanvasRenderingContext2D
  imageSprite: HTMLImageElement
  sourceXPos: number[]
  texture: Texture
  xPos: number[]
  yPos: number

  /**
   * Horizon Line.
   * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
   * @constructor
   */
  constructor(imageSprite: HTMLImageElement) {
    this.imageSprite = imageSprite
    this.canvas = document.createElement('canvas');
    this.canvas.width = dimensions.WIDTH;
    this.canvas.height = dimensions.HEIGHT;
    this.canvasCtx = this.canvas.getContext('2d')!;
    this.texture = new Texture(this.canvas);
    this.sourceXPos = [dimensions.X, dimensions.X + dimensions.WIDTH];
    this.bumpThreshold = 0.5;

    this.xPos = [0, dimensions.WIDTH];
    this.yPos = dimensions.YPOS;
    this.draw();
  }

  /**
   * Return the crop x position of a type.
   * @return {number}
   */
  getRandomType() {
    return Math.random() > this.bumpThreshold ? dimensions.WIDTH : 0;
  }

  /**
   * Draw the horizon line.
   */
  draw() {
    this.canvasCtx.drawImage(this.imageSprite, this.sourceXPos[0],
        dimensions.Y,
        dimensions.WIDTH, dimensions.HEIGHT,
        this.xPos[0], this.yPos,
        dimensions.WIDTH, dimensions.HEIGHT);

    this.canvasCtx.drawImage(this.imageSprite, this.sourceXPos[1],
        dimensions.Y,
        dimensions.WIDTH, dimensions.HEIGHT,
        this.xPos[1], this.yPos,
        dimensions.WIDTH, dimensions.HEIGHT);
    this.texture.update(this.canvas);
  }

  /**
   * Update the x position of an indivdual piece of the line.
   */
  updateXPos(pos: number, increment: number) {
    var line1 = pos;
    var line2 = pos == 0 ? 1 : 0;

    this.xPos[line1] -= increment;
    this.xPos[line2] = this.xPos[line1] + dimensions.WIDTH;

    if (this.xPos[line1] <= -dimensions.WIDTH) {
      this.xPos[line1] += dimensions.WIDTH * 2;
      this.xPos[line2] = this.xPos[line1] - dimensions.WIDTH;
      this.sourceXPos[line1] = this.getRandomType() + dimensions.X;
    }
  }

  /**
   * Update the horizon line.
   * @param {number} deltaTime
   * @param {number} speed
   */
  update(deltaTime, speed) {
    var increment = Math.floor(speed * (60 / 1000) * deltaTime);

    if (this.xPos[0] <= 0) {
      this.updateXPos(0, increment);
    } else {
      this.updateXPos(1, increment);
    }
    this.draw();
  }

  /**
   * Reset horizon to the starting position.
   */
  reset() {
    this.xPos[0] = 0;
    this.xPos[1] = dimensions.WIDTH;
  }
};

