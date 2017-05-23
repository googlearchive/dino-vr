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

import Model from './Model';
import Texture from './Texture';
import {quad} from './geometries';
import {random} from './utils';

// TODO: Needs to be defined in just one place
const SPRITE_MAP_WIDTH = 1233;
const SPRITE_MAP_HEIGHT = 68;

const SPRITE_X = 86;
const SPRITE_Y = 2;
const SPRITE_WIDTH = 46;
const SPRITE_HEIGHT = 14;

/**
 * Cloud object config.
 */
const config = {
  MAX_CLOUD_GAP: 400,
  MAX_SKY_LEVEL: 4,
  MIN_CLOUD_GAP: 100,
  MIN_SKY_LEVEL: 1,
};

// TODO: Need to add clouds ahead and remove them behind - but either case only
// when the player is not looking.

// TODO: The y coordinate needs setting to a random amount between the min and
// the max. However, min and max are not suitable for 3D.

// TODO: Do whatever the cloud gap code was doing here

/**
 * Cloud background item.
 * Similar to an obstacle object but without collision boxes.
 */
export default class Cloud extends Model {
  private height: number
  private angle: number

  constructor(spriteTexture: Texture) {
    super(quad, spriteTexture);
    // Clouds spawn directly opposite the dinosaur
    this.euler[1] = Math.PI;
    this.position[1] = random(config.MIN_SKY_LEVEL, config.MAX_SKY_LEVEL);

    this.setSpritePosition(SPRITE_MAP_WIDTH, SPRITE_MAP_HEIGHT, SPRITE_X,SPRITE_Y, SPRITE_WIDTH, SPRITE_HEIGHT);
  }

  /**
   * Update the cloud position.
   * @param {number} speed
   */
  update(speed) {
    this.euler[1] += speed;
    if (this.euler[1] > (2 * Math.PI)) {
      this.euler[1] -= 2 * Math.PI;
    }
    if (this.euler[1] - Math.PI < speed && this.euler[1] - Math.PI > 0) {
      console.log(speed, this.euler[1] - Math.PI);
      this.position[1] = random(config.MIN_SKY_LEVEL, config.MAX_SKY_LEVEL);
    }
    this.needsUpdate = true;
  }
}
