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

import DistanceMeter from './DistanceMeter';
import GameOverPanel from './GameOverPanel';
import Cloud from './Cloud';
// import Horizon from './Horizon';
import {Obstacle, SmallCactus, Pterodactyl} from './Obstacle';
import Renderer from './Renderer';
import Texture from './Texture';
import Trex from './Trex';

import {canvas} from './display';
import {IS_IOS, IS_MOBILE, getTimeStamp, vibrate} from './utils';

/**
 * Default game width.
 */
var DEFAULT_WIDTH = 600;

/**
 * Default game configuration.
 */
const config = {
  ACCELERATION: 0.001,
  BG_CLOUD_SPEED: 0.2,
  BOTTOM_PAD: 10,
  CLEAR_TIME: 3000,
  CLOUD_FREQUENCY: 0.5,
  GAMEOVER_CLEAR_TIME: 750,
  INITIAL_JUMP_VELOCITY: 12,
  INVERT_FADE_DURATION: 12000,
  INVERT_DISTANCE: 700,
  MAX_BLINK_COUNT: 3,
  MAX_CLOUDS: 6,
  MAX_OBSTACLE_LENGTH: 3,
  MAX_SPEED: 13,
  MIN_JUMP_HEIGHT: 35,
  MOBILE_SPEED_COEFFICIENT: 1.2,
  RESOURCE_TEMPLATE_ID: 'audio-resources',
  SPEED: 6,
  SPEED_DROP_COEFFICIENT: 3
};

const imageSprite: HTMLImageElement | null = document.getElementById('sprites') as HTMLImageElement;

/**
 * Default dimensions.
 */
const defaultDimensions = {
  WIDTH: DEFAULT_WIDTH,
  HEIGHT: 150
};

/**
 * CSS class names.
 */
const classes = {
  CANVAS: 'runner-canvas',
  CONTAINER: 'runner-container',
  CRASHED: 'crashed',
  ICON: 'icon-offline',
  INVERTED: 'inverted',
  SNACKBAR: 'snackbar',
  SNACKBAR_SHOW: 'snackbar-show',
  TOUCH_CONTROLLER: 'controller'
};


/**
 * Sprite definition layout of the spritesheet.
 */
const spriteDefinition = {
  CLOUD: {x: 86, y: 2},
  HORIZON: {x: 2, y: 54},
  MOON: {x: 484, y: 2},
  RESTART: {x: 2, y: 2},
  TEXT_SPRITE: {x: 655, y: 2},
  TREX: {x: 848, y: 2},
  STAR: {x: 645, y: 2},
};


/**
 * Sound FX. Reference to the ID of the audio tag on interstitial page.
 */
interface SoundFXDict {
  [name: string]: AudioBuffer | null
}
const sounds = {
  BUTTON_PRESS: 'button-press',
  HIT: 'hit',
  SCORE: 'score-reached'
};


/**
 * Key code mapping.
 */
const keycodes: {[name: string]: Set<number>} = {
  JUMP: new Set([38, 32]),  // Up, spacebar
  DUCK: new Set([40]),  // Down
  RESTART: new Set([13]),  // Enter
  VR: new Set([86]), // V
};


/**
 * Runner event names.
 */
const events = {
  ANIM_END: 'webkitAnimationEnd',
  CLICK: 'click',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  RESIZE: 'resize',
  TOUCHEND: 'touchend',
  TOUCHSTART: 'touchstart',
  VISIBILITY: 'visibilitychange',
  BLUR: 'blur',
  FOCUS: 'focus',
  LOAD: 'load'
};

// TODO: Make into a singleton

class Runner {
  private audioContext: AudioContext
  private audioBuffer: AudioBuffer
  private currentSpeed: number
  private distanceMeter: DistanceMeter
  private gameOverPanel: GameOverPanel
  // private horizon: Horizon
  private clouds: Cloud[]
  private obstacles: Obstacle[]
  private rafId: number
  private renderer: Renderer
  private soundFx: SoundFXDict
  private spriteTexture: Texture
  private touchController: HTMLElement
  private tRex: Trex
  private playing: boolean // Whether the game is currently in play state.
  private crashed: boolean
  private paused: boolean
  private inverted: boolean
  private distanceRan: number
  private highestScore: number
  private time: number
  private runningTime: number
  private msPerFrame: number
  private invertTimer: number

  /**
   * T-Rex runner.
   */
  constructor() {
    if (!imageSprite) {
      throw new Error('Cannot construct Runner until images have loaded');
    }
    this.renderer = new Renderer();
    this.spriteTexture = new Texture(imageSprite);

    this.distanceRan = 0;
    this.highestScore = 0;
    this.time = 0;
    this.runningTime = 0;
    this.msPerFrame = 1000 / 60;
    this.currentSpeed = config.SPEED;
    this.obstacles = [];
    this.playing = false; // Whether the game is currently in play state.
    this.crashed = false;
    this.paused = false;
    this.inverted = false;
    this.invertTimer = 0;

    // TODO: Redo the whole sound stuff
    // Sound FX.
    this.soundFx = {
      BUTTON_PRESS: null,
      HIT: null,
      SCORE: null,
    };

    this.loadSounds();

    // Global web audio context for playing sounds.
    this.audioContext = new AudioContext();

    // Horizon contains clouds, obstacles and the ground.
    // this.horizon = new Horizon(this.spriteTexture, imageSprite);

    this.gameOverPanel = new GameOverPanel(this.spriteTexture);
    this.gameOverPanel.visible = false;
    this.gameOverPanel.position[2] = -4;
    this.gameOverPanel.position[1] = 1.75;

    // Distance meter
    this.distanceMeter = new DistanceMeter(imageSprite,spriteDefinition.TEXT_SPRITE.x, spriteDefinition.TEXT_SPRITE.y);
    this.distanceMeter.position[2] = -4.3;
    this.distanceMeter.position[1] = 1.6;

    // Draw t-rex
    this.tRex = new Trex(this.spriteTexture);
    this.tRex.position[0] = -0.5;
    this.tRex.position[2] = -10;

    this.clouds = [];
    this.obstacles = [];

    const Obs = [Pterodactyl, SmallCactus];

    for (let i = 0; i < 20; i++) {
      this.clouds.push(new Cloud(this.spriteTexture));
      this.clouds[i].euler[1] = i * Math.PI / 10;
      this.clouds[i].position[2] = -20;

      let index = i % Obs.length;

      this.obstacles.push(new (Obs[index])(this.spriteTexture, this.currentSpeed));
      this.obstacles[i].euler[1] = i * Math.PI / 10;
      this.obstacles[i].position[2] = -10;
    }

    if (IS_MOBILE) {
      this.createTouchController();
    }

    this.startListening();
    this.update();
  }

  /**
   * Setting individual settings for debugging.
   * @param {string} setting
   * @param {*} value
   */
  updateConfigSetting(setting, value) {
    // if (setting in config && value != undefined) {
    //   config[setting] = value;

    //   switch (setting) {
    //     case 'GRAVITY':
    //     case 'MIN_JUMP_HEIGHT':
    //     case 'SPEED_DROP_COEFFICIENT':
    //       this.tRex.config[setting] = value;
    //       break;
    //     case 'INITIAL_JUMP_VELOCITY':
    //       this.tRex.setJumpVelocity(value);
    //       break;
    //     case 'SPEED':
    //       this.setSpeed(Number(value));
    //       break;
    //   }
    // }
  }

  loadSounds() {
    for (const name in sounds) {
      const sound = sounds[name];
      fetch(`resources/${sound}.mp3`)
        .then(response => response.arrayBuffer())
        .then(buffer => this.audioContext.decodeAudioData(buffer))
        .then(audioBuffer => this.soundFx[name] = audioBuffer);
    }
  }

  /**
   * Sets the game speed
   */
  setSpeed(speed: number) {
    this.currentSpeed = speed;
  }

  /**
   * Create the touch controller. A div that covers whole screen.
   */
  createTouchController() {
    // TODO: don't think the touch controller class does the right thing
    this.touchController = document.createElement('div');
    this.touchController.className = classes.TOUCH_CONTROLLER;
  }

  /**
   * Update the game status to started.
   */
  startGame() {
    this.runningTime = 0;

    // Handle tabbing off the page. Pause the current game.
    document.addEventListener(events.VISIBILITY, (e) => this.onVisibilityChange(e));
    window.addEventListener(events.BLUR, (e) => this.onVisibilityChange(e));
    window.addEventListener(events.FOCUS, (e) => this.onVisibilityChange(e));
  }

  /**
   * Update the game frame and schedules the next one.
   */
  update() {
    var now = getTimeStamp();
    var deltaTime = now - (this.time || now);
    this.time = now;

    if (this.playing) {
      if (this.tRex.jumping) {
        this.tRex.updateJump(deltaTime);
      }

      this.runningTime += deltaTime;
      var hasObstacles = this.runningTime > config.CLEAR_TIME;

      // this.horizon.update(deltaTime, this.currentSpeed, hasObstacles, this.inverted);
      for (let c of this.clouds) {
        c.update(this.currentSpeed / 10000);
      }
      for (let o of this.obstacles) {
        o.update(deltaTime, this.currentSpeed / 1000);
      }

      // // Check for collisions.
      // var collision = hasObstacles &&
      //     checkForCollision(this.horizon.obstacles[0], this.tRex);
      const collision = false;

      if (!collision) {
        this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;

        if (this.currentSpeed < config.MAX_SPEED) {
          this.currentSpeed += config.ACCELERATION;
        }
      } else {
        this.gameOver();
      }

      var playAchievementSound = this.distanceMeter.update(deltaTime,
          Math.ceil(this.distanceRan));

      if (playAchievementSound) {
        this.playSound('SCORE');
      }

      // // Night mode.
      // if (this.invertTimer > config.INVERT_FADE_DURATION) {
      //   this.invertTimer = 0;
      //   this.invertTrigger = false;
      //   this.invert();
      // } else if (this.invertTimer) {
      //   this.invertTimer += deltaTime;
      // } else {
        // var actualDistance =
        //     this.distanceMeter.getActualDistance(Math.ceil(this.distanceRan));

        // if (actualDistance > 0) {
        //   this.invertTrigger = !(actualDistance %
        //       config.INVERT_DISTANCE);

        //   if (this.invertTrigger && this.invertTimer === 0) {
        //     this.invertTimer += deltaTime;
        //     this.invert();
        //   }
        // }
      // }

    }

    this.tRex.update(deltaTime);
    this.scheduleNextUpdate();
    this.renderer.render([...this.obstacles, ...this.clouds, this.tRex, this.distanceMeter, this.gameOverPanel]);
  }

  /**
   * Event handler.
   * @override
   */
  handleEvent(e: Event): void {
    var evtType = e.type;
    switch (evtType) {
      case events.KEYDOWN:
      case events.TOUCHSTART:
      case events.MOUSEDOWN:
        this.onKeyDown(e);
        break;
      case events.KEYUP:
      case events.TOUCHEND:
      case events.MOUSEUP:
        this.onKeyUp(e);
        break;
    }
  }

  /**
   * Bind relevant key / mouse / touch listeners.
   */
  startListening() {
    // Keys.
    document.addEventListener(events.KEYDOWN, this);
    document.addEventListener(events.KEYUP, this);

    if (IS_MOBILE) {
      // Mobile only touch devices.
      this.touchController.addEventListener(events.TOUCHSTART, this);
      this.touchController.addEventListener(events.TOUCHEND, this);
      // TODO: canvas may be the wrong target for this?
      canvas.addEventListener(events.TOUCHSTART, this);
    } else {
      // Mouse.
      document.addEventListener(events.MOUSEDOWN, this);
      document.addEventListener(events.MOUSEUP, this);
    }
  }

  /**
   * Remove all listeners.
   */
  stopListening() {
    document.removeEventListener(events.KEYDOWN, this);
    document.removeEventListener(events.KEYUP, this);

    if (IS_MOBILE) {
      this.touchController.removeEventListener(events.TOUCHSTART, this);
      this.touchController.removeEventListener(events.TOUCHEND, this);
      // TODO: canvas may be the wrong target for this?
      canvas.removeEventListener(events.TOUCHSTART, this);
    } else {
      document.removeEventListener(events.MOUSEDOWN, this);
      document.removeEventListener(events.MOUSEUP, this);
    }
  }

  /**
   * Process keydown.
   * @param {!Event} e
   */
  onKeyDown(e) {
    // Prevent native page scrolling whilst tapping on mobile.
    if (IS_MOBILE && this.playing) {
      e.preventDefault();
    }

    if (!this.crashed && (keycodes.JUMP.has(e.keyCode) ||
          e.type == events.TOUCHSTART)) {
      if (!this.playing) {
        this.playing = true;
        this.update();
      }
      //  Play sound effect and jump on starting the game for the first time.
      if (!this.tRex.jumping && !this.tRex.ducking) {
        this.playSound('BUTTON_PRESS');
        this.tRex.startJump(this.currentSpeed);
      }
    }

    if (this.crashed && e.type == events.TOUCHSTART &&
        e.currentTarget == canvas) {
      this.restart();
    }

    if (this.playing && !this.crashed && keycodes.DUCK.has(e.keyCode)) {
      e.preventDefault();
      if (this.tRex.jumping) {
        // Speed drop, activated only when jump key is not pressed.
        this.tRex.setSpeedDrop();
      } else if (!this.tRex.jumping && !this.tRex.ducking) {
        // Duck.
        this.tRex.setDuck(true);
      }
    }
  }


  /**
   * Process key up.
   * @param {!Event} e
   */
  onKeyUp(e) {
    var isjumpKey = keycodes.JUMP.has(e.keyCode) ||
       e.type == events.TOUCHEND ||
       e.type == events.MOUSEDOWN;

    if (keycodes.VR.has(e.keyCode)) {
      this.renderer.requestVR();
    } else if (this.isRunning() && isjumpKey) {
      this.tRex.endJump();
    } else if (keycodes.DUCK.has(e.keyCode)) {
      this.tRex.speedDrop = false;
      this.tRex.setDuck(false);
    } else if (this.crashed) {
      // Check that enough time has elapsed before allowing jump key to restart.
      var deltaTime = getTimeStamp() - this.time;

      if (keycodes.RESTART.has(e.keyCode) || this.isLeftClickOnCanvas(e) ||
          (deltaTime >= config.GAMEOVER_CLEAR_TIME &&
          keycodes.JUMP.has(e.keyCode))) {
        this.restart();
      }
    } else if (this.paused && isjumpKey) {
      // Reset the jump state
      this.tRex.reset();
      this.play();
    }
  }

  /**
   * Returns whether the event was a left click on canvas.
   * On Windows right click is registered as a click.
   * @param {!Event} e
   * @return {boolean}
   */
  isLeftClickOnCanvas(e) {
    return e.button != null && e.button < 2 &&
        e.type == events.MOUSEUP && e.target == canvas;
  }

  /**
   * RequestAnimationFrame wrapper.
   */
  scheduleNextUpdate() {
    if (!this.rafId) {
      this.rafId = this.renderer.requestAnimationFrame(() => {
        this.rafId = 0;
        this.update()
      });
    }
  }

  /**
   * Whether the game is running.
   * @return {boolean}
   */
  isRunning() {
    return !!this.rafId;
  }

  /**
   * Game over state.
   */
  gameOver() {
    this.playSound('HIT');
    vibrate(200);

    this.stop();
    this.crashed = true;

    this.tRex.setCrashed();

    this.gameOverPanel.visible = true;

    // Update the high score.
    if (this.distanceRan > this.highestScore) {
      this.highestScore = Math.ceil(this.distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    }

    // Reset the time clock.
    this.time = getTimeStamp();
  }

  stop() {
    this.playing = false;
    this.paused = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  play() {
    if (!this.crashed) {
      this.playing = true;
      this.paused = false;
      this.tRex.run();
      this.time = getTimeStamp();
      this.update();
    }
  }

  restart() {
    this.runningTime = 0;
    this.playing = true;
    this.crashed = false;
    this.distanceRan = 0;
    this.setSpeed(config.SPEED);
    this.time = getTimeStamp();
    // this.containerEl.classList.remove(classes.CRASHED);
    this.distanceMeter.reset();
    this.gameOverPanel.visible = false;
    // this.horizon.reset();
    this.tRex.reset();
    this.playSound('BUTTON_PRESS');
    this.invert(true);
    this.update();
  }

  /**
   * Pause the game if the tab is not in focus.
   */
  onVisibilityChange(e: Event) {
    if (document.hidden || document.webkitHidden || e.type == 'blur' ||
      document.visibilityState != 'visible') {
      this.stop();
    } else if (!this.crashed) {
      this.tRex.reset();
      this.play();
    }
  }

  /**
   * Play a sound.
   */
  playSound(name: string) {
    if (!this.soundFx[name]) {
      return;
    }

    const soundBuffer = this.soundFx[name];
    var sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = soundBuffer;
    sourceNode.connect(this.audioContext.destination);
    sourceNode.start(0);
  }

  /**
   * Inverts the current page / canvas colors.
   * @param {boolean=} opt_reset Whether to reset colors.
   */
  invert(opt_reset) {
    // TODO: this whole color inversion thing
    // if (opt_reset) {
    //   document.body.classList.toggle(classes.INVERTED, false);
    //   this.invertTimer = 0;
    //   this.inverted = false;
    // } else {
    //   this.inverted = document.body.classList.toggle(classes.INVERTED,
    //       this.invertTrigger);
    // }
  }
}

export default function() {
  if (imageSprite) {
    if (imageSprite.complete) {
      return Promise.resolve(new Runner());
    }
    // If the images are not yet loaded, add a listener.
    return new Promise((resolve) => {
      imageSprite.addEventListener(events.LOAD, () => {
        resolve(new Runner());
      });
    });
  } else {
    return Promise.reject('Spritesheet not found');
  }
}
