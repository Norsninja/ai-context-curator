#!/bin/bash
# Build script for personal version with pre-loaded data

echo "Building personal version with your data..."

# Find your curator data
DATA_PATHS=(
    "$HOME/.config/context-manager/curator-data.json"
    "$HOME/AppData/Roaming/context-manager/curator-data.json"
    "$APPDATA/context-manager/curator-data.json"
)

FOUND=false
for path in "${DATA_PATHS[@]}"; do
    if [ -f "$path" ]; then
        echo "Found your data at: $path"
        cp "$path" ./default-data.json
        FOUND=true
        break
    fi
done

if [ "$FOUND" = false ]; then
    echo "⚠️  No existing data found. Building without pre-loaded data."
    echo "   Run the app once to create some data, then rebuild."
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

# Build for Windows (since you're on WSL)
echo "Building Windows executable..."
npm run dist-win

echo "✅ Build complete! Your personalized exe is in ./dist/"
echo "   Look for: AI Context Curator*.exe"
ls -la dist/*.exe 2>/dev/null || echo "Build may have failed - check output above"

# Clean up default-data.json (don't commit it)
if [ -f "default-data.json" ]; then
    echo "Keeping default-data.json for your personal use (not tracked by git)"
fi