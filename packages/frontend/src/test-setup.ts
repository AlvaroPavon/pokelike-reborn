import "@testing-library/jest-dom/vitest";

// jsdom does not implement ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = () => {};

