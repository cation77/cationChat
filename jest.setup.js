require('@testing-library/jest-dom');

// Mock global objects
global.Response = jest.fn(() => ({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  status: 200,
  ok: true,
  body: {
    getReader: jest.fn(() => ({
      read: jest.fn(() => Promise.resolve({ done: true, value: null })),
      releaseLock: jest.fn(),
    })),
  },
}));

global.TextEncoder = jest.fn(() => ({
  encode: jest.fn((str) => new Uint8Array(Buffer.from(str))),
}));

global.TextDecoder = jest.fn(() => ({
  decode: jest.fn((buffer) => Buffer.from(buffer).toString()),
}));

global.ReadableStream = jest.fn(() => ({
  getReader: jest.fn(() => ({
    read: jest.fn(() => Promise.resolve({ done: true, value: null })),
    releaseLock: jest.fn(),
  })),
}));

global.EventSource = jest.fn(() => ({
  onopen: jest.fn(),
  onmessage: jest.fn(),
  onerror: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return null; // Simplified mock without JSX
  },
}));

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    ok: true,
    body: null,
  })
);
