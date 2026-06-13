import "@testing-library/jest-dom";
import { vi } from "vitest";

// Silencia errores de consola que no son bugs reales en tests
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
  originalError(...args);
};

// Mock de window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de IntersectionObserver (usado en PinGrid)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de navigator.share y clipboard
Object.defineProperty(navigator, "share", { writable: true, value: undefined });
Object.defineProperty(navigator, "clipboard", {
  writable: true,
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
});
