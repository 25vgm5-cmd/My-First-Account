export const APP_NAME = 'MyFirst Account';
export const APP_VERSION = '1.32';

export type Language = 'en' | 'ta' | 'tanglish';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'AED' | 'MYR';

export type ThemeMode = 'dark' | 'gray' | 'custom';

export interface CustomThemeColors {
  canvasBg: string;
  surfaceBg: string;
  textPrimary: string;
  accentPrimary: string;
  brandTitle: string;
}

export const DEFAULT_CUSTOM_THEME: CustomThemeColors = {
  canvasBg: '#0B132B',
  surfaceBg: '#1C2541',
  textPrimary: '#F8FAFC',
  accentPrimary: '#10B981',
  brandTitle: '#38BDF8',
};

export const CUSTOM_THEME_PRESETS: Array<{
  name: string;
  subtitle: string;
  colors: CustomThemeColors;
}> = [
  {
    name: 'Midnight Indigo',
    subtitle: 'Deep Navy & Sky',
    colors: DEFAULT_CUSTOM_THEME,
  },
  {
    name: 'Emerald Forest',
    subtitle: 'Dark Pine & Mint',
    colors: {
      canvasBg: '#071712',
      surfaceBg: '#102A22',
      textPrimary: '#ECFDF5',
      accentPrimary: '#059669',
      brandTitle: '#34D399',
    },
  },
  {
    name: 'Warm Espresso',
    subtitle: 'Charcoal Cocoa & Amber',
    colors: {
      canvasBg: '#16110E',
      surfaceBg: '#241B16',
      textPrimary: '#FAF5F0',
      accentPrimary: '#D97706',
      brandTitle: '#FBBF24',
    },
  },
  {
    name: 'Soft Paper',
    subtitle: 'Clean Warm Light',
    colors: {
      canvasBg: '#EFECE6',
      surfaceBg: '#FAF8F5',
      textPrimary: '#1C1917',
      accentPrimary: '#059669',
      brandTitle: '#1D4ED8',
    },
  },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function normalizeCustomTheme(
  raw?: Partial<CustomThemeColors> | null
): CustomThemeColors {
  return {
    canvasBg:
      raw?.canvasBg && HEX_RE.test(raw.canvasBg)
        ? raw.canvasBg
        : DEFAULT_CUSTOM_THEME.canvasBg,
    surfaceBg:
      raw?.surfaceBg && HEX_RE.test(raw.surfaceBg)
        ? raw.surfaceBg
        : DEFAULT_CUSTOM_THEME.surfaceBg,
    textPrimary:
      raw?.textPrimary && HEX_RE.test(raw.textPrimary)
        ? raw.textPrimary
        : DEFAULT_CUSTOM_THEME.textPrimary,
    accentPrimary:
      raw?.accentPrimary && HEX_RE.test(raw.accentPrimary)
        ? raw.accentPrimary
        : DEFAULT_CUSTOM_THEME.accentPrimary,
    brandTitle:
      raw?.brandTitle && HEX_RE.test(raw.brandTitle)
        ? raw.brandTitle
        : DEFAULT_CUSTOM_THEME.brandTitle,
  };
}

export type DateFormat = 'DD-MM-YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY';

export type TimeFormat = '12h' | '24h';

export type NumberFormat = 'indian' | 'international';

export type TransactionType = 'income' | 'expense';

export interface FontZoomProfile {
  titles: number; // percentage 85..125
  amounts: number; // percentage 85..125
  lists: number; // percentage 85..125
}

export interface FontZoomSettings {
  mobile: FontZoomProfile;
  desktop: FontZoomProfile;
}

export const FONT_ZOOM_MIN = 85;
export const FONT_ZOOM_MAX = 125;
export const FONT_ZOOM_STEP = 5;

export const DEFAULT_FONT_ZOOM: FontZoomSettings = {
  mobile: {titles: 100, amounts: 100, lists: 100},
  desktop: {titles: 100, amounts: 100, lists: 100},
};

function clampZoomPercent(value: unknown): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 100;
  return Math.min(FONT_ZOOM_MAX, Math.max(FONT_ZOOM_MIN, num));
}

export function normalizeFontZoom(raw?: Partial<FontZoomSettings> | null): FontZoomSettings {
  return {
    mobile: {
      titles: clampZoomPercent(raw?.mobile?.titles),
      amounts: clampZoomPercent(raw?.mobile?.amounts),
      lists: clampZoomPercent(raw?.mobile?.lists),
    },
    desktop: {
      titles: clampZoomPercent(raw?.desktop?.titles),
      amounts: clampZoomPercent(raw?.desktop?.amounts),
      lists: clampZoomPercent(raw?.desktop?.lists),
    },
  };
}

export interface Transaction {
  id: string; // Unique Transaction ID e.g. TXN-20261122-A4F91C
  date: string; // ISO date YYYY-MM-DD
  amount: number;
  categoryId: string;
  type: TransactionType;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface TrashItem {
  id: string;
  transaction: Transaction;
  deletedAt: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isFixed: boolean; // true for mandatory "Others" category
  createdAt: number;
}

export interface AppSettings {
  language: Language;
  currency: CurrencyCode;
  theme: ThemeMode;
  customTheme?: CustomThemeColors;
  dateFormat: DateFormat;
  timeFormat?: TimeFormat;
  numberFormat: NumberFormat;
  openingBalance: number;
  openingBalanceDate: string;
  autoLockMinutes: number; // 0 = disabled, otherwise 1 | 5 | 15 | 30
  confirmOnSensitiveActions: boolean;
  autoMonthlyBackupEnabled: boolean;
  schemaVersion: number;
  fontZoom?: FontZoomSettings;
}

export interface EncryptedEnvelope {
  id: string;
  iv: string; // base64 12-byte IV
  ciphertext: string; // base64 AES-256-GCM ciphertext + 128-bit auth tag
  updatedAt: number;
}

export interface VaultMeta {
  id: 'primary';
  version: number;
  salt: string; // base64 16-byte salt
  iterations: number; // PBKDF2 iterations (default 600,000)
  benchmarkMs: number;
  wrappedDek: string; // base64 AES-256-GCM wrapped 256-bit DEK
  wrappedDekIv: string; // base64 12-byte IV
  pinEnabled: boolean;
  pinSalt?: string;
  pinIterations?: number;
  pinWrappedDek?: string;
  pinWrappedDekIv?: string;
  pinFailedAttempts?: number;
  createdAt: number;
  updatedAt: number;
}

export interface AutoBackupRecord {
  id: string; // YYYY-MM e.g. "2026-11"
  monthKey: string;
  createdAt: number;
  transactionCount: number;
  iv: string;
  ciphertext: string;
}

export interface SchemaMigrationRecord {
  version: number;
  name: string;
  appliedAt: number;
}

export interface VaultBackupPayload {
  format: 'myfirst-account-encrypted-backup';
  appVersion: string;
  schemaVersion: number;
  exportedAt: number;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
  trash: TrashItem[];
}

export interface EncryptedBackupFile {
  magic: 'MFA_ENC_V1';
  algorithm: 'AES-256-GCM';
  kdf: 'PBKDF2-HMAC-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  exportedAt: number;
}

export interface StatementBalanceSummary {
  accountSection: string;
  openingLabel: string;
  openingAmount: number | null;
  closingLabel: string;
  closingAmount: number | null;
  incomeTotal?: number;
  expenseTotal?: number;
  reconciled?: boolean | null;
  reconciliationDiff?: number | null;
}

export interface ImportRowPreview {
  rowIndex: number;
  rawLine: string;
  date: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  notes: string;
  accountSection?: string;
  isValid: boolean;
  validationErrors: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
  selected: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'add'
  | 'transactions'
  | 'monthly'
  | 'annual'
  | 'pdf-import'
  | 'backup'
  | 'security'
  | 'preferences';
