import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lattice.protocol",
  appName: "Lattice",
  webDir: "out",
  server: {
    url: "https://www.lattice-protocol.com/home",
    cleartext: false,
    allowNavigation: [
      "accounts.google.com",
      "*.google.com",
      "*.googleapis.com",
      "appleid.apple.com",
      "*.apple.com",
      "*.icloud.com",
      "www.lattice-protocol.com",
    ],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#6c71e8",
    },
    Camera: {
      presentationStyle: "fullScreen",
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "REPLACE_WITH_GOOGLE_WEB_CLIENT_ID",
      forceCodeForRefreshToken: true,
    },
  },
  ios: {
    contentInset: "automatic",
    scheme: "Lattice",
  },
};

export default config;
