export const APP_NAME = 'MyFirst Account';
export const APP_VERSION = '1.28';

export type Language = 'en' | 'ta' | 'tanglish';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'AED' | 'MYR';

export type ThemeMode = 'dark' | 'gray';

export type DateFormat = 'DD-MM-YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY';

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
  dateFormat: DateFormat;
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
