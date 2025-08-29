# AI Context Curator

A minimal desktop widget for managing context between AI coding sessions. Never lose your conversation flow again!

## Problem It Solves

When working with AI coding assistants (Claude Code, GitHub Copilot, ChatGPT), context is lost between sessions. This tool provides a simple way to:
- Store your main project context
- Save handoff messages between sessions
- Visually select and combine context
- Copy everything to clipboard for your next AI session

## Features

- 📌 **Pinned Main Prompt** - Your stable baseline context
- 📝 **Handoff Cells** - Modular context snippets you can mix and match
- ✅ **Visual Selection** - Checkboxes to choose what to include
- 🔄 **Collapsible Interface** - Manage many cells efficiently
- 💾 **Auto-save** - Never lose your work
- 📋 **One-click Copy** - Combined context ready for paste

## Installation

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm start
   ```

## Usage

1. **Set Main Prompt**: Click the main prompt area to set your baseline context
2. **Add Cells**: Click "+ Add Cell" to create handoff messages
3. **Edit Content**: Click any cell to edit its content inline
4. **Select & Copy**: Check the boxes for items you want, then click "Copy Selected"
5. **Paste in AI**: Start your new AI session with perfect context!

## Tech Stack

- **Electron** - Cross-platform desktop app
- **Vanilla JavaScript** - No framework complexity
- **localStorage** - Simple persistent storage

## Compatible With

- Claude Code
- GitHub Copilot CLI
- ChatGPT Code Interpreter
- Any AI coding assistant that accepts text input

## Contributing

This is a simple tool built to solve a specific problem. Feel free to fork and adapt it to your needs!

## License

MIT

---

Built to solve the context continuity problem in AI-assisted development.