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

import {gl} from './display';

export default class Geometry {
  private vaoId: WebGLVertexArrayObject | null
  vertexCount: number

  constructor(index: Uint16Array, positions: Float32Array, uvs: Float32Array) {
    this.vaoId = gl.createVertexArray();
    this.vertexCount = index.length;
    gl.bindVertexArray(this.vaoId);
    this.bindIndicesBuffer(index);
    this.bindAttributeBuffer(0, 3, positions);
    this.bindAttributeBuffer(1, 2, uvs);
    gl.bindVertexArray(null);
  }

  /**
   * Bind this geometry's vertex array and enable the attributes
   */
  bind() {
    gl.bindVertexArray(this.vaoId);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
  }

  /**
   * Unbind this geometry's vertex array and disable the attributes
   */
  unbind() {
    gl.bindVertexArray(null);
    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
  }

  /**
   * Bind some data to a vertex attribute
   */
  bindAttributeBuffer(attributeNumber: number, size: number, data: Float32Array) {
    const id = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, id);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attributeNumber, size, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /**
   * Bind data to an element index array
   */
  bindIndicesBuffer(data: Uint16Array) {
    const id = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, id);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }
}
