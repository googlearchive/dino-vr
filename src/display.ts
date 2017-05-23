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

//// GL capture test ////

// const log: any[] = [];

// const origGetContext = HTMLCanvasElement.prototype.getContext;
// const methodProxies = new WeakMap();

// HTMLCanvasElement.prototype.getContext = function(id, attr) {
//   const context = origGetContext.call(this, id, attr);
//   return new Proxy(context, {
//     get: (target, key) => {
//       log.push(['GET', key]);
//       if (typeof target[key] === 'function') {
//         if (!methodProxies.has(target[key])) {
//           methodProxies.set(target[key], new Proxy(target[key], {
//             apply: (target, oThis, args) => {
//               log.push(['CALL', key, args]);
//               return context[key](...args);
//             }
//           }));
//         }
//         return methodProxies.get(target[key]);
//       }
//       return target[key];
//     },
//     set: (target, key, value, receiver): boolean => {
//       log.push(['SET', key])
//       target[key] = value;
//       return true;
//     }
//   });
// }

////////////////////

const canvas: HTMLCanvasElement = document.createElement('canvas');
const context: WebGL2RenderingContext | null = canvas.getContext('webgl2');

if (context === null) {
  throw new Error(`Couldn't get a WebGL2 context`);
}

const gl: WebGL2RenderingContext = context;

canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

document.body.appendChild(canvas);

export {canvas, gl};
