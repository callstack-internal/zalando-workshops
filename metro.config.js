const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {createSerializer} = require('react-native-bundle-discovery');

const mySerializer = createSerializer({
    includeCode: true, // Useful if you want to compare source/bundle code (but a report file will be larger)
    projectRoot: __dirname,
});

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    serializer: {
        customSerializer: mySerializer,
    }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
