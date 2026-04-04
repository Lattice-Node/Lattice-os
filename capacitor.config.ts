import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lattice.protocol',
  appName: 'Lattice',
  webDir: 'out',
  server: {
    url: 'https://www.lattice-protocol.com/home',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;