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
      iosClientId: "643476365562-f0868s7f84dpghofgrkd3t68like1pb0.apps.googleusercontent.com",
      serverClientId: "643476365562-bk9t1bbga3jkd4i440tutbl8v9ca0tsd.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
  ios: {
    contentInset: "automatic",
    scheme: "Lattice",
  },
};

export default config;
