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
import {getTimeStamp} from './utils';

// TODO: Needs to be defined in just one place
const SPRITE_MAP_WIDTH = 1233;
const SPRITE_MAP_HEIGHT = 68;

/**
 * T-rex player config.
 */
const config = {
  DROP_VELOCITY: -5,
  GRAVITY: 0.6,
  HEIGHT: 47,
  INIITAL_JUMP_VELOCITY: -10,
  INTRO_DURATION: 1500,
  MAX_JUMP_HEIGHT: 30,
  MIN_JUMP_HEIGHT: 30,
  SPEED_DROP_COEFFICIENT: 3,
  SPRITE_WIDTH: 262,
  START_X_POS: 50,
  WIDTH: 44,
  WIDTH_DUCK: 59,
  SPRITE_X: 848,
  SPRITE_Y: 2,
};

// The original game measures things in pixels, while in VR we measure things in
// metres. This gives the conversion factor - 1 pixel is DIST_UNITS metres.
// We can do the conversion by using the fact that the original T Rex was
// config.HEIGHT pixels high and is now 1 metre high.
const DIST_UNITS = 1 / config.HEIGHT;

/**
 * Used in collision detection.
 */
const collisionBoxes = {
  DUCKING: [
    new CollisionBox(1, 18, 55, 25)
  ],
  RUNNING: [
    new CollisionBox(22, 0, 17, 16),
    new CollisionBox(1, 18, 30, 9),
    new CollisionBox(10, 35, 14, 8),
    new CollisionBox(1, 24, 29, 5),
    new CollisionBox(5, 30, 21, 4),
    new CollisionBox(9, 34, 15, 4)
  ]
};


/**
 * Animation states.
 */
enum STATE {
  CRASHED,
  DUCKING,
  JUMPING,
  RUNNING,
  WAITING,
};

/**
 * Blinking coefficient.
 */
const BLINK_TIMING = 7000;

/**
 * Animation config for different states.
 */
const animFrames = {
  [STATE.WAITING]: {
    frames: [44, 0],
    msPerFrame: 1000 / 3
  },
  [STATE.RUNNING]: {
    frames: [88, 132],
    msPerFrame: 1000 / 12
  },
  [STATE.CRASHED]: {
    frames: [220],
    msPerFrame: 1000 / 60
  },
  [STATE.JUMPING]: {
    frames: [0],
    msPerFrame: 1000 / 60
  },
  [STATE.DUCKING]: {
    frames: [264, 323],
    msPerFrame: 1000 / 8
  }
};

export default class Trex extends Model {
  private currentFrame: number
  private blinkDelay: number
  private blinkCount: number
  private state: STATE
  jumping: boolean
  ducking: boolean
  private timer: number
  private msPerFrame: number // How long each T Rex anim frame should last
  private currentAnimFrames: number[]
  private animStartTime: number
  private jumpVelocity: number
  private reachedMinHeight: boolean
  speedDrop: boolean
  private jumpCount: number
  private jumpspotX: number

  /**
   * T-rex game character.
   */
  constructor(spriteTexture: Texture) {
    super(quad, spriteTexture);
    this.currentFrame = 0;
    this.currentAnimFrames = [0];
    this.blinkDelay = 0;
    this.blinkCount = 0;
    this.animStartTime = 0;
    this.timer = 0;
    this.msPerFrame = 1000;
    this.state = STATE.WAITING;

    this.jumping = false;
    this.ducking = false;
    this.jumpVelocity = 0;
    this.reachedMinHeight = false;
    this.speedDrop = false;
    this.jumpCount = 0;
    this.jumpspotX = 0;

    this.init();
  }

  /**
   * T-rex player initaliser.
   * Sets the t-rex to blink at random intervals.
   */
  private init() {
    this.setSpritePosition(SPRITE_MAP_WIDTH, SPRITE_MAP_HEIGHT, config.SPRITE_X, config.SPRITE_Y, config.WIDTH, config.HEIGHT);

    this.updateTexture();
    this.update(0, STATE.WAITING);
  }

  /**
   * Setter for the jump velocity.
   * The approriate drop velocity is also set.
   */
  setJumpVelocity(setting: number) {
    config.INIITAL_JUMP_VELOCITY = -setting;
    config.DROP_VELOCITY = -setting / 2;
  }

  /**
   * Set the animation STATE.
   */
  update(deltaTime: number, newState: STATE | null = null) {
    this.timer += deltaTime;

    // Update the STATE.
    if (newState !== null) {
      this.state = newState;
      this.currentFrame = 0;
      this.msPerFrame = animFrames[newState].msPerFrame;
      this.currentAnimFrames = animFrames[newState].frames;

      if (newState == STATE.WAITING) {
        this.animStartTime = getTimeStamp();
        this.setBlinkDelay();
      }
    }

    // TODO: Don't know if I need to do an intro, and if not, do I need to take
    // something from here and do it.
    // // Game intro animation, T-rex moves in from the left.
    // if (this.playingIntro && this.xPos < config.START_X_POS) {
    //   this.xPos += Math.round((config.START_X_POS /
    //       config.INTRO_DURATION) * deltaTime);
    // }

    if (this.state == STATE.WAITING) {
      this.blink(getTimeStamp());
    } else {
      this.updateTexture();
    }

    // Update the frame position.
    if (this.timer >= this.msPerFrame) {
      this.currentFrame = this.currentFrame ==
          this.currentAnimFrames.length - 1 ? 0 : this.currentFrame + 1;
      this.timer = 0;
    }

    // Speed drop becomes duck if the down key is still being pressed.
    if (this.speedDrop && this.position[1] === 0) {
      this.speedDrop = false;
      this.setDuck(true);
    }
  }

  /**
   * Update the texture offsets for the correct animation frame
   */
  private updateTexture() {
    const x = this.currentAnimFrames[this.currentFrame] + config.SPRITE_X;
    const y = config.SPRITE_Y;
    const width = this.ducking && this.state != STATE.CRASHED ?
        config.WIDTH_DUCK : config.WIDTH;
    const height = config.HEIGHT;

    // TODO: Not sure if this adjustment is still needed somehow
    //   // Crashed whilst ducking. Trex is standing up so needs adjustment.
    //   if (this.ducking && this.state == STATE.CRASHED) {
    //     this.xPos++;
    //   }
    this.setSpritePosition(SPRITE_MAP_WIDTH, SPRITE_MAP_HEIGHT, x, y, width, height);
  }

  /**
   * Sets a random time for the blink to happen.
   */
  private setBlinkDelay() {
    this.blinkDelay = Math.ceil(Math.random() * BLINK_TIMING);
  }

  /**
   * Make t-rex blink at random intervals.
   */
  private blink(time: number) {
    var deltaTime = time - this.animStartTime;

    if (deltaTime >= this.blinkDelay) {
      this.updateTexture();

      if (this.currentFrame == 1) {
        // Set new random delay to blink.
        this.setBlinkDelay();
        this.animStartTime = time;
        this.blinkCount++;
      }
    }
  }

  /**
   * Initialise a jump.
   */
  startJump(speed: number) {
    if (!this.jumping) {
      this.update(0, STATE.JUMPING);
      // Tweak the jump velocity based on the speed.
      this.jumpVelocity = config.INIITAL_JUMP_VELOCITY - (speed / 10);
      this.jumping = true;
      this.reachedMinHeight = false;
      this.speedDrop = false;
    }
  }

  /**
   * Jump is complete, falling down.
   */
  endJump() {
    if (this.reachedMinHeight &&
        this.jumpVelocity < config.DROP_VELOCITY) {
      this.jumpVelocity = config.DROP_VELOCITY;
    }
  }

  /**
   * Update frame for a jump.
   */
  updateJump(deltaTime: number) {
    var msPerFrame = animFrames[this.state].msPerFrame;
    var framesElapsed = deltaTime / msPerFrame;

    let y = this.position[1] / DIST_UNITS;

    // Speed drop makes Trex fall faster.
    if (this.speedDrop) {
      y -= Math.round(this.jumpVelocity *
          config.SPEED_DROP_COEFFICIENT * framesElapsed);
    } else {
      y -= Math.round(this.jumpVelocity * framesElapsed);
    }

    this.jumpVelocity += config.GRAVITY * framesElapsed;

    // Minimum height has been reached.
    if (y > config.MIN_JUMP_HEIGHT || this.speedDrop) {
      this.reachedMinHeight = true;
    }

    // Reached max height
    if (y > config.MAX_JUMP_HEIGHT || this.speedDrop) {
      this.endJump();
    }

    // Back down at ground level. Jump completed.
    if (y < 0) {
      this.reset();
      this.jumpCount++;
    }

    this.position[1] = y * DIST_UNITS;
    this.needsUpdate = true;
    this.update(deltaTime);
  }

  /**
   * Set the speed drop. Immediately cancels the current jump.
   */
  setSpeedDrop() {
    this.speedDrop = true;
    this.jumpVelocity = 1;
  }

  setDuck(isDucking: boolean) {
    if (isDucking && this.state != STATE.DUCKING) {
      this.update(0, STATE.DUCKING);
      this.ducking = true;
    } else if (this.state == STATE.DUCKING) {
      this.update(0, STATE.RUNNING);
      this.ducking = false;
    }
  }

  run() {
    this.update(0, STATE.RUNNING);
  }

  setCrashed() {
    this.update(100, STATE.CRASHED);
  }

  /**
   * Reset the t-rex to running at start of game.
   */
  reset() {
    this.position[1] = 0;
    this.jumpVelocity = 0;
    this.jumping = false;
    this.ducking = false;
    this.update(0, STATE.RUNNING);
    this.speedDrop = false;
    this.jumpCount = 0;
  }
};
