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

## The Handoff Workflow

This tool is part of a comprehensive handoff system for AI collaboration. Here's how it works:

### 1. The Handoff Template
Each project has a standardized handoff template (`project/templates/HANDOFF_TEMPLATE.md`) that captures:
- Critical context and current status
- What was accomplished vs what's in progress
- Known issues and next steps
- Technical details and file changes
- Progress metrics and session notes

### 2. Claude Code Integration
When ending a session, use the `/handoff` command in Claude Code to:
- Generate a structured handoff document from the template
- Automatically capture session context and accomplishments
- Save it to your `project/handoffs/` directory with timestamp

### 3. Context Curator Workflow
1. **Main Prompt**: Your standard AI greeting and collaboration guidelines
2. **Handoff Cell**: Paste the latest handoff for immediate context
3. **Supporting Cells**: Add project status, research notes, or specific focus areas
4. **Copy & Start**: Select relevant cells and paste to begin with full context

### Example Session Flow
```
Morning Session:
├── Start with Context Curator → Copy main prompt + yesterday's handoff
├── Work with Claude on feature implementation
├── End with `/handoff` command → Creates HANDOFF_20250830_FeatureComplete.md
└── Save handoff to Context Curator for tomorrow

Next Session:
├── Open Context Curator → Previous handoff ready
├── Copy context → Paste to Claude
└── Claude immediately understands where you left off
```

This creates seamless continuity across sessions, ensuring no context is lost and every session builds on the previous work.

## Why This Exists

After losing context repeatedly between AI sessions, I built this to maintain continuity. It's basically a clipboard manager optimized for AI session management, designed to work hand-in-hand with structured handoffs.

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