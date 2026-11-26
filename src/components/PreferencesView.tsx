import {Capacitor} from '@capacitor/core';
import React, {useEffect, useState} from 'react';
import {
  Check,
  CheckCircle2,
  Minus,
  Monitor,
  Palette,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Type,
} from 'lucide-react';
import {useVault} from '../context/VaultContext';
import {t} from '../i18n/translations';
import {
  APP_NAME,
  APP_VERSION,
  CUSTOM_THEME_PRESETS,
  DEFAULT_CUSTOM_THEME,
  DEFAULT_FONT_ZOOM,
  FONT_ZOOM_MAX,
  FONT_ZOOM_MIN,
  FONT_ZOOM_STEP,
  normalizeCustomTheme,
  normalizeFontZoom,
} from '../types/finance';
import type {
  CurrencyCode,
  CustomThemeColors,
  DateFormat,
  FontZoomProfile,
  Language,
  NumberFormat,
  ThemeMode,
  TimeFormat,
} from '../types/finance';
import {CURRENCY_META, formatMoney} from '../utils/formatters';
import {CategoriesView} from './CategoriesView';
import {PWAInstallButton} from './PWAComponents';

export const PreferencesView: React.FC = () => {
  const {settings, updateSettings, setTheme, setCustomTheme, setFontZoom} = useVault();

  const [language, setLanguage] = useState<Language>(settings.language);
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [dateFormat, setDateFormat] = useState<DateFormat>(settings.dateFormat);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(
    settings.timeFormat === '24h' ? '24h' : '12h'
  );
  const [numberFormat, setNumberFormat] = useState<NumberFormat>(settings.numberFormat);
  const [themeMode, setThemeMode] = useState<ThemeMode>(settings.theme);
  const [openingBalance, setOpeningBalance] = useState(String(settings.openingBalance));
  const [openingBalanceDate, setOpeningBalanceDate] = useState(settings.openingBalanceDate);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showFormatting, setShowFormatting] = useState(false);
  const [showOpeningBalance, setShowOpeningBalance] = useState(false);
  const [showTextZoom, setShowTextZoom] = useState(false);
  const [zoomDevice, setZoomDevice] = useState<'mobile' | 'desktop'>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'desktop' : 'mobile'
  );
  const [updateCheckStatus, setUpdateCheckStatus] = useState('');
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const currentZoom = normalizeFontZoom(settings.fontZoom);
  const activeProfile = currentZoom[zoomDevice];

  const handleAdjustZoom = (key: keyof FontZoomProfile, delta: number) => {
    const nextVal = Math.min(
      FONT_ZOOM_MAX,
      Math.max(FONT_ZOOM_MIN, activeProfile[key] + delta)
    );
    if (nextVal === activeProfile[key]) return;
    void setFontZoom({
      ...currentZoom,
      [zoomDevice]: {
        ...activeProfile,
        [key]: nextVal,
      },
    });
  };

  const handleResetDeviceZoom = () => {
    void setFontZoom({
      ...currentZoom,
      [zoomDevice]: {...DEFAULT_FONT_ZOOM[zoomDevice]},
    });
  };

  useEffect(() => {
    setLanguage(settings.language);
  }, [settings.language]);

  useEffect(() => {
    setCurrency(settings.currency);
  }, [settings.currency]);

  useEffect(() => {
    setDateFormat(settings.dateFormat);
  }, [settings.dateFormat]);

  useEffect(() => {
    setTimeFormat(settings.timeFormat === '24h' ? '24h' : '12h');
  }, [settings.timeFormat]);

  useEffect(() => {
    setNumberFormat(settings.numberFormat);
  }, [settings.numberFormat]);

  useEffect(() => {
    setThemeMode(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    setOpeningBalance(String(settings.openingBalance));
  }, [settings.openingBalance]);

  useEffect(() => {
    setOpeningBalanceDate(settings.openingBalanceDate);
  }, [settings.openingBalanceDate]);

  const activeCustomTheme = normalizeCustomTheme(settings.customTheme);

  const handleUpdateCustomColor = (key: keyof CustomThemeColors, color: string) => {
    void setCustomTheme({
      ...activeCustomTheme,
      [key]: color,
    });
  };

  const savedTimeFormat: TimeFormat = settings.timeFormat === '24h' ? '24h' : '12h';
  const parsedBalance = parseFloat(openingBalance || '0');
  const hasUnsavedChanges =
    language !== settings.language ||
    currency !== settings.currency ||
    dateFormat !== settings.dateFormat ||
    timeFormat !== savedTimeFormat ||
    numberFormat !== settings.numberFormat ||
    parsedBalance !== settings.openingBalance ||
    openingBalanceDate !== settings.openingBalanceDate;

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSavedMsg('');

    const val = parseFloat(openingBalance || '0');
    if (!Number.isFinite(val) || val < 0) {
      setErrorMsg('Opening Balance must be 0 or a valid positive amount.');
      return;
    }

    setSaving(true);
    try {
      await updateSettings({
        language,
        currency,
        dateFormat,
        timeFormat,
        numberFormat,
        openingBalance: val,
        openingBalanceDate,
      });
      setSavedMsg('Preferences saved successfully.');
      window.setTimeout(() => setSavedMsg(''), 3500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckForUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateCheckStatus('');
    try {
      if (Capacitor.isNativePlatform()) {
        setUpdateCheckStatus(`Running v${APP_VERSION} (Android APK). Install a newer APK build to update.`);
        return;
      }
      if (window.location.protocol === 'file:') {
        setUpdateCheckStatus(`Running v${APP_VERSION} (Standalone Single HTML).`);
        return;
      }
      if (!('serviceWorker' in navigator)) {
        setUpdateCheckStatus(`Running v${APP_VERSION}.`);
        return;
      }
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        setUpdateCheckStatus(`Running v${APP_VERSION}.`);
        return;
      }
      await reg.update();
      const nextWorker = reg.waiting || reg.installing;
      if (nextWorker) {
        setUpdateCheckStatus('New update detected — refreshing app...');
        nextWorker.postMessage({type: 'SKIP_WAITING'});
        window.setTimeout(() => window.location.reload(), 600);
      } else {
        setUpdateCheckStatus(`Up to date (v${APP_VERSION}) on this URL.`);
      }
    } catch {
      setUpdateCheckStatus('Offline or unable to reach update server right now.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="app-sticky-header -mt-6 pt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex flex-wrap items-center justify-between gap-4 pb-4 border-b app-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t(settings.language, 'navPreferences')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm app-text-muted">
            Customize language, currency, theme, date &amp; number formatting, opening balance, and categories.
          </p>
        </div>
        <PWAInstallButton alwaysShow />
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Left Column: Display & Regional Formatting + Opening Balance stacked */}
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border app-surface p-5">
              <button
                type="button"
                onClick={() => setShowFormatting((v) => !v)}
                aria-expanded={showFormatting}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">Display &amp; Regional Formatting</h2>
                  <p className="text-xs app-text-muted mt-0.5 font-mono-tabular truncate">
                    {language.toUpperCase()} · {currency} · {dateFormat} · {timeFormat === '24h' ? '24h' : '12h'}
                  </p>
                </div>
                <span className="w-7 h-7 rounded-lg border app-border app-surface-elevated flex items-center justify-center shrink-0 app-text-secondary">
                  {showFormatting ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {showFormatting && (
                <div className="mt-4 pt-4 border-t app-border space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as Language);
                  setSavedMsg('');
                }}
                className="w-full rounded-lg border app-input px-3 py-2 text-sm min-h-[42px]"
              >
                <option value="en">English</option>
                <option value="tanglish">Tanglish (தமிழ் + English)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value as CurrencyCode);
                  setSavedMsg('');
                }}
                className="w-full rounded-lg border app-input px-3 py-2 text-sm min-h-[42px]"
              >
                {Object.entries(CURRENCY_META).map(([code, meta]) => (
                  <option key={code} value={code}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => {
                  setDateFormat(e.target.value as DateFormat);
                  setSavedMsg('');
                }}
                className="w-full rounded-lg border app-input px-3 py-2 text-sm min-h-[42px]"
              >
                <option value="DD-MM-YYYY">DD-MM-YYYY (21-11-2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (21/11/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (11/22/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-11-22)</option>
                <option value="DD MMM YYYY">DD MMM YYYY (22 Nov 2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Number Format</label>
              <select
                value={numberFormat}
                onChange={(e) => {
                  setNumberFormat(e.target.value as NumberFormat);
                  setSavedMsg('');
                }}
                className="w-full rounded-lg border app-input px-3 py-2 text-sm min-h-[42px]"
              >
                  <option value="indian">Indian Grouping (1,00,000.00)</option>
                  <option value="international">International (100,000.00)</option>
                </select>
                  </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Time Format (Dashboard Clock)</label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border app-border app-surface-elevated">
                <button
                  type="button"
                  onClick={() => {
                    setTimeFormat('12h');
                    setSavedMsg('');
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors min-h-[38px] ${
                    timeFormat === '12h' ? 'bg-emerald-600 text-white' : 'app-text-muted'
                  }`}
                >
                  12h (AM / PM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeFormat('24h');
                    setSavedMsg('');
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors min-h-[38px] ${
                    timeFormat === '24h' ? 'bg-emerald-600 text-white' : 'app-text-muted'
                  }`}
                >
                  24h (00:00)
                </button>
              </div>
            </div>
                </div>
              )}
            </div>

            {/* Opening Balance Editor */}
            <div className="rounded-xl border app-surface p-5">
              <button
                type="button"
                onClick={() => setShowOpeningBalance((v) => !v)}
                aria-expanded={showOpeningBalance}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{t(settings.language, 'openingBalance')}</h2>
                  <p className="text-xs app-text-muted mt-0.5 font-mono-tabular truncate">
                    {formatMoney(
                      Number.isFinite(parsedBalance) ? parsedBalance : 0,
                      currency,
                      numberFormat
                    )}{' '}
                    · {openingBalanceDate}
                  </p>
                </div>
                <span className="w-7 h-7 rounded-lg border app-border app-surface-elevated flex items-center justify-center shrink-0 app-text-secondary">
                  {showOpeningBalance ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {showOpeningBalance && (
                <div className="mt-4 pt-4 border-t app-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Amount ({CURRENCY_META[currency].symbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={openingBalance}
                      onChange={(e) => {
                        setOpeningBalance(e.target.value);
                        setSavedMsg('');
                      }}
                      className="w-full rounded-lg border app-input px-3 py-2 text-sm font-mono-tabular min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">As of Date</label>
                    <input
                      type="date"
                      value={openingBalanceDate}
                      onChange={(e) => {
                        setOpeningBalanceDate(e.target.value);
                        setSavedMsg('');
                      }}
                      className="w-full rounded-lg border app-input px-3 py-2 text-sm font-mono-tabular min-h-[42px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Theme Mode (Dark, Gray, Custom) */}
          <div className="rounded-xl border app-surface p-5 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Theme Mode</h2>
              <span className="text-xs app-text-muted">Instant Switch</span>
            </div>
            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 ${
                themeMode !== 'custom' ? 'flex-1 lg:max-h-[120px]' : ''
              }`}
            >
              {(
                [
                  {id: 'dark', title: 'Dark Mode', sub: 'Deep Obsidian'},
                  {id: 'gray', title: 'Gray Mode', sub: 'Soft Ash Gray'},
                  {id: 'custom', title: 'Custom Mode', sub: 'Your Colors'},
                ] as Array<{id: ThemeMode; title: string; sub: string}>
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setThemeMode(mode.id);
                    void setTheme(mode.id);
                  }}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-left min-h-[72px] ${
                    themeMode !== 'custom' ? 'h-full' : ''
                  } ${
                    themeMode === mode.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'app-border'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      {mode.id === 'custom' && <Palette className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      <span className="truncate">{mode.title}</span>
                    </div>
                    <div className="text-xs app-text-muted mt-0.5 truncate">{mode.sub}</div>
                  </div>
                  {themeMode === mode.id && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>

            {themeMode === 'custom' && (
              <div className="pt-3 border-t app-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium app-text-secondary">
                    Customize Theme Colors
                  </span>
                  <button
                    type="button"
                    onClick={() => void setCustomTheme(DEFAULT_CUSTOM_THEME)}
                    className="inline-flex items-center gap-1 rounded-lg border app-border px-2.5 py-1 text-[11px] font-medium app-text-secondary hover:border-emerald-500/50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 gap-1.5">
                  {CUSTOM_THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => void setCustomTheme(preset.colors)}
                      className="flex items-center gap-2 rounded-lg border app-border app-surface-elevated px-2.5 py-1.5 text-left hover:border-emerald-500/50"
                    >
                      <span
                        className="w-4 h-4 rounded-sm border border-white/20 shrink-0"
                        style={{backgroundColor: preset.colors.canvasBg}}
                      />
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{backgroundColor: preset.colors.accentPrimary}}
                      />
                      <span className="text-[11px] font-medium truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* 5 Custom Color Pickers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      {key: 'canvasBg', label: 'Background'},
                      {key: 'surfaceBg', label: 'Cards / Panel'},
                      {key: 'textPrimary', label: 'Text Color'},
                      {key: 'accentPrimary', label: 'Accent / Save'},
                      {key: 'brandTitle', label: 'App Title'},
                    ] as Array<{key: keyof CustomThemeColors; label: string}>
                  ).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between gap-2 rounded-lg border app-border app-surface-elevated px-2.5 py-1.5 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium truncate">{item.label}</div>
                        <div className="text-[10px] font-mono-tabular app-text-muted uppercase">
                          {activeCustomTheme[item.key]}
                        </div>
                      </div>
                      <input
                        type="color"
                        value={activeCustomTheme[item.key]}
                        onChange={(e) => handleUpdateCustomColor(item.key, e.target.value)}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer shrink-0 p-0"
                        aria-label={item.label}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Size & Font Zoom (Separate Mobile & PC profiles, collapsed by default) */}
        <div className="rounded-xl border app-surface p-5">
        <button
          type="button"
          onClick={() => setShowTextZoom((v) => !v)}
          aria-expanded={showTextZoom}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-500 shrink-0" />
              <h2 className="text-base font-semibold">Text Size &amp; Font Zoom</h2>
            </div>
            <p className="text-xs app-text-muted mt-0.5 font-mono-tabular truncate">
              Mobile {currentZoom.mobile.titles}/{currentZoom.mobile.amounts}/{currentZoom.mobile.lists}% · PC{' '}
              {currentZoom.desktop.titles}/{currentZoom.desktop.amounts}/{currentZoom.desktop.lists}%
            </p>
          </div>
          <span className="w-7 h-7 rounded-lg border app-border app-surface-elevated flex items-center justify-center shrink-0 app-text-secondary">
            {showTextZoom ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        {showTextZoom && (
          <div className="mt-4 pt-4 border-t app-border space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border app-border app-surface-elevated">
                <button
                  type="button"
                  onClick={() => setZoomDevice('mobile')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    zoomDevice === 'mobile' ? 'bg-emerald-600 text-white' : 'app-text-muted'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomDevice('desktop')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    zoomDevice === 'desktop' ? 'bg-emerald-600 text-white' : 'app-text-muted'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC / Desktop</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetDeviceZoom}
                disabled={
                  activeProfile.titles === 100 &&
                  activeProfile.amounts === 100 &&
                  activeProfile.lists === 100
                }
                className="inline-flex items-center gap-1.5 rounded-lg border app-border px-3 py-1.5 text-xs font-medium app-text-secondary hover:border-emerald-500/50 disabled:opacity-45 min-h-[34px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset {zoomDevice === 'mobile' ? 'Mobile' : 'PC'} to 100%</span>
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'titles' as const,
                  label: 'Head & Section Titles',
                  hint: 'Page headings & card titles across screens',
                },
                {
                  key: 'amounts' as const,
                  label: 'Main Display Amounts',
                  hint: 'Dashboard Income, Expenses, Balance & report KPI totals',
                },
                {
                  key: 'lists' as const,
                  label: 'Record Lists & Tables',
                  hint: 'Recent entries, Ledger, PDF Import & Report rows',
                },
              ].map((item) => {
                const val = activeProfile[item.key];
                return (
                  <div
                    key={item.key}
                    className="rounded-xl border app-border app-surface-elevated px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs app-text-muted">{item.hint}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAdjustZoom(item.key, -FONT_ZOOM_STEP)}
                        disabled={val <= FONT_ZOOM_MIN}
                        aria-label={`Decrease ${item.label}`}
                        className="inline-flex items-center justify-center rounded-lg border app-border app-surface px-3 py-1.5 text-xs font-bold hover:border-emerald-500/50 disabled:opacity-40 min-w-[44px] min-h-[38px]"
                      >
                        A−
                      </button>
                      <span
                        className={`w-14 text-center text-xs font-mono-tabular font-semibold ${
                          val !== 100 ? 'text-emerald-400' : 'app-text-secondary'
                        }`}
                      >
                        {val}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustZoom(item.key, FONT_ZOOM_STEP)}
                        disabled={val >= FONT_ZOOM_MAX}
                        aria-label={`Increase ${item.label}`}
                        className="inline-flex items-center justify-center rounded-lg border app-border app-surface px-3 py-1.5 text-xs font-bold hover:border-emerald-500/50 disabled:opacity-40 min-w-[44px] min-h-[38px]"
                      >
                        A+
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Preview Strip for Selected Device */}
            <div className="rounded-xl border app-border p-4 space-y-2">
              <div className="text-[11px] uppercase tracking-wider app-text-muted font-medium">
                Live Preview ({zoomDevice === 'mobile' ? 'Mobile' : 'PC / Desktop'})
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span
                  className="font-display font-bold"
                  style={{fontSize: `calc(1.125rem * ${activeProfile.titles / 100})`}}
                >
                  Dashboard Title
                </span>
                <span
                  className="font-mono-tabular font-bold"
                  style={{
                    fontSize: `calc(1.375rem * ${activeProfile.amounts / 100})`,
                    color: 'var(--income-text)',
                  }}
                >
                  {formatMoney(1250, settings.currency, settings.numberFormat)}
                </span>
              </div>
              <div
                className="pt-2 border-t app-border flex items-center justify-between gap-3"
                style={{fontSize: `calc(0.875rem * ${activeProfile.lists / 100})`}}
              >
                <span className="truncate app-text-secondary">Salary · Monthly Credit</span>
                <span className="font-mono-tabular font-semibold shrink-0" style={{color: 'var(--income-text)'}}>
                  +{formatMoney(1250, settings.currency, settings.numberFormat)}
                </span>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Preferences Save Bar & Confirmation (Below Text Size & Font Zoom) */}
        <div className="rounded-xl border app-surface px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            {errorMsg ? (
              <span className="text-rose-400 font-medium">{errorMsg}</span>
            ) : savedMsg ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{savedMsg}</span>
              </span>
            ) : hasUnsavedChanges ? (
              <span className="text-amber-400 font-medium">
                You have unsaved changes. Click Save to apply.
              </span>
            ) : (
              <span className="app-text-muted">All preference settings are saved.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white min-h-[40px] disabled:opacity-60"
            style={{backgroundColor: 'var(--accent-primary)'}}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : t(settings.language, 'save')}</span>
          </button>
        </div>
      </form>

      {/* Application Information */}
      <div className="rounded-xl border app-surface p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Application Information</h2>
          <button
            type="button"
            disabled={checkingUpdate}
            onClick={() => void handleCheckForUpdate()}
            className="inline-flex items-center gap-1.5 rounded-lg border app-border px-3 py-1.5 text-xs font-medium app-text-secondary hover:border-emerald-500/50 min-h-[34px] disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? 'Checking...' : 'Check for Update'}</span>
          </button>
        </div>
        <div className="text-xs sm:text-sm app-text-muted space-y-1 leading-relaxed">
          <div className="inline-flex flex-col w-fit max-w-full">
            <span className="font-display text-base font-extrabold tracking-tight app-brand-title whitespace-nowrap">
              {APP_NAME} v{APP_VERSION}
            </span>
            <span className="self-end text-right text-[11px] font-medium app-text-secondary opacity-85 whitespace-nowrap">
              by AiStudio.Gm5
            </span>
          </div>
          {updateCheckStatus && (
            <div className="text-xs text-emerald-400 font-medium pt-0.5">{updateCheckStatus}</div>
          )}
          <div>
            Currency: {settings.currency === 'EUR' ? 'Euro (€)' : CURRENCY_META[settings.currency]?.label}
          </div>
          <div>Date format: {settings.dateFormat}</div>
          <p className="pt-1">
            Data is stored encrypted in this browser&apos;s IndexedDB. Clearing browser data will
            erase it, so create backups regularly.
          </p>
        </div>
      </div>

      <CategoriesView embedded />
    </div>
  );
};
