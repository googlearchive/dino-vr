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

const IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform);
const IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;

/**
 * Get random number.
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random(min: number, max: number): number {
  return Math.random() * (max - min + 1) + min;
}

/**
 * Return the current timestamp.
 */
function getTimeStamp() {
  return IS_IOS ? new Date().getTime() : performance.now();
}

/**
 * Vibrate on mobile devices for duration milliseconds.
 */
function vibrate(duration: number) {
  if (IS_MOBILE && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
}

export {randomInt, random, getTimeStamp, vibrate, IS_IOS, IS_MOBILE};
