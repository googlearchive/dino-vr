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

export default class ShaderProgram  {
  private programId: WebGLProgram | null
  private uniformLocations: Map<string, WebGLUniformLocation>

  constructor(vSource: string, fSource: string) {
    const vertexShaderId = this.compileShader(vSource, gl.VERTEX_SHADER);
    const fragmentShaderId = this.compileShader(fSource, gl.FRAGMENT_SHADER);
    const programId = gl.createProgram();
    gl.attachShader(programId, vertexShaderId);
    gl.attachShader(programId, fragmentShaderId);
    gl.linkProgram(programId);
    if (!gl.getProgramParameter(programId, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(programId);
      throw new Error('Could not link shader program. \n\n' + info);
    }
    gl.validateProgram(programId);
    if (!gl.getProgramParameter(programId, gl.VALIDATE_STATUS)) {
      const info = gl.getProgramInfoLog(programId);
      throw new Error('Could not validate shader program. \n\n' + info);
    }
    this.programId = programId;
    this.uniformLocations = new Map();
    this.getUniformLocations();
  }

  /**
   * Get the location of each uniform used in the shader and store it in a Map
   */
  getUniformLocations() {
    const numUniforms = gl.getProgramParameter(this.programId, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(this.programId, i);
      if (info === null) {
        throw new Error(`Couldn't get uniform info`);
      }
      const location = this.getUniformLocation(info.name);
      if (location) {
        this.uniformLocations.set(info.name, location);
      }
    }
  }

  /**
   * Get the location of a named uniform
   */
  getUniformLocation(name: string) {
    return gl.getUniformLocation(this.programId, name);
  }

  /**
   * Make this shader program the active program
   */
  start() {
    gl.useProgram(this.programId);
  }

  /**
   * Deactivate the shader program
   */
  stop() {
    gl.useProgram(null);
  }

  /**
   * Compile a shader
   */
  compileShader(source: string, type: number) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Couldn't compiler shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  /**
   * Set a vec2 uniform value
   */
  uniformFloat(name: string, value: number) {
    if (!this.uniformLocations.has(name)) {
      throw new Error(`Tried to set unknown uniform ${name}`);
    }
    gl.uniform1fv(this.uniformLocations.get(name)!, [value]);
  }

  /**
   * Set a vec2 uniform value
   */
  uniform2fv(name: string, value: Float32Array) {
    if (!this.uniformLocations.has(name)) {
      throw new Error(`Tried to set unknown uniform ${name}`);
    }
    gl.uniform2fv(this.uniformLocations.get(name)!, value);
  }

  /**
   * Set a vec3 uniform value
   */
  uniform3fv(name: string, value: Float32Array) {
    if (!this.uniformLocations.has(name)) {
      throw new Error(`Tried to set unknown uniform ${name}`);
    }
    gl.uniform3fv(this.uniformLocations.get(name)!, value);
  }

  /**
   * Set a mat4 uniform value
   */
  uniformMatrix4fv(name: string, value: Float32Array) {
    if (!this.uniformLocations.has(name)) {
      throw new Error(`Tried to set unknown uniform ${name}`);
    }
    gl.uniformMatrix4fv(this.uniformLocations.get(name)!, false, value);
  }
}
