import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lattice.protocol",
  appName: "Lattice",
  webDir: "out",
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
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "apple.com"],
    },
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",
      backgroundColor: "#00000000",
    },
  },
  ios: {
    contentInset: "never",
    scheme: "Lattice",
  },
};

export default config;
