/* eslint-disable no-undef, no-unused-vars */
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// jsdom 27 + vitest 4 + Node.js 22+: the jsdom Storage Proxy is completely
// non-functional (all methods undefined, ownKeys empty) due to Symbol identity
// divergence between Node.js's native require cache and Vite's module runner.
// Fix: replace window.localStorage with a Map-backed implementation that
// inherits from window.Storage.prototype so vi.spyOn(Storage.prototype, …)
// continues to work as expected in error-case tests.
(function installWorkingStorage() {
  const StorageProto = window.Storage.prototype;

  // Patch Storage.prototype methods to work on objects that carry _storeMap.
  // Original jsdom methods do an internal instanceof check that always fails
  // when called through Vite's module boundary, so we override them here.
  const methods = {
    setItem(key, value) {
      if (this._storeMap) this._storeMap.set(String(key), String(value));
    },
    getItem(key) {
      return this._storeMap ? (this._storeMap.get(String(key)) ?? null) : null;
    },
    removeItem(key) {
      if (this._storeMap) this._storeMap.delete(String(key));
    },
    clear() {
      if (this._storeMap) this._storeMap.clear();
    },
    key(n) {
      if (!this._storeMap) return null;
      return [...this._storeMap.keys()][n] ?? null;
    },
  };
  for (const [name, fn] of Object.entries(methods)) {
    Object.defineProperty(StorageProto, name, {
      value: fn, writable: true, configurable: true, enumerable: true,
    });
  }
  Object.defineProperty(StorageProto, 'length', {
    get() { return this._storeMap ? this._storeMap.size : 0; },
    configurable: true, enumerable: true,
  });

  function makeStorage() {
    const store = Object.create(StorageProto);
    Object.defineProperty(store, '_storeMap', {
      value: new Map(), writable: false, configurable: false, enumerable: false,
    });
    return store;
  }

  vi.stubGlobal('localStorage', makeStorage());
  vi.stubGlobal('sessionStorage', makeStorage());
}());

// Mock ResizeObserver as a proper class
global.ResizeObserver = class ResizeObserver {
  constructor(cb) { this._cb = cb; }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));


afterEach(() => {
  cleanup();
  // Reset location hash so router state doesn't bleed between tests
  window.location.hash = '';
  // Clear localStorage to prevent state bleed between tests
  if (typeof localStorage.clear === 'function') localStorage.clear();
});