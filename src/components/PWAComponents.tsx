import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import {Check, CheckCircle2, Copy, Download, Smartphone, WifiOff, X} from 'lucide-react';
import {usePWAInstall} from '../hooks/usePWAInstall';
import {useOnlineStatus} from '../hooks/useOnlineStatus';

export const PWAInstallButton: React.FC<{
  compact?: boolean;
  alwaysShow?: boolean;
}> = ({compact = false, alwaysShow = false}) => {
  const {isInstallable, isInstalled, isIOS, isIPad, isInIframe, install} = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (isInstalled) {
    if (!alwaysShow) return null;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-500 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Installed on Device</span>
      </span>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted && alwaysShow) {
        return;
      }
      return;
    }
    setShowGuide(true);
  };

  const handleCopyUrl = async () => {
    const targetUrl = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      try {
        const input = document.createElement('textarea');
        input.value = targetUrl;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopiedUrl(true);
        window.setTimeout(() => setCopiedUrl(false), 2500);
      } catch {
        setCopiedUrl(false);
      }
    }
  };

  const canShareSheet =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function' && !isInIframe;

  const handleOpenShareSheet = async () => {
    if (!canShareSheet) return;
    try {
      await navigator.share({
        title: 'MyFirst Account',
        url: window.location.origin,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  // Show in sidebar/header whenever native prompt is ready or on iOS/iPadOS;
  // in Preferences (alwaysShow), always render so users can install or view instructions anytime.
  if (!isInstallable && !isIOS && !alwaysShow) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Install MyFirst Account as a standalone offline app on this phone, iPad, or computer"
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 min-h-[40px] ${
          isInstallable
            ? 'text-white shadow-sm hover:opacity-90'
            : 'border app-border app-text-secondary hover:border-emerald-500/50'
        }`}
        style={isInstallable ? {backgroundColor: 'var(--accent-primary)'} : undefined}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{compact ? 'Install' : 'Install App to Device'}</span>
      </button>

      {showGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="animate-mfa-modal w-full max-w-md rounded-2xl border app-surface p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" style={{color: 'var(--accent-primary)'}} />
                  <span>{isIPad ? 'Install on iPad' : 'Install App to Device'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="p-2 rounded-lg app-text-muted hover:opacity-75 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Close install guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isInIframe && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-2">
                  <p>
                    You are currently viewing inside a preview frame, so the browser disables app
                    installation here. Open the app URL directly in a normal Safari, Chrome, or Edge
                    tab to install.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 font-semibold text-amber-200 hover:bg-amber-500/25"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'App URL Copied!' : 'Copy App URL'}</span>
                  </button>
                </div>
              )}

              {isIOS ? (
                <div className="space-y-3">
                  <ol className="space-y-2 text-xs sm:text-sm app-text-secondary list-decimal list-inside">
                    <li>
                      Open this app directly in <strong>Safari</strong> on your{' '}
                      {isIPad ? 'iPad' : 'iPhone or iPad'} (not inside Chrome or preview frame).
                    </li>
                    <li>
                      Tap the <strong>Share</strong> icon (square with upward arrow{' '}
                      {isIPad ? 'at the top-right address bar' : 'in the Safari toolbar'}).
                    </li>
                    <li>
                      Scroll down and tap <strong>Add to Home Screen</strong> → <strong>Add</strong>.
                    </li>
                  </ol>
                  {canShareSheet && (
                    <button
                      type="button"
                      onClick={() => void handleOpenShareSheet()}
                      className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 min-h-[40px]"
                    >
                      Open Safari Share Menu
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-xs app-text-secondary">
                  <div className="rounded-xl border app-border app-surface-elevated p-3 space-y-1">
                    <div className="font-semibold">Android (Chrome / Edge)</div>
                    <p className="app-text-muted">
                      Open this link directly in Chrome, tap <strong>⋮</strong> (top-right menu),
                      and select <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
                    </p>
                  </div>
                  <div className="rounded-xl border app-border app-surface-elevated p-3 space-y-1">
                    <div className="font-semibold">Desktop (Chrome / Edge)</div>
                    <p className="app-text-muted">
                      Open this link in its own browser tab and click the <strong>Install</strong>{' '}
                      icon in the right side of the address bar, or open browser menu →{' '}
                      <strong>Cast, save, and share → Install page as app</strong>.
                    </p>
                  </div>
                  <div className="rounded-xl border app-border app-surface-elevated p-3 space-y-1">
                    <div className="font-semibold">iPhone / iPad (Safari)</div>
                    <p className="app-text-muted">
                      Open in <strong>Safari</strong> → tap <strong>Share</strong> (top-right on
                      iPad) → <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full rounded-lg py-2.5 text-xs font-semibold text-white min-h-[40px]"
                style={{backgroundColor: 'var(--accent-primary)'}}
              >
                Got it
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="no-print fixed bottom-20 lg:bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-600 px-3 py-2 text-xs font-medium text-white shadow-lg">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode — Local encrypted vault active</span>
    </div>
  );
};
