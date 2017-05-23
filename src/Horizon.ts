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

import Cloud from './Cloud';
import HorizonLine from './HorizonLine';
import {Obstacle} from './Obstacle';
import Texture from './Texture';

import {randomInt} from './utils';
/**
 * Horizon config.
 */
const config = {
  BG_CLOUD_SPEED: 0.2,
  BUMPY_THRESHOLD: .3,
  CLOUD_FREQUENCY: .5,
  HORIZON_HEIGHT: 16,
  MAX_CLOUDS: 6,
  MAX_OBSTACLE_DUPLICATION: 2,
};

export default class Horizon {
  clouds: Cloud[]
  horizonLine: HorizonLine
  obstacles: Obstacle[]
  obstacleHistory: number[]
  spriteTexture: Texture

  /**
   * Horizon background class.
   * @param {!HTMLCanvasElement} canvas
   * @param {!Object} spritePos Sprite positioning.
   * @param {!Object} dimensions Canvas dimensions.
   * @param {number} gapCoefficient
   */
  constructor(spriteTexture: Texture, imageSprite: HTMLImageElement) {
    this.obstacles = [];
    this.obstacleHistory = [];
    // this.nightMode = null;

    // Cloud
    this.clouds = [];

    // Horizon
    this.addCloud();
    this.horizonLine = new HorizonLine(imageSprite);
    // this.nightMode = new NightMode(this.canvas, this.spritePos.MOON,
    //     this.dimensions.WIDTH);
  }

  /**
   * updateObstacles: Used as an override to prevent
   *     the obstacles from being updated / added. This happens in the
   *     ease in section.
   * showNightMode: Night mode activated.
   */
  update(deltaTime: number, currentSpeed: number, updateObstacles: boolean, showNightMode: boolean) {
    this.horizonLine.update(deltaTime, currentSpeed);
    // this.nightMode.update(showNightMode);
    this.updateClouds(deltaTime, currentSpeed);

    if (updateObstacles) {
      this.updateObstacles(deltaTime, currentSpeed);
    }
  }

  /**
   * Update the cloud positions.
   * @param {number} deltaTime
   * @param {number} speed
   */
  updateClouds(deltaTime, speed) {
    var cloudSpeed = config.BG_CLOUD_SPEED / 1000 * deltaTime * speed;
    var numClouds = this.clouds.length;

    if (numClouds) {
      for (var i = numClouds - 1; i >= 0; i--) {
        this.clouds[i].update(cloudSpeed);
      }

      var lastCloud = this.clouds[numClouds - 1];

      // Check for adding a new cloud.
      if (numClouds < config.MAX_CLOUDS &&
          (this.dimensions.WIDTH - lastCloud.xPos) > lastCloud.cloudGap &&
          config.CLOUD_FREQUENCY > Math.random()) {
        this.addCloud();
      }

      // Remove expired clouds.
      this.clouds = this.clouds.filter((c) => !c.remove);
    } else {
      this.addCloud();
    }
  }

  /**
   * Update the obstacle positions.
   * @param {number} deltaTime
   * @param {number} currentSpeed
   */
  updateObstacles(deltaTime, currentSpeed) {
    // Obstacles, move to Horizon layer.
    var updatedObstacles = this.obstacles.slice(0);

    for (var i = 0; i < this.obstacles.length; i++) {
      var obstacle = this.obstacles[i];
      obstacle.update(deltaTime, currentSpeed);

      // Clean up existing obstacles.
      if (obstacle.remove) {
        updatedObstacles.shift();
      }
    }
    this.obstacles = updatedObstacles;

    if (this.obstacles.length > 0) {
      var lastObstacle = this.obstacles[this.obstacles.length - 1];

      if (lastObstacle && !lastObstacle.followingObstacleCreated &&
          lastObstacle.isVisible() &&
          (lastObstacle.xPos + lastObstacle.width + lastObstacle.gap) <
          this.dimensions.WIDTH) {
        this.addNewObstacle(currentSpeed);
        lastObstacle.followingObstacleCreated = true;
      }
    } else {
      // Create new obstacles.
      this.addNewObstacle(currentSpeed);
    }
  }

  removeFirstObstacle() {
    this.obstacles.shift();
  }

  /**
   * Add a new obstacle.
   * @param {number} currentSpeed
   */
  addNewObstacle(currentSpeed) {
    var obstacleTypeIndex = randomInt(0, Obstacle.types.length - 1);
    var obstacleType = Obstacle.types[obstacleTypeIndex];

    // Check for multiples of the same type of obstacle.
    // Also check obstacle is available at current speed.
    if (this.duplicateObstacleCheck(obstacleType.type) ||
        currentSpeed < obstacleType.minSpeed) {
      this.addNewObstacle(currentSpeed);
    } else {
      var obstacleSpritePos = this.spritePos[obstacleType.type];

      this.obstacles.push(new Obstacle(this.spriteTexture, currentSpeed));

      this.obstacleHistory.unshift(obstacleType.type);

      if (this.obstacleHistory.length > 1) {
        this.obstacleHistory.splice(config.MAX_OBSTACLE_DUPLICATION);
      }
    }
  }

  /**
   * Returns whether the previous two obstacles are the same as the next one.
   * Maximum duplication is set in config value MAX_OBSTACLE_DUPLICATION.
   * @param {string} nextObstacleType
   * @return {boolean}
   */
  duplicateObstacleCheck(nextObstacleType) {
    var duplicateCount = 0;

    for (var i = 0; i < this.obstacleHistory.length; i++) {
      duplicateCount = this.obstacleHistory[i] == nextObstacleType ?
          duplicateCount + 1 : 0;
    }
    return duplicateCount >= config.MAX_OBSTACLE_DUPLICATION;
  }

  /**
   * Reset the horizon layer.
   * Remove existing obstacles and reposition the horizon line.
   */
  reset() {
    this.obstacles = [];
    this.horizonLine.reset();
    // this.nightMode.reset();
  }

  /**
   * Add a new cloud to the horizon.
   */
  addCloud() {
    this.clouds.push(new Cloud(this.spriteTexture));
  }
}
