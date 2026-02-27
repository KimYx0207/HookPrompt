[English](./README_EN.md) | [中文](./README.md)

# Auto Prompt Optimization Hook

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/KimYx0207/HookPrompt?style=social)
![GitHub forks](https://img.shields.io/github/forks/KimYx0207/HookPrompt?style=social)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Language](https://img.shields.io/badge/language-JavaScript-orange.svg)

**Google's 68-page Prompt Engineering Guide + 5-Task Meta-Prompting → Auto-executing Hook**

</div>

---

> Turn Google's 68-page prompt engineering bible + 5-task meta-prompting into an auto-executing Hook.
> Just type casual phrases — AI automatically translates them into professional prompts.

---

## How It Works

```
User types: "make a login"
    ↓
Hook intercepts
    ↓
Applies optimization logic (CTF formula, CoT/ToT selection)
    ↓
Outputs structured professional prompt:
    📝 Original Input: make a login
    🔄 Optimized Understanding:
       - Context: Web app, production-grade security
       - Task: Implement JWT auth + bcrypt encryption
       - Format: Complete code + tests
    ✅ Optimized Full Prompt: [detailed professional prompt]
    ↓
Claude receives the optimized version
    ↓
Claude auto-executes the task
```

## Quick Start

### Method 1: Use in This Project
1. Open this project directory with Claude Code
2. Run tests (optional): `node test-hook.js`
3. Type anything (>10 characters) to test
4. Watch the Hook display the optimization process

### Method 2: Copy to Another Project
```bash
cp -r .claude /your/project/root/
```

### Method 3: Global Configuration (Recommended)

**Windows:**
```powershell
Copy-Item -Recurse .claude\hooks /c/Users/admin\.claude\hooks
Copy-Item .claude\prompt-optimizer-meta.md /c/Users/admin\.claude```

**Mac/Linux:**
```bash
mkdir -p ~/.claude/hooks
cp .claude/hooks/* ~/.claude/hooks/
cp .claude/prompt-optimizer-meta.md ~/.claude/
chmod +x ~/.claude/hooks/*.sh
```

Then edit `~/.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["/path/to/.claude/hooks/user-prompt-submit.js"]
          }
        ]
      }
    ]
  }
}
```

> **Important**: Key must be `UserPromptSubmit` (PascalCase), value must be an array with `type: "command"` field.

## Key Features

### Cross-Platform Support
- **Node.js** (recommended): Windows/Mac/Linux
- **Bash**: Mac/Linux native

### Smart Filtering
| Input Type | Optimized? |
|-----------|-----------|
| Built-in commands (`/clear`, `/help`) | ❌ Skip |
| Short questions (<10 chars) | ❌ Skip |
| Simple replies ("ok", "continue") | ❌ Skip |
| Normal requirement descriptions | ✅ Optimize |

### Auto-Execution
After optimization, Claude automatically executes the task — no second confirmation needed.

## File Structure

```
.claude/
├── hooks/
│   ├── user-prompt-submit.js    ← Node.js version (recommended)
│   └── user-prompt-submit.sh    ← Bash version (Mac/Linux)
├── prompt-optimizer-meta.md     ← Optimization prompt template
├── settings.json                ← Hook configuration
├── settings.json.example-windows
└── settings.json.example-unix
test-hook.js                     ← Test tool
```

## Troubleshooting

### Hook Not Executing
1. Verify `UserPromptSubmit` key in settings.json (PascalCase)
2. Run `node test-hook.js`
3. Check Node.js: `node -v`
4. Restart Claude Code after config changes
5. Check logs: Windows `%TEMP%\hook-prompt-optimizer.log` / Unix `/tmp/hook-prompt-optimizer.log`

### Claude Code 2.1.23+ Breaking Changes
The hook protocol changed in v2.1.23. All context fields must be wrapped in `hookSpecificOutput`:

```javascript
// ✅ Correct (new)
return { hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: "..." } };
// ❌ Wrong (old)
return { hookEventName: "UserPromptSubmit", hookSpecificOutput: { ... } };
```

## Core Idea

**Turn Google's 68-page prompt engineering bible + 5-task meta-prompting rules into an automatic workflow.**

You don't need to memorize all the rules. You don't need to check the CTF formula every time. You don't need to decide between Zero-Shot and CoT.

**The Hook does it all for you.**

---

**Have fun! 🚀**
