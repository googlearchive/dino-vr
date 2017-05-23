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

const VERSION = 1;

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(install());
});

async function install() {
  const cache = await caches.open(`dino-vr-${VERSION}`);
  const files = [
    '/',
    'index.html',
    'dist/app.min.js',
    'resources/button-press.mp3',
    'resources/hit.mp3',
    'resources/score-reached.mp3',
    'resources/sprite.png',
  ];

  return await cache.addAll(files);
}

self.addEventListener('fetch', (e) => {
  e.respondWith(fetchFromCache(e.request));
});

async function fetchFromCache(request) {
  const cache = await caches.open(`dino-vr-${VERSION}`);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  return fetch(request);
}
