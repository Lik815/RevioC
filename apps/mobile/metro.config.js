const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Resolve modules from the workspace root so pnpm symlinks work
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Explicit mappings for packages not symlinked by pnpm into project node_modules
config.resolver.extraNodeModules = {
  '@react-native/assets-registry': path.resolve(
    workspaceRoot,
    'node_modules/.pnpm/@react-native+assets-registry@0.74.87/node_modules/@react-native/assets-registry',
  ),
};

// Follow symlinks (required for pnpm)
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
