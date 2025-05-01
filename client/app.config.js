//Ensures project is configured to use the new architecture to help prevenet unexpected behavior during builds
module.exports = {
  name: "Swipe",
  slug: "swipe",
  version: "1.0.0",
  sdkVersion: "52.0.0",
  platforms: ["ios", "android", "web"],
  newArchEnabled: true,
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.capstone.swipe",
    buildNumber: "1.0.0"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "com.capstone.swipe",
    versionCode: 1
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro"
  },
  extra: {
    // Any additional configuration can go here
    eas: {
      projectId: "7d9e06bb-831d-4cb5-886a-b86807de0422"
    }
  }
};
  
  