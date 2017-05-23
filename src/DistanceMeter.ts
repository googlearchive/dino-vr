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

import {quad} from './geometries';
import Model from './Model';
import Texture from './Texture';

const dimensions = {
  WIDTH: 10,
  HEIGHT: 13,
  DEST_WIDTH: 11
};

/**
 * Distance meter config.
 */
const config = {
  // Number of digits.
  MAX_DISTANCE_UNITS: 5,

  // Distance that causes achievement animation.
  ACHIEVEMENT_DISTANCE: 100,

  // Used for conversion from pixel distance to a scaled unit.
  COEFFICIENT: 0.025,

  // Flash duration in milliseconds.
  FLASH_DURATION: 1000 / 4,

  // Flash iterations for achievement animation.
  FLASH_ITERATIONS: 3
};

const maxWidth = dimensions.DEST_WIDTH * 2 * (config.MAX_DISTANCE_UNITS + 2);

export default class DistanceMeter extends Model {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private spriteMap: HTMLImageElement
  private highScore: number
  private maxScore: number
  private spriteX: number
  private spriteY: number
  private flashCounter: number
  private flashTimer: number
  private flashScore: number

  constructor(spriteMap, spriteX, spriteY) {
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = maxWidth; //dimensions.HEIGHT;
    const texture = new Texture(canvas);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error(`Couldn't create a rendering context for the distance meter`);
    }
    context.imageSmoothingEnabled = false;
    super(quad, texture);
    this.canvas = canvas;
    this.ctx = context;
    this.spriteMap = spriteMap;
    this.spriteX = spriteX;
    this.spriteY = spriteY;

    // TODO: In the original, if you reach maxScore the scoreboard expands to
    // allow the bigger score, while I just stop updating
    this.maxScore = Math.pow(10, config.MAX_DISTANCE_UNITS) - 1;
    this.highScore = 0;

    this.flashCounter = 0;
    this.flashTimer = 0;
    this.flashScore = 0;
  }

  drawDigit(x: number, digit: number) {
    this.ctx.drawImage(this.spriteMap, this.spriteX + digit * dimensions.WIDTH, this.spriteY, dimensions.WIDTH, dimensions.HEIGHT, x * dimensions.DEST_WIDTH, 1, dimensions.DEST_WIDTH, dimensions.HEIGHT);
  }

  drawScore(startX: number, score: number) {
    score = Math.floor(score);
    if (score > this.maxScore) {
      score = this.maxScore;
    }
    this.drawDigit(startX + 4, score % 10);
    score = Math.floor(score / 10);
    this.drawDigit(startX + 3, score % 10);
    score = Math.floor(score / 10);
    this.drawDigit(startX + 2, score % 10);
    score = Math.floor(score / 10);
    this.drawDigit(startX + 1, score % 10);
    score = Math.floor(score / 10);
    this.drawDigit(startX, score % 10);
  }

  /**
   * Covert pixel distance to a 'real' distance.
   */
  getActualDistance(distance: number): number {
    return distance ? Math.round(distance * config.COEFFICIENT) : 0;
  }

  update(elapsed: number, distance: number) {
    let playSound = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.highScore > 0) {
      this.ctx.globalAlpha = 0.8;
      this.drawDigit(0, 10);
      this.drawDigit(1, 11);
      this.drawScore(3, this.highScore);
      this.ctx.globalAlpha = 1.0;
    }
    const realDist = this.getActualDistance(distance);
    if (realDist > 0 && realDist % config.ACHIEVEMENT_DISTANCE === 0 && this.flashScore !== realDist) {
      this.flashCounter = config.FLASH_ITERATIONS;
      this.flashTimer = config.FLASH_DURATION * 2;
      this.flashScore = realDist;
      playSound = true;
    }
    if (this.flashCounter > 0 || this.flashTimer > 0) {
      if (this.flashTimer < config.FLASH_DURATION) {
        this.drawScore(9, this.flashScore);
      }
      this.flashTimer -= elapsed;
      if (this.flashTimer < 0) {
        this.flashTimer += config.FLASH_DURATION * 2;
        this.flashCounter--;
        if (this.flashCounter < 0) {
          this.flashCounter = 0;
          this.flashTimer = 0;
        }
      }
    } else {
      this.drawScore(9, realDist);
    }
    this.texture.update(this.canvas);
    return playSound;
  }

  setHighScore(distance: number) {
    this.highScore = this.getActualDistance(distance);
  }

  /**
   * Reset the distance meter back to '00000'.
   */
  reset() {
    this.update(0, 0);
  }
};

