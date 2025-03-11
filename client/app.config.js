//Ensures project is configured to use the new architecture to help prevenet unexpected behavior during builds
export default {
    expo: {
      name: "swipe-team-db",
      slug: "swipe-team-db",
      version: "1.0.0",
      sdkVersion: "52.0.0",
      platforms: ["ios", "android", "web"],
      newArchEnabled: true, 
      assetBundlePatterns: ["**/*"]
    }
  };
  
  