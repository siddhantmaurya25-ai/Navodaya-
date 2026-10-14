import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Navodaya Vijेता Android wrapper.
 *
 * IMPORTANT: This app uses TanStack Start server routes. Deploy the web app first,
 * then replace the URL below with the real HTTPS deployment URL. Do not use a
 * localhost URL for a phone build. The native app will load this hosted app.
 */
const config: CapacitorConfig = {
  appId: 'in.navodayavijeta.app',
  appName: 'Navodaya Vijेता',
  webDir: 'dist/client',
  server: {
    url: 'https://REPLACE-WITH-YOUR-DEPLOYED-APP-URL',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
