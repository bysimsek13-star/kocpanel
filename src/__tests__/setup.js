import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ─── Tema mock'u — s objesinin her property'si string döner ──────────────────
const mockS = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (typeof prop !== 'string') return '#cccccc';
      if (prop === 'shadow' || prop === 'shadowCard') return '0 2px 8px rgba(0,0,0,0.1)';
      return '#cccccc';
    },
  }
);

// ThemeContext mock — tüm bileşenler useTheme() çağırır
const mockTemaListesi = [
  { id: 'light', label: 'Açık', accent: '#5B4FE8' },
  { id: 'dark', label: 'Koyu', accent: '#7C3AED' },
];

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    s: mockS,
    tema: 'light',
    temaId: 'light',
    setTema: vi.fn(),
    temaListesi: mockTemaListesi,
  }),
  ThemeProvider: ({ children }) => children,
  getS: () => mockS,
  geceMi: () => false,
}));

// AuthContext mock
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    kullanici: { uid: 'test-uid', email: 'test@test.com' },
    rol: 'koc',
    userData: { uid: 'test-uid', isim: 'Test Kullanıcı', rol: 'koc' },
    yukleniyor: false,
    cikisYap: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Medya sorgusu mock — useMobil() false döner
vi.mock('../hooks/useMediaQuery', () => ({
  useMobil: () => false,
  useTablet: () => false,
}));

// Firebase mock
vi.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-uid' } },
  functions: {},
  default: {},
}));

// Toast mock — GirisEkrani ve diğer bileşenler useToast() kullanır
vi.mock('../components/Toast', () => ({
  useToast: () => vi.fn(),
  ToastProvider: ({ children }) => children,
}));

// Firestore mock
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => () => {}),
  query: vi.fn(ref => ref),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  startAfter: vi.fn(() => ({})),
  startAt: vi.fn(() => ({})),
  endBefore: vi.fn(() => ({})),
  increment: vi.fn(v => v),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) },
}));

// Firebase Auth mock
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb({ uid: 'test-uid' });
    return () => {};
  }),
  signOut: vi.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'test-uid', email: 'test@test.com' } })
  ),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  setPersistence: vi.fn(() => Promise.resolve()),
  browserSessionPersistence: 'SESSION',
}));

// Firebase Functions mock
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: {} }))),
}));

// Firebase Messaging mock
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn(() => Promise.resolve('mock-fcm-token')),
  onMessage: vi.fn(() => () => {}),
  isSupported: vi.fn(() => Promise.resolve(true)),
}));

// React Router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/koc', state: {} }),
    useParams: () => ({ id: 'test-id' }),
  };
});

// Recharts mock — SVG render yerine basit div
vi.mock('recharts', () => ({
  LineChart: ({ children }) => children,
  Line: () => null,
  BarChart: ({ children }) => children,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => children,
  ReferenceLine: () => null,
  Cell: () => null,
  PieChart: ({ children }) => children,
  Pie: () => null,
}));

// window.matchMedia mock (useMobil hook için)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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
