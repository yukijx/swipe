module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo', '@babel/preset-typescript'],
      plugins: [
        ['module-resolver', {
          alias: {
            '@components': './src/components',
            '@screens': './src/pages',
            '@utils': './src/utils',
            '@assets': './assets',
          },
        }],
        'react-native-reanimated/plugin'
      ],
    };
  };