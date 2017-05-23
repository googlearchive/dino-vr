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

import {canvas, gl} from './display';
import {mat4} from 'gl-matrix';
import Model from './Model';
import ShaderProgram from './ShaderProgram';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

const VIEW_HEIGHT = 1.6;
const FOV = Math.PI / 6; // 30 degrees
const NEAR = 0.1;
const FAR = 1000;
const projection = mat4.create();
mat4.perspective(projection, FOV, gl.drawingBufferWidth / gl.drawingBufferHeight, NEAR, FAR);

// let night = 0;
// let nightStep = 0;

const view = mat4.create();
mat4.translate(view, view, [0, VIEW_HEIGHT, 0]);
mat4.invert(view, view);

let vrDisplay: VRDisplay;
let frameData: VRFrameData;

if ('getVRDisplays' in navigator) {
  frameData = new VRFrameData();
  navigator.getVRDisplays().then((displays) => {
    if (displays.length > 0) {
      vrDisplay = displays[0];
      vrDisplay.depthFar = FAR;
      vrDisplay.depthNear = NEAR;
    }
  });
}

enum SIDE {
  LEFT = 1,
  RIGHT,
  BOTH,
}

// Scratch matrix
const eyeView = mat4.create();

export default class Renderer {
  shader: ShaderProgram

  constructor() {
    this.shader = new ShaderProgram(vertexShader, fragmentShader);
    this.shader.start();

    gl.enable(gl.BLEND);
    // gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    // gl.frontFace(gl.CW);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.97, 0.97, 0.97, 1);
  }

  requestVR() {
    if (vrDisplay && !vrDisplay.isPresenting) {
      vrDisplay.requestPresent([{source: canvas}]).then(() => {
        const leftEye = vrDisplay.getEyeParameters('left');
        const rightEye = vrDisplay.getEyeParameters('right');

        const width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
        const height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
        canvas.width = width;
        canvas.height = height;
      });
    }
  }

  exitVR() {
    if (vrDisplay && vrDisplay.isPresenting) {
      vrDisplay.exitPresent().then(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    }
  }

  requestAnimationFrame(cb) {
    if (vrDisplay) {
      return vrDisplay.requestAnimationFrame(cb);
    } else {
      return requestAnimationFrame(cb);
    }
  }

  /**
   * Draw the scene
   */
  render(models: Model[]) {
    // nightStep += 0.01;
    // night = (Math.sin(nightStep) * 0.97 / 2) + 0.5;

    // gl.clearColor(1.0 - night, 1.0 - night, 1.0 - night, 1);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    if (vrDisplay) {
      vrDisplay.getFrameData(frameData);
      if (vrDisplay.isPresenting) {
        const leftEye = vrDisplay.getEyeParameters('left');
        const rightEye = vrDisplay.getEyeParameters('right');

        const width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
        const height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
        canvas.width = width;
        canvas.height = height;
        mat4.mul(eyeView, frameData.leftViewMatrix as mat4, view);
        this.drawEye(models, eyeView, frameData.leftProjectionMatrix, SIDE.LEFT);
        mat4.mul(eyeView, frameData.rightViewMatrix as mat4, view);
        this.drawEye(models, eyeView, frameData.rightProjectionMatrix, SIDE.RIGHT);
      } else {
        mat4.mul(eyeView, frameData.leftViewMatrix as mat4, view);
        this.drawEye(models, eyeView, projection, SIDE.BOTH);
      }
      vrDisplay.submitFrame();
    } else {
      this.drawEye(models, view, projection, SIDE.BOTH);
    }
    gl.flush();
  }

  drawEye(models: Model[], view: Float32Array, projection: Float32Array, side: SIDE) {
    let w = gl.drawingBufferWidth;
    let l = 0;
    if (side !== SIDE.BOTH) {
      w /= 2;
    }
    if (side === SIDE.RIGHT) {
      l += w;
    }
    gl.viewport(l, 0, w, gl.drawingBufferHeight);

    let currentGeometry;
    let currentTexture;

    this.shader.uniformMatrix4fv('projection', projection);
    this.shader.uniformMatrix4fv('view', view);
    // this.shader.uniformFloat('night', night);
    for (const model of models) {
      if (!model.visible) {
        continue;
      }
      if (model.geometry !== currentGeometry) {
        model.geometry.bind();
        currentGeometry = model.geometry;
      }
      if (model.texture !== currentTexture) {
        model.texture.bind(gl.TEXTURE0);
        currentTexture = model.texture;
      }
      this.shader.uniformMatrix4fv('transform', model.getTransform());
      this.shader.uniform2fv('uvOffset', model.uvOffset);
      this.shader.uniform2fv('uvScale', model.uvScale);
      gl.drawElements(gl.TRIANGLES, model.geometry.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
  }
}


// TODO: Good stuff around resizing the window

  // window.addEventListener(events.RESIZE, () => this.debounceResize());

  // /**
  //  * Debounce the resize event.
  //  */
  // debounceResize() {
  //   if (!this.resizeTimerId_) {
  //     this.resizeTimerId_ =
  //         setInterval(this.adjustDimensions.bind(this), 250);
  //   }
  // }

  // /**
  //  * Adjust game space dimensions on resize.
  //  */
  // adjustDimensions() {
  //   clearInterval(this.resizeTimerId_);
  //   this.resizeTimerId_ = null;

  //   var boxStyles = window.getComputedStyle(this.outerContainerEl);
  //   var padding = Number(boxStyles.paddingLeft.substr(0,
  //       boxStyles.paddingLeft.length - 2));

  //   this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;

  //   // Redraw the elements back onto the canvas.
  //   if (this.canvas) {
  //     this.canvas.width = this.dimensions.WIDTH;
  //     this.canvas.height = this.dimensions.HEIGHT;

  //     Runner.updateCanvasScaling(this.canvas);

  //     this.distanceMeter.calcXPos(this.dimensions.WIDTH);
  //     this.clearCanvas();
  //     this.horizon.update(0, 0, true);
  //     this.tRex.update(0);

  //     // Outer container and distance meter.
  //     if (this.playing || this.crashed || this.paused) {
  //       this.containerEl.style.width = this.dimensions.WIDTH + 'px';
  //       this.containerEl.style.height = this.dimensions.HEIGHT + 'px';
  //       this.distanceMeter.update(0, Math.ceil(this.distanceRan));
  //       this.stop();
  //     }

  //     // Game over panel.
  //     if (this.crashed && this.gameOverPanel) {
  //       this.gameOverPanel.updateDimensions(this.dimensions.WIDTH);
  //       this.gameOverPanel.draw();
  //     }
  //   }
  // }

// /**
//  * Updates the canvas size taking into
//  * account the device pixel ratio.
//  *
//  * See article by Paul Lewis:
//  * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
//  *
//  * @param {!HTMLCanvasElement} canvas
//  * @param {number=} opt_width
//  * @param {number=} opt_height
//  * @return {boolean} Whether the canvas was scaled.
//  */
// Runner.updateCanvasScaling = function(canvas, opt_width, opt_height) {
//   var context =
//       /** @type {!CanvasRenderingContext2D} */ (canvas.getContext('2d'));

//   var devicePixelRatio = Math.floor(window.devicePixelRatio) || 1;

//   // Upscale the canvas if the two ratios don't match
//   if (devicePixelRatio === 1) {
//     // Reset the canvas width / height. Fixes scaling bug when the page is
//     // zoomed and the devicePixelRatio changes accordingly.
//     canvas.style.width = canvas.width + 'px';
//     canvas.style.height = canvas.height + 'px';
//     return false;
//   }

//   var oldWidth = opt_width || canvas.width;
//   var oldHeight = opt_height || canvas.height;

//   canvas.width = oldWidth * devicePixelRatio;
//   canvas.height = oldHeight * devicePixelRatio;

//   canvas.style.width = oldWidth + 'px';
//   canvas.style.height = oldHeight + 'px';

//   // Scale the context to counter the fact that we've manually scaled
//   // our canvas element.
//   context.scale(devicePixelRatio, devicePixelRatio);
//   return true;
// };
