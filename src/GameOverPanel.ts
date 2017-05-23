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
import Model from './Model';
import Texture from './Texture';

// TODO: Needs to be defined in just one place
const SPRITE_MAP_WIDTH = 1233;
const SPRITE_MAP_HEIGHT = 68;

const srcPos = {
  text: {
    t: 15,
    l: 655,
    b: 26,
    r: 846,
  },
  restart: {
    t: 2,
    l: 2,
    b: 34,
    r: 38,
  }
};

const dstPos = {
  text: {
    t: 0.34,
    l: -1,
    b: 0.225,
    r: 1,
  },
  restart: {
    t: -0.11,
    l: -0.188,
    b: -0.34,
    r: 0.188,
  }
}

const TEXT_UVS = {
  l: srcPos.text.l / SPRITE_MAP_WIDTH,
  r: srcPos.text.r / SPRITE_MAP_WIDTH,
  t: srcPos.text.t / SPRITE_MAP_HEIGHT,
  b: srcPos.text.b / SPRITE_MAP_HEIGHT,
};

const RESTART_UVS = {
  l: srcPos.restart.l / SPRITE_MAP_WIDTH,
  r: srcPos.restart.r / SPRITE_MAP_WIDTH,
  t: srcPos.restart.t / SPRITE_MAP_HEIGHT,
  b: srcPos.restart.b / SPRITE_MAP_HEIGHT,
};

const index = new Uint16Array([0, 1, 3, 1, 2, 3, 4, 5, 7, 5, 6, 7]);
const uvs = new Float32Array([
  TEXT_UVS.l, TEXT_UVS.t,
  TEXT_UVS.r, TEXT_UVS.t,
  TEXT_UVS.r, TEXT_UVS.b,
  TEXT_UVS.l, TEXT_UVS.b,
  RESTART_UVS.l, RESTART_UVS.t,
  RESTART_UVS.r, RESTART_UVS.t,
  RESTART_UVS.r, RESTART_UVS.b,
  RESTART_UVS.l, RESTART_UVS.b,
]);
const positions = new Float32Array([
  dstPos.text.l, dstPos.text.t, 0,
  dstPos.text.r, dstPos.text.t, 0,
  dstPos.text.r, dstPos.text.b, 0,
  dstPos.text.l, dstPos.text.b, 0,
  dstPos.restart.l, dstPos.restart.t, 0,
  dstPos.restart.r, dstPos.restart.t, 0,
  dstPos.restart.r, dstPos.restart.b, 0,
  dstPos.restart.l, dstPos.restart.b, 0,
]);
const geometry = new Geometry(index, positions, uvs);

export default class GameOverPanel extends Model {
  /**
   * Game over panel.
   */
  constructor(texture: Texture) {
    super(geometry, texture);
  }
}
