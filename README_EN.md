[English](./README_EN.md) | [中文](./README.md)

# Auto Prompt Optimization Hook

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/KimYx0207/HookPrompt?style=social)
![GitHub forks](https://img.shields.io/github/forks/KimYx0207/HookPrompt?style=social)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Language](https://img.shields.io/badge/language-JavaScript-orange.svg)

**Role-first + Outcome-contract + Tagged structure → Auto-executing Hook**

</div>

---

> Turn role-first prompting, outcome contracts, and tagged structure into an auto-executing Hook.
> Just type casual phrases — AI automatically translates them into professional prompts.

---

## How It Works

By default, the hook sends the full meta template through `additionalContext` so
the user-facing reply can preserve the complete three-part prompt optimization
experience (`📝 Original Input`, `🔄 Optimized Understanding`, `✅ Optimized Full
Prompt`). The original user input is still wrapped in a fenced code block so
Markdown headings, file paths, and images stay literal. Set
`HOOKPROMPT_COMPACT_CONTEXT=1` only when you explicitly need the shorter
backstage contract as an emergency fallback.

```
User types: "make a login"
    ↓
Hook intercepts
    ↓
Applies role-first + outcome-contract optimization
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
3. Type a normal request, or a short diagnostic phrase such as "this does not work" / "error" / "please check"
4. Watch the Hook display the optimization process

### Method 2: Copy to Another Project
```bash
cp -r .claude /your/project/root/
```

For Codex projects, also copy `.codex`:

```bash
cp -r .codex /your/project/root/
```

### Method 3: Global Configuration (Recommended)

**Windows:**
```powershell
Copy-Item -Recurse .claude\hooks $HOME\.claude\hooks
Copy-Item .claude\prompt-optimizer-meta.md $HOME\.claude\
```

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

### Codex Support
Codex sends `UserPromptSubmit` input as JSON. The Node.js hook extracts the `prompt` field and returns model-visible context through:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "..."
  }
}
```

Do not wrap the optimized prompt as `systemMessage`; in Codex that is a UI/event notice, not the same model context channel.

### Smart Filtering
| Input Type | Optimized? |
|-----------|-----------|
| Built-in commands (`/clear`, `/help`) | ❌ Skip |
| Short diagnostic / repair intent ("does not work", "error", "please check") | ✅ Optimize |
| Short input with no task intent | ❌ Skip |
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
.codex/
├── hooks/
│   └── user-prompt-submit.js    ← Codex adapter
└── hooks.json                   ← Codex Hook configuration
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

**Turn role-first prompting, outcome contracts, tagged structure, and verification plans into an automatic workflow.**

You don't need to hand-write goals, scope, acceptance criteria, and verification plans every time. Short task feedback is optimized; pure confirmations are skipped.

**The Hook does it all for you.**

---

**Have fun! 🚀**
