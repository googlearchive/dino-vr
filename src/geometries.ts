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

const quadPositions = new Float32Array([0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0]);
const quadUVs = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);
const quadIndex = new Uint16Array([0, 1, 2, 0, 2, 3]);
const quad = new Geometry(quadIndex, quadPositions, quadUVs);

const ribbonSegments = 40;
const ribbonInnerRadius = 7;
const ribbonOuterRadius = 12;
const ribbonPositions = new Float32Array((ribbonSegments + 1) * 2 * 3);
const ribbonUVs = new Float32Array((ribbonSegments + 1) * 2 * 2);
const ribbonIndex = new Uint16Array(ribbonSegments * 2 * 3);
for (let i = 0; i < ribbonSegments; i++) {
  const angle = -2 * Math.PI * (i / ribbonSegments);
  ribbonPositions[(i * 6) + 0] = Math.sin(angle) * ribbonInnerRadius;
  ribbonPositions[(i * 6) + 1] = 0;
  ribbonPositions[(i * 6) + 2] = Math.cos(angle) * ribbonInnerRadius;

  ribbonPositions[(i * 6) + 3] = Math.sin(angle) * ribbonOuterRadius;
  ribbonPositions[(i * 6) + 4] = 0;
  ribbonPositions[(i * 6) + 5] = Math.cos(angle) * ribbonOuterRadius;

  ribbonUVs[(i * 4) + 0] = i / ribbonSegments;
  ribbonUVs[(i * 4) + 1] = 1;
  ribbonUVs[(i * 4) + 2] = i / ribbonSegments;
  ribbonUVs[(i * 4) + 3] = 0;

  ribbonIndex[(i * 6) + 0] = (i * 2) + 0;
  ribbonIndex[(i * 6) + 1] = (i * 2) + 1;
  ribbonIndex[(i * 6) + 2] = (i * 2) + 2;

  ribbonIndex[(i * 6) + 3] = (i * 2) + 1;
  ribbonIndex[(i * 6) + 4] = (i * 2) + 3;
  ribbonIndex[(i * 6) + 5] = (i * 2) + 2;
}

ribbonPositions[(ribbonSegments * 6) + 0] = 0;
ribbonPositions[(ribbonSegments * 6) + 1] = 0;
ribbonPositions[(ribbonSegments * 6) + 2] = ribbonInnerRadius;

ribbonPositions[(ribbonSegments * 6) + 3] = 0;
ribbonPositions[(ribbonSegments * 6) + 4] = 0;
ribbonPositions[(ribbonSegments * 6) + 5] = ribbonOuterRadius;

ribbonUVs[(ribbonSegments * 4) + 0] = 1;
ribbonUVs[(ribbonSegments * 4) + 1] = 1;
ribbonUVs[(ribbonSegments * 4) + 2] = 1;
ribbonUVs[(ribbonSegments * 4) + 3] = 0;

const ribbon = new Geometry(ribbonIndex, ribbonPositions, ribbonUVs);
export {quad, ribbon};
