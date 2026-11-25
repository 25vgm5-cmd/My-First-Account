import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aistudiogm5.myfirstaccount',
  appName: 'MyFirst Account',
  webDir: 'dist',
  backgroundColor: '#0A0E17',
  android: {
    backgroundColor: '#0A0E17',
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0A0E17',
    },
  },
};

export default config;
