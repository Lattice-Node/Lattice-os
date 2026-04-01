import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lattice.protocol',
  ios: { minWebViewVersion: 14 },
  appName: 'Lattice',
  webDir: 'out',
  server: {
    url: 'https://www.lattice-protocol.com',
    cleartext: false,
  },
};

export default config;
