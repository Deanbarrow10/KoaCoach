import "dotenv/config"; // 👈 this loads .env

export default {
  expo: {
    name: "Koamigo",
    slug: "koamigo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "koamigo",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.koamigo.app",
      buildNumber: "9",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription:
          "This app uses the microphone to record your voice to talk to Koa.",
        NSSpeechRecognitionUsageDescription:
          "This app uses speech recognition to transcribe your voice to text.",
        NSCameraUsageDescription:
          "This app uses the camera to scan meals and estimate calories.", // 👈 added
      },
    },
    android: {
      package: "com.koamigo.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-camera",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      eas: {
        projectId: "44f0fd08-e0d2-4058-a1da-65964f3d9fae",
      },
      googleTTSKey: process.env.EXPO_PUBLIC_GOOGLE_TTS_KEY,
      openaiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    assetBundlePatterns: ["**/*"],
    owner: "deanbarrow10",
  },
};
