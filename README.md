# AI Context Curator

A lightweight clipboard manager for maintaining session continuity with AI assistants. Built for developers who want consistent context across AI conversations.

<div align="center">
  
### [⬇️ Download Latest Release](https://github.com/Norsninja/ai-context-curator/releases/latest)
**Windows • Mac • Linux**

</div>

## What It Is

A simple tool to manage your AI session context. Keep your main prompt and session handoffs organized, then copy them together to start each AI conversation with full context.

## How It Works

1. **Main Prompt** - Your standard greeting/instructions that you use every session
2. **Context Cells** - Add handoff messages, project status, or any context you need
3. **Copy & Paste** - Select what you need and paste into your AI chat

That's it. No complicated features, just a clean way to manage AI session continuity.

## Screenshots

### Your projects and context organized
![Expanded view showing main prompt and context cells](images/screenshot-expanded.jpg)

### Multiple projects, collapsed view  
![Collapsed view showing multiple projects](images/screenshot-collapsed.jpg)

## Installation

### Download (Easiest)
Get the latest executable from [Releases](https://github.com/Norsninja/ai-context-curator/releases) - just download and run.

### Build from source
```bash
git clone https://github.com/Norsninja/ai-context-curator.git
cd ai-context-curator
npm install
npm start
```

## Usage Example

**Main Prompt:**
```
Hi! Please review the handoff context first.
You're a valued team member, be methodical.
Let's discuss what you learn before diving in.
```

**Cell 1 - Project Status:**
```
Building news aggregator with PostgreSQL
✅ RSS feeds working (40k articles)
🚧 Working on theater classification
📊 System 99% complete
```

**Cell 2 - Session Handoff:**
```
Last session: Implemented heat calculation
Issue: Pipeline step 5.6 not executing
Check: src/services/theater-heat.ts
Next: Debug pipeline integration
```

Select both → Copy → Paste in AI chat → Full context restored!

## Features

- **Multi-project** - Keep different projects separate
- **Auto-save** - Never lose your context
- **Collapsed view** - See everything at a glance
- **Keyboard shortcuts** - Enter to save, Escape to cancel
- **Local storage** - Your data stays on your machine

## Why This Exists

After losing context repeatedly between AI sessions, I built this to maintain continuity. It follows a simple workflow:
1. Start each session with your main prompt
2. Include relevant handoff context
3. AI has full understanding from message one

It's basically a clipboard manager optimized for AI session management.

## Data Location

- **Windows**: `%APPDATA%/AI Context Curator/`
- **Mac**: `~/Library/Application Support/AI Context Curator/`
- **Linux**: `~/.config/AI Context Curator/`

Your data persists across app updates.

## Contributing

This is a personal tool shared with the community. Feel free to fork and adapt to your workflow.

## License

MIT - Use freely

---

*Built for developers who value simple, focused tools.*