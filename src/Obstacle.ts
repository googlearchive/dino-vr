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

import CollisionBox from './CollisionBox';
import Model from './Model';
import Texture from './Texture';

import {quad} from './geometries';
import {randomInt} from './utils';

// TODO: Needs to be defined in just one place
const SPRITE_MAP_WIDTH = 1233;
const SPRITE_MAP_HEIGHT = 68;

const GAP_COEFFICIENT = 0.6;

/**
 * Coefficient for calculating the maximum gap.
 */
const MAX_GAP_COEFFICIENT = 1.5;

/**
 * Maximum obstacle grouping count.
 */
const MAX_OBSTACLE_LENGTH = 3;


class Obstacle extends Model {
  protected width: number
  protected height: number
  /** Speed at which multiples are allowed */
  protected multipleSpeed: number
  /** minimum pixel space betweeen obstacles */
  protected minGap: number
  /** Minimum speed at which the obstacle can make an appearance */
  protected minSpeed: number
  protected size: number
  protected spriteX: number
  protected spriteY: number
  protected collisionBoxes: CollisionBox[]
  protected gap: number
  remove: boolean

  /**
   * Obstacle.
   */
  constructor(spriteTexture: Texture) {
    super(quad, spriteTexture);

    this.size = randomInt(1, MAX_OBSTACLE_LENGTH);
    this.remove = false;
    this.width = 0;
    this.collisionBoxes = [];
    this.gap = 0;
  }

  /**
   * Initialise the DOM for the obstacle.
   * @param {number} speed
   */
  init(speed) {
    // Only allow sizing if we're at the right speed.
    if (this.size > 1 && this.multipleSpeed > speed) {
      this.size = 1;
    }

    this.width = this.width * this.size;

    this.draw();

    // Make collision box adjustments,
    // Central box is adjusted to the size as one box.
    //      ____        ______        ________
    //    _|   |-|    _|     |-|    _|       |-|
    //   | |<->| |   | |<--->| |   | |<----->| |
    //   | | 1 | |   | |  2  | |   | |   3   | |
    //   |_|___|_|   |_|_____|_|   |_|_______|_|
    //
    if (this.size > 1) {
      this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width -
          this.collisionBoxes[2].width;
      this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
    }

    this.gap = this.getGap(GAP_COEFFICIENT, speed);
  }

  /**
   * Draw and crop based on size.
   */
  draw() {
    this.setSpritePosition(SPRITE_MAP_WIDTH, SPRITE_MAP_HEIGHT, this.spriteX, this.spriteY, this.width, this.height);
  }

  /**
   * Obstacle frame update.
   * @param {number} deltaTime
   * @param {number} speed
   */
  update(deltaTime, speed) {
    // if (!this.remove) {
      this.euler[1] += (speed * 60 / 1000) * deltaTime;
      this.needsUpdate = true;

      this.draw();

      // if (!this.isVisible()) {
      //   this.remove = true;
      // }
    // }
  }

  /**
   * Calculate a random gap size.
   * - Minimum gap gets wider as speed increses
   * @param {number} gapCoefficient
   * @param {number} speed
   * @return {number} The gap size.
   */
  getGap(gapCoefficient, speed) {
    var minGap = Math.round(this.width * speed + this.minGap * gapCoefficient);
    var maxGap = Math.round(minGap * MAX_GAP_COEFFICIENT);
    return randomInt(minGap, maxGap);
  }

  // Set the y position of the obstacle. Converts from original pixel height to
  // 3D world height
  setY(height) {
    this.position[1] = (140 - height - this.height) / 15;
    this.needsUpdate = true;
  }
}

class SmallCactus extends Obstacle {
  constructor(spriteTexture: Texture, speed: number) {
    super(spriteTexture);
    this.width = 17;
    this.height = 35;
    this.setY(105);
    this.multipleSpeed = 4;
    this.minGap = 120;
    this.minSpeed = 0;
    this.spriteX = 228;
    this.spriteY = 2;
    this.collisionBoxes = [
      new CollisionBox(0, 7, 5, 27),
      new CollisionBox(4, 0, 6, 34),
      new CollisionBox(10, 4, 7, 14)
    ];
    this.init(speed);
  }
}

class LargeCactus extends Obstacle {
  constructor(spriteTexture: Texture, speed: number) {
    super(spriteTexture);
    this.width = 25;
    this.height = 50;
    this.setY(90);
    this.multipleSpeed = 7;
    this.minGap = 120;
    this.minSpeed = 0;
    this.spriteX = 332;
    this.spriteY = 2;
    this.collisionBoxes = [
      new CollisionBox(0, 12, 7, 38),
      new CollisionBox(8, 0, 7, 49),
      new CollisionBox(13, 10, 10, 38)
    ];
    this.init(speed);
  }
}

class Pterodactyl extends Obstacle {
  /** speed faster / slower than the horizon */
  private speedOffset: number
  private yPositions: number[]
  private numFrames: number
  private currentFrame: number
  private timer: number
  private frameRate: number

  constructor(spriteTexture: Texture, speed: number) {
    super(spriteTexture);
    this.width = 46;
    this.height = 40;
    this.yPositions = [100, 75, 50]; // Variable height.
    this.multipleSpeed = 999;
    this.minSpeed = 8.5;
    this.minGap = 150;
    this.spriteX = 134;
    this.spriteY = 2;
    this.collisionBoxes = [
      new CollisionBox(15, 15, 16, 5),
      new CollisionBox(18, 21, 24, 6),
      new CollisionBox(2, 14, 4, 3),
      new CollisionBox(6, 10, 4, 7),
      new CollisionBox(10, 8, 6, 9)
    ];
    this.numFrames = 2;
    this.frameRate = 1000/6;
    this.speedOffset = 0.002;
    this.currentFrame = 0;
    this.timer = 0;
    this.init(speed);
  }

  /**
   * Initialise the DOM for the obstacle.
   * @param {number} speed
   */
  init(speed) {
    this.setY(this.yPositions[randomInt(0, this.yPositions.length - 1)]);

    // For obstacles that go at a different speed from the horizon.
    if (this.speedOffset) {
      this.speedOffset = Math.random() > 0.5 ? this.speedOffset :
          -this.speedOffset;
    }

    super.init(speed);
  }

  /**
   * Draw and crop based on size.
   */
  draw() {
    // X position in sprite.
    let sourceX = this.spriteX;

    // Animation frames.
    if (this.currentFrame > 0) {
      sourceX += this.width * this.currentFrame;
    }

    this.setSpritePosition(SPRITE_MAP_WIDTH, SPRITE_MAP_HEIGHT, sourceX, this.spriteY, this.width, this.height);
  }

  /**
   * Obstacle frame update.
   * @param {number} deltaTime
   * @param {number} speed
   */
  update(deltaTime, speed) {
    speed += this.speedOffset;

    // Update frame
    this.timer += deltaTime;
    if (this.timer >= this.frameRate) {
      this.currentFrame = (this.currentFrame + 1) % this.numFrames;
      this.timer = 0;
    }

    super.update(deltaTime, speed);
  }
}

export {Obstacle, SmallCactus, LargeCactus, Pterodactyl};
