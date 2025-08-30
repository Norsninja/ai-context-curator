#!/bin/bash
# Build script for public release (no personal data)

echo "Building public release version (no pre-loaded data)..."

# Make sure no personal data is included
if [ -f "default-data.json" ]; then
    echo "⚠️  Removing default-data.json to ensure clean build..."
    rm -f default-data.json
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install electron-builder if needed
if ! npm list electron-builder >/dev/null 2>&1; then
    echo "Installing electron-builder..."
    npm install --save-dev electron-builder
fi

# Build for all platforms
echo "Building for all platforms..."
npm run dist

echo "✅ Public builds complete! Check ./dist/ folder"
echo "   These builds start with empty data (no personal info)"
ls -la dist/