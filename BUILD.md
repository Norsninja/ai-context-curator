# Building AI Context Curator

## Prerequisites for WSL Users

To build Windows executables from WSL, you need Wine:
```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine wine32 wine64
```

## Building the App

### Quick Build (Empty App)
```bash
npm install
npm run dist-win  # For Windows
npm run dist      # For all platforms
```

### Including Your Existing Data

The app stores data in localStorage, which Electron saves to disk. To include your data in a build:

1. **First, run the app and create some data:**
   ```bash
   npm start
   # Create projects and cells in the app
   # Close the app
   ```

2. **Find where your data was saved:**
   - WSL/Linux: `~/.config/AI Context Curator/`
   - Windows (from WSL): `/mnt/c/Users/[YourName]/AppData/Roaming/AI Context Curator/`

3. **localStorage data is NOT directly portable to builds**
   
   Since localStorage is browser-specific, you cannot simply copy it to include in builds.
   Instead, the app would need to be modified to export/import JSON files.

## Current Build Options

### For Personal Use
Just build the app and it will use your existing localStorage when installed:
```bash
npm run dist-win
# Install the exe on your machine
# Your data persists across app updates
```

### For Distribution
Build creates a clean app with no data:
```bash
npm run dist-win
# Users start fresh with empty projects
```

## Alternative: Portable Data Approach

If you want to share pre-configured data:
1. Run the app and set up your projects
2. Use the "Copy Selected" feature to export as text
3. Share the text with users to paste into their instance

## Build Output
After building, find your executable in:
- `dist/AI Context Curator Setup 3.0.0.exe` (installer)
- `dist/AI Context Curator 3.0.0.exe` (portable)

## Troubleshooting WSL Builds

If Wine fails, you can:
1. Build on actual Windows (not WSL)
2. Use GitHub Actions to build automatically
3. Transfer files to Windows and build there:
   ```bash
   # Copy project to Windows
   cp -r . /mnt/c/Users/[YourName]/Desktop/context-manager/
   # Then build in Windows PowerShell
   ```