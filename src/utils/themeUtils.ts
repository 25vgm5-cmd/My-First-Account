import type {CustomThemeColors, ThemeMode} from '../types/finance';
import {DEFAULT_CUSTOM_THEME, normalizeCustomTheme} from '../types/finance';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const CUSTOM_THEME_VAR_NAMES = [
  '--bg-canvas',
  '--bg-surface',
  '--bg-surface-elevated',
  '--bg-input',
  '--border-subtle',
  '--border-strong',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--accent-primary',
  '--accent-primary-hover',
  '--accent-soft',
  '--income-text',
  '--expense-text',
  '--warning-text',
  '--brand-blue',
] as const;

function parseHexRgb(hex: string): [number, number, number] {
  const safe = HEX_COLOR_RE.test(hex) ? hex : DEFAULT_CUSTOM_THEME.canvasBg;
  return [
    parseInt(safe.slice(1, 3), 16),
    parseInt(safe.slice(3, 5), 16),
    parseInt(safe.slice(5, 7), 16),
  ];
}

export function isLightHex(hex: string): boolean {
  const [r, g, b] = parseHexRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const [r1, g1, b1] = parseHexRgb(hexA);
  const [r2, g2, b2] = parseHexRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  const r = Math.round(r1 * (1 - w) + r2 * w);
  const g = Math.round(g1 * (1 - w) + g2 * w);
  const b = Math.round(b1 * (1 - w) + b2 * w);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getNextThemeMode(current: ThemeMode): ThemeMode {
  if (current === 'dark') return 'gray';
  if (current === 'gray') return 'custom';
  return 'dark';
}

export function getThemeSwitchLabel(current: ThemeMode): string {
  if (current === 'dark') return 'Switch to Gray Mode';
  if (current === 'gray') return 'Switch to Custom Mode';
  return 'Switch to Dark Mode';
}

export function applyThemeToDocument(
  theme: ThemeMode,
  customTheme?: Partial<CustomThemeColors> | null
): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const rootStyle = html.style;
  const normalizedCustom = normalizeCustomTheme(customTheme);

  if (theme === 'custom') {
    const surfaceIsLight = isLightHex(normalizedCustom.surfaceBg);
    const canvasIsLight = isLightHex(normalizedCustom.canvasBg);

    html.classList.remove('theme-dark', 'theme-gray');
    html.classList.add('theme-custom');
    if (canvasIsLight && surfaceIsLight) {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }

    const elevated = surfaceIsLight
      ? mixHex(normalizedCustom.surfaceBg, '#FFFFFF', 0.55)
      : mixHex(normalizedCustom.surfaceBg, normalizedCustom.textPrimary, 0.06);
    const inputBg = surfaceIsLight
      ? mixHex(normalizedCustom.surfaceBg, '#FFFFFF', 0.72)
      : mixHex(normalizedCustom.canvasBg, normalizedCustom.surfaceBg, 0.45);
    const borderSubtle = mixHex(normalizedCustom.surfaceBg, normalizedCustom.textPrimary, 0.16);
    const borderStrong = mixHex(normalizedCustom.surfaceBg, normalizedCustom.textPrimary, 0.3);
    const textSecondary = mixHex(normalizedCustom.textPrimary, normalizedCustom.surfaceBg, 0.18);
    const textMuted = mixHex(normalizedCustom.textPrimary, normalizedCustom.surfaceBg, 0.42);
    const accentHover = mixHex(normalizedCustom.accentPrimary, '#000000', 0.15);

    rootStyle.setProperty('--bg-canvas', normalizedCustom.canvasBg);
    rootStyle.setProperty('--bg-surface', normalizedCustom.surfaceBg);
    rootStyle.setProperty('--bg-surface-elevated', elevated);
    rootStyle.setProperty('--bg-input', inputBg);
    rootStyle.setProperty('--border-subtle', borderSubtle);
    rootStyle.setProperty('--border-strong', borderStrong);
    rootStyle.setProperty('--text-primary', normalizedCustom.textPrimary);
    rootStyle.setProperty('--text-secondary', textSecondary);
    rootStyle.setProperty('--text-muted', textMuted);
    rootStyle.setProperty('--accent-primary', normalizedCustom.accentPrimary);
    rootStyle.setProperty('--accent-primary-hover', accentHover);
    rootStyle.setProperty('--accent-soft', hexToRgba(normalizedCustom.accentPrimary, 0.14));
    rootStyle.setProperty('--income-text', surfaceIsLight ? '#047857' : '#34D399');
    rootStyle.setProperty('--expense-text', surfaceIsLight ? '#BE123C' : '#FB7185');
    rootStyle.setProperty('--warning-text', surfaceIsLight ? '#B45309' : '#FBBF24');
    rootStyle.setProperty('--brand-blue', normalizedCustom.brandTitle);
  } else {
    for (const name of CUSTOM_THEME_VAR_NAMES) {
      rootStyle.removeProperty(name);
    }
    html.classList.remove('theme-custom');
    if (theme === 'dark') {
      html.classList.add('theme-dark', 'dark');
      html.classList.remove('theme-gray');
    } else {
      html.classList.add('theme-gray');
      html.classList.remove('theme-dark', 'dark');
    }
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    const color =
      theme === 'dark'
        ? '#0A0E17'
        : theme === 'gray'
          ? '#E4E7EC'
          : normalizedCustom.canvasBg;
    metaTheme.setAttribute('content', color);
  }

  try {
    localStorage.setItem('mfa_preferred_theme', theme);
    localStorage.setItem('mfa_custom_theme', JSON.stringify(normalizedCustom));
  } catch {
    // Ignore storage quota issues
  }
}
