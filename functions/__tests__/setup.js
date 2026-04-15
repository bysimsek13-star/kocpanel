import { vi } from 'vitest';

// firebase-admin/app mock
vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
}));

// firebase-admin/firestore mock
const mockBatch = {
  set:    vi.fn(),
  update: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
};

const mockDoc = {
  get:    vi.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
  set:    vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
  delete: vi.fn(() => Promise.resolve()),
};

const mockCollection = {
  doc:   vi.fn(() => mockDoc),
  where: vi.fn(() => ({ get: vi.fn(() => Promise.resolve({ docs: [] })) })),
  get:   vi.fn(() => Promise.resolve({ docs: [], size: 0 })),
  orderBy: vi.fn(() => ({ limit: vi.fn(() => ({ get: vi.fn(() => Promise.resolve({ docs: [] })) })) })),
};

const mockDb = {
  collection: vi.fn(() => mockCollection),
  batch:      vi.fn(() => mockBatch),
};

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  FieldValue:   {
    serverTimestamp: vi.fn(() => new Date()),
    increment:       vi.fn((n) => n),
  },
}));

// firebase-admin/auth mock
vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    createUser:                vi.fn(() => Promise.resolve({ uid: 'mock-uid' })),
    updateUser:                vi.fn(() => Promise.resolve()),
    deleteUser:                vi.fn(() => Promise.resolve()),
    generatePasswordResetLink: vi.fn(() => Promise.resolve('mock-link')),
    revokeRefreshTokens:       vi.fn(() => Promise.resolve()),
    getUserByEmail:            vi.fn(() => Promise.resolve({ uid: 'mock-uid', disabled: false })),
  })),
}));

// firebase-admin/messaging mock
vi.mock('firebase-admin/messaging', () => ({
  getMessaging: vi.fn(() => ({
    send:       vi.fn(() => Promise.resolve('projects/kocpaneli/messages/mock')),
    sendEach:   vi.fn(() => Promise.resolve({ responses: [] })),
  })),
}));

// firebase-functions/v2 mocks (CommonJS uyumlu)
// onCall hem tek argümanlı (handler) hem iki argümanlı (options, handler) formunu destekler
vi.mock('firebase-functions/v2/https', () => ({
  onCall:    (...args) => ({ _handler: typeof args[0] === 'function' ? args[0] : args[1] }),
  onRequest: (opts, handler) => ({ _handler: handler }),
  HttpsError: class HttpsError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  },
}));

vi.mock('firebase-functions/v2/firestore', () => ({
  onDocumentCreated: (_path, handler) => ({ _handler: handler }),
  onDocumentWritten:  (_path, handler) => ({ _handler: handler }),
}));

vi.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule: (_opts, handler) => ({ _handler: handler }),
}));

vi.mock('firebase-functions/v2', () => ({
  setGlobalOptions: vi.fn(),
}));

// agora-access-token mock
vi.mock('agora-access-token', () => ({
  RtcTokenBuilder: {
    buildTokenWithUid: vi.fn(() => 'mock-agora-token'),
  },
  RtcRole: { PUBLISHER: 1 },
}));
