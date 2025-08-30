# AI Context Curator

> A specialized clipboard manager for AI sessions that solves the "AI amnesia" problem

**The Tool:** A simple copy-paste manager designed specifically for AI conversations - organize your prompts, handoffs, and context, then copy everything with one click.

**The Method:** Part of a proven workflow for maintaining continuity across AI coding sessions using structured handoffs.

<div align="center">
  
### [⬇️ Download Latest Release](https://github.com/Norsninja/ai-context-curator/releases/latest)
**Windows • Mac • Linux** | **2.3 MB** | **No installation required**

</div>

## Quick Start (60 Seconds)

1. **Download & Run** - No installation needed, just run the executable
2. **Add Your Main Prompt** - Your standard AI greeting/instructions
3. **Paste Your Last Handoff** - Add previous session's context as a cell
4. **Copy & Start** - Select all → Copy → Paste in AI chat → Full context restored

That's it. Your AI now knows exactly where you left off.

![Context Curator showing organized prompts and handoffs](images/screenshot-expanded.jpg)

## The Problem

Every AI coding session starts with amnesia. Your assistant doesn't remember:
- What you built yesterday
- The decisions you made  
- What's currently broken
- Where you left off

**Result:** You waste 20+ messages re-explaining context, getting contradictory suggestions, and losing momentum.

## The Solution: Structured Handoffs

After hundreds of AI pair programming sessions, I developed a simple system that creates **true continuity** between sessions.

### How It Works

```
Your Workflow:
├── Start: Copy context from Context Curator → Paste to AI
├── Work: AI has full context from message #1
├── End: Generate handoff with `/handoff` command
└── Save: Update Context Curator for tomorrow
```

### Real Example

**Without Context Curator:**
```
You: "Help me fix the scoring bug"
AI: "What language? What framework? Can you show me the code?"
[20+ messages establishing context...]
```

**With Context Curator:**
```
You: [Paste main prompt + handoff]
AI: "I see the scoring issue from yesterday in calculateScore() 
     where the multiplier isn't applied. Let me continue from there..."
[Immediately productive]
```

## Three Ways to Use This System

### 1. Just the App (Easiest)

Download Context Curator and start organizing your AI sessions immediately.

**What you get:**
- Main prompt field for your standard greeting
- Context cells for handoffs and notes
- Multi-project support
- One-click copy of selected context
- Auto-save everything locally

### 2. App + Handoff Template (Recommended)

Combine the app with structured handoffs for maximum effectiveness.

**Setup:**
```
your-project/
├── project/
│   ├── handoffs/       # Your session handoffs
│   └── templates/      # Handoff template
└── sprint.md          # Current tasks
```

**Daily workflow:**
1. Morning: Open Context Curator → Copy context → Start AI session
2. During: Work through sprint.md tasks
3. Evening: Generate handoff → Save to project → Update Context Curator

### 3. Full Integration (Power Users)

Add Claude Code commands for seamless handoff generation.

**Additional setup:**
- Configure `/handoff` command in Claude
- Auto-generate structured handoffs
- Commit handoffs to git for team sharing

## The Handoff Template

Every session ends with a structured handoff ([full template here](project/templates/HANDOFF_TEMPLATE.md)):

```markdown
# Session Handoff: [What you worked on]
**Date:** 2025-08-30
**Context Window:** 65% used

## 🎯 Critical Context
[Key thing next session needs to know]

## ✅ Accomplished
- Fixed auth bug in login.js:45
- Added user validation

## 🚧 Current State
- ✅ Login working
- ⏳ Password reset partially done
- ❌ Email sending blocked (no API key)

## 🚨 Next Steps
1. Get SendGrid API key from team
2. Complete password reset flow
```

## Core Principles

1. **Context Before Code** - Always review together before coding
2. **Handoffs Are Mandatory** - No exceptions, even for small sessions
3. **Never Pivot Late** - New ideas after 50% context = new session
4. **Structure Beats Memory** - Organized handoffs > AI memory systems

Why this works: Starting with full context uses ~5-10% of the window but saves 30-40% by avoiding re-explanation. The structured handoff ensures nothing important is lost between sessions.

## Installation

### Quick Install
Download the latest executable from [Releases](https://github.com/Norsninja/ai-context-curator/releases) - just run it, no installation needed.

### Build from Source
```bash
git clone https://github.com/Norsninja/ai-context-curator.git
cd ai-context-curator
npm install
npm start
```

### System Requirements
- Windows 10+, macOS 10.15+, or Linux
- 50MB disk space
- 256MB RAM

## FAQ

**Why not just use ChatGPT's memory or Claude's Projects?**  
Those help but aren't enough. They lack structure and you can't control what's remembered. Explicit handoffs ensure nothing important is lost.

**Can I use this with other AIs?**  
Yes! The methodology works with any AI that accepts text input.

**What about long projects?**  
Keep last 3-5 handoffs in Context Curator. Archive older ones to git. The sprint.md maintains overall project state.

## Data Storage

Your data is stored locally:
- **Windows:** `%APPDATA%/AI Context Curator/`
- **Mac:** `~/Library/Application Support/AI Context Curator/`
- **Linux:** `~/.config/AI Context Curator/`

Data persists across app updates. No cloud, no accounts, no tracking.

## Contributing

This tool emerged from real pain. If you have improvements, please share. MIT licensed - fork and adapt freely.

---

*Built for developers who value continuity over complexity in AI collaboration.*