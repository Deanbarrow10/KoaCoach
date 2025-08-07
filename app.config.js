import 'dotenv/config'; // 👈 this loads .env

export default {
  expo: {
    name: 'Koamigo',
    slug: 'koamigo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'koamigo',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.koamigo.app',
      buildNumber: '9',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMicrophoneUsageDescription:
          'This app uses the microphone to record your voice to talk to Koa.',
        NSSpeechRecognitionUsageDescription:
          'This app uses speech recognition to transcribe your voice to text.',
      },
    },
    android: {
      package: 'com.koamigo.app', // ✅ ADD THIS LINE
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
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
        projectId: '66204b94-313b-4330-b8f9-8f8b44c38376', // ✅ your new project ID
      },
      googleTTSKey: process.env.EXPO_PUBLIC_GOOGLE_TTS_KEY,
      openaiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    assetBundlePatterns: ['**/*'],
    owner: 'annegautham',
  },
};
