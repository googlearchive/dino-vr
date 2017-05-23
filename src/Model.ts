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

import Geometry from './Geometry';
import Texture from './Texture';
import {vec2, vec3, mat4} from 'gl-matrix';

export default class Model {
  geometry: Geometry
  texture: Texture
  position: vec3
  euler: vec3
  uvOffset: vec2
  uvScale: vec2
  private transform: mat4
  needsUpdate: boolean
  visible: boolean

  constructor(geometry: Geometry, texture: Texture) {
    this.geometry = geometry;
    this.texture = texture;
    this.position = vec3.fromValues(0, 0, 0);
    this.uvOffset = vec2.fromValues(0, 0);
    this.uvScale = vec2.fromValues(1, 1);
    this.euler = vec3.fromValues(0, 0, 0);
    this.transform = mat4.create();
    this.needsUpdate = true;
    this.visible = true;
  }

  /**
   * Because of the nature of the game, rotations happen first, since everything
   * rotates around the centre.
   */
  getTransform() {
    if (this.needsUpdate) {
      mat4.identity(this.transform);
      mat4.rotateX(this.transform, this.transform, this.euler[0]);
      mat4.rotateY(this.transform, this.transform, this.euler[1]);
      mat4.rotateZ(this.transform, this.transform, this.euler[2]);
      mat4.translate(this.transform, this.transform, this.position);
      this.needsUpdate = false;
    }

    return this.transform;
  }

  /**
   * Turn coordinates within the texture to UVs
   */
  setSpritePosition(sheetWidth: number, sheetHeight: number, x: number, y: number, w: number, h: number) {
    vec2.set(this.uvOffset, x / sheetWidth, y / sheetHeight);
    vec2.set(this.uvScale, w / sheetWidth, h / sheetHeight);
  }
}
