const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// Library source lives two folders up: example/DropdownDemo -> example -> root
const libraryRoot = path.resolve(__dirname, '..', '..');

const config = {
  // Watch ONLY the library src (the files we edit), NOT the whole repo root.
  // Watching the root pulls in its large node_modules; with Watchman disabled
  // the node file-watcher then blows past the open-file limit (EMFILE).
  watchFolders: [path.resolve(libraryRoot, 'src')],
  resolver: {
    // Force every package to be resolved from this app's node_modules so that
    // React / RN are never duplicated when files from libraryRoot are imported.
    disableHierarchicalLookup: true,
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    // Disable Watchman: this sandbox keeps reaping the watchman daemon's socket,
    // which crashes Metro on an unhandled 'error' event. The node watcher is
    // stable here once the watch scope is small (see watchFolders above).
    useWatchman: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
