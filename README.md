# 提示词自动优化Hook

> 把谷歌68页圣经+5任务元提示词变成自动执行的Hook
> 你随便说两句大白话，AI自动翻译成专业提示词

---

## 📋 更新日志

### v1.2.3 (2026-01-28) - **修复：完善 JSON 输入解析** 🔥
- ✅ **修复核心问题**：添加完整的 JSON 输入解析逻辑，正确提取 `messages` 数组中的用户消息
- ✅ **修复 Hook 错误**：解决 UserPromptSubmit hook 无法正确处理 Claude Code API 输入的问题
- ✅ **增强兼容性**：同时支持 JSON 格式（`messages` 数组、`prompt` 字段）和纯文本格式
- ✅ **改进日志**：添加详细的解析日志，包括原始输入和提取后的用户消息

### v1.2.2 (2026-01-27) - **修复：Hook API 输入解析** 🔥
- ✅ **修复关键问题**：正确解析 Claude Code Hook API 的 JSON 输入格式
- ✅ **修复命令识别**：现在能正确识别并跳过内置命令（如 `/clear`、`/help` 等）
- ✅ **改进兼容性**：支持 `messages` 数组格式和纯文本格式的输入
- ✅ **增强日志**：添加 JSON 解析日志，便于调试

### v1.2.1 (2026-01-27) - **新增：内置命令过滤** 🎯
- ✅ **新增内置命令过滤**：自动识别并跳过 Claude Code 内置命令（如 `/clear`、`/help`、`/commit` 等）
- ✅ **修复命令冲突**：解决 `/clear` 被误解为项目清理操作的问题
- ✅ **改进用户体验**：确保所有斜杠命令能够正确触发，不被 Hook 拦截优化

### v1.2.0 (2026-01-11) - **重要更新：修复Hook触发问题** 🔥
- ✅ **修复settings.json配置格式**：使用正确的`UserPromptSubmit`键名（PascalCase）和数组结构
- ✅ **修复Hook输出格式**：符合Claude Code官方Hook API，使用JSON格式输出
- ✅ **添加跨平台配置示例**：提供Windows和Unix的配置模板
- ✅ **添加测试工具**：`test-hook.js`用于本地测试hook功能
- ✅ **完善文档**：更新安装和故障排查指南

### v1.1.0 (2025-12-09)
- ✅ **新增跨平台支持**：添加Node.js版本，Windows/Mac/Linux全平台支持
- ✅ **修复输出格式**：去掉干扰Claude理解的分隔符
- ✅ **修复日志路径**：使用跨平台临时目录
- ✅ **修复路径问题**：支持`$HOME`和项目目录双重查找
- ✅ **增强错误处理**：模板文件缺失时有日志提示
- ✅ **优化模板**：去掉硬编码技术栈，改为智能推断
- ✅ **统一文档**：代码和文档阈值说明一致（10字符）

---

## 🎯 工作流程

```
用户发消息："做个登录"
    ↓
Hook拦截
    ↓
调用优化逻辑
    ↓
输出优化后的专业提示词：
    📝 原始输入：做个登录
    🔄 优化后的理解：
       - Context: Web应用，生产级安全
       - Task: 实现JWT认证+bcrypt加密
       - Format: 完整代码+测试
    ✅ 优化后的完整提示词：[详细的专业提示词]
    ↓
Claude收到优化后的版本
    ↓
Claude自动执行任务
```

---

## 📦 文件结构

```
提示词Hook/
  ├── .claude/
  │   ├── hooks/
  │   │   ├── user-prompt-submit.js        ← Node.js版（推荐，跨平台）
  │   │   └── user-prompt-submit.sh        ← Bash版（Mac/Linux）
  │   ├── prompt-optimizer-meta.md         ← 优化提示词模板
  │   ├── settings.json                    ← Hook配置（当前项目）
  │   ├── settings.json.example-windows    ← Windows配置示例
  │   └── settings.json.example-unix       ← Mac/Linux配置示例
  └── test-hook.js                         ← 测试工具（验证hook功能）
```

---

## 🚀 快速开始

### 方法1：在这个项目中使用

1. 用Claude Code打开这个项目目录
2. **首次使用前运行测试**：`node test-hook.js`（可选，验证功能）
3. 随便说点什么测试（超过10个字符）
4. 看Hook是否显示优化过程

### 方法2：复制到其他项目

```bash
# 复制整个.claude目录到你的项目
cp -r .claude /你的项目根目录/
```

**重要**：确保settings.json使用正确的格式（见下方）

### 方法3：全局配置（推荐）

**Windows:**
```powershell
# 复制到全局配置目录
Copy-Item -Recurse .claude\hooks $HOME\.claude\hooks
Copy-Item .claude\prompt-optimizer-meta.md $HOME\.claude\
```

**Mac/Linux:**
```bash
# 复制到全局配置目录
mkdir -p ~/.claude/hooks
cp .claude/hooks/* ~/.claude/hooks/
cp .claude/prompt-optimizer-meta.md ~/.claude/
chmod +x ~/.claude/hooks/*.sh
```

然后编辑 `~/.claude/settings.json`（如果不存在就创建）：

**Windows用户：**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["C:/Users/你的用户名/.claude/hooks/user-prompt-submit.js"]
          }
        ]
      }
    ]
  }
}
```

**Mac/Linux用户（Node.js版）：**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["~/.claude/hooks/user-prompt-submit.js"]
          }
        ]
      }
    ]
  }
}
```

**Mac/Linux用户（Bash版）：**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash",
            "args": ["~/.claude/hooks/user-prompt-submit.sh"]
          }
        ]
      }
    ]
  }
}
```

> ⚠️ **重要**：
> - 键名必须是 `UserPromptSubmit`（PascalCase），不是 `user-prompt-submit`
> - 值必须是数组，包含hooks对象
> - 必须包含 `type: "command"` 字段

---

## ✨ 核心特性

### 1. 跨平台支持
- **Node.js版**（推荐）：Windows/Mac/Linux全平台支持
- **Bash版**：Mac/Linux原生支持

### 2. 智能过滤
| 输入类型 | 是否优化 |
|---------|---------|
| Claude Code内置命令（`/clear`、`/help`等） | ❌ 不优化 |
| 简短问题（<10字符） | ❌ 不优化 |
| 简单回复（"好的"、"继续"） | ❌ 不优化 |
| 正常需求描述 | ✅ 优化 |

### 3. 自动执行
优化完成后，Claude会自动执行任务，不需要二次确认。

---

## 🧪 测试效果

### 测试1：模糊需求

**你说**：
```
做个登录功能
```

**Hook优化后**：
```markdown
📝 **原始输入**：做个登录功能

🔄 **优化后的理解**：
- **Context（上下文）**：Web应用，资深全栈工程师，生产级安全要求
- **Task（任务）**：实现完整的用户登录功能
- **Format（格式）**：完整代码文件 + 测试用例

✅ **优化后的完整提示词**：
[详细的专业提示词...]
```

### 测试2：简单问答（不优化）

**你说**：
```
这是什么？
```

**输出**：原样输出，不浪费时间优化。

---

## 🔧 配置选项

### 查看配置示例

项目中提供了两个配置示例文件：
- `.claude/settings.json.example-windows` - Windows平台配置
- `.claude/settings.json.example-unix` - Mac/Linux平台配置

### 启用/禁用Hook

**临时禁用**：重命名settings.json为settings.json.bak

**切换Bash版本（Mac/Linux）**：
修改`.claude/settings.json`中的command和args：
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash",
            "args": [".claude/hooks/user-prompt-submit.sh"]
          }
        ]
      }
    ]
  }
}
```

### 自定义优化规则

编辑 `.claude/prompt-optimizer-meta.md`：
- 修改CTF公式应用方式
- 调整输出格式
- 添加自定义检查项

---

## 🧪 测试工具

使用提供的测试脚本验证hook功能：

```bash
node test-hook.js
```

测试脚本会：
- ✅ 测试简短回复（应跳过优化）
- ✅ 测试太短输入（应跳过优化）
- ✅ 测试正常长文本（应触发优化）
- ✅ 测试复杂需求（应触发优化）
- ✅ 显示详细的测试结果和日志

---

## 🐛 故障排查

### 问题1：Hook没有执行

**症状**：输入提示词后没有看到任何优化输出

**检查步骤**：
1. **验证配置格式**：
   - 确认 `.claude/settings.json` 中键名是 `UserPromptSubmit`（不是 `user-prompt-submit`）
   - 确认值是数组结构，包含 `hooks` 对象
   - 确认包含 `type: "command"` 字段

2. **运行测试脚本**：
   ```bash
   node test-hook.js
   ```
   如果测试失败，说明hook脚本本身有问题

3. **检查Node.js**：
   ```bash
   node -v
   ```
   确保已安装Node.js

4. **重启Claude Code**：配置更改后需要重启

5. **查看错误日志**：
   - Windows: `%TEMP%\hook-prompt-optimizer.log`
   - Mac/Linux: `/tmp/hook-prompt-optimizer.log`

### 问题2：显示"Invalid key in record"错误

**原因**：settings.json配置格式错误

**解决方法**：
1. 检查键名是否为 `UserPromptSubmit`（PascalCase）
2. 检查是否使用了数组结构
3. 参考项目中的示例文件：
   - `.claude/settings.json.example-windows`
   - `.claude/settings.json.example-unix`

### 问题3：没有显示优化过程

**可能原因**：
- 你的输入太短（<10字符）
- 输入是简单回复（"好的"、"继续"等）
- Hook工作正常，但返回了空响应

**检查方法**：
1. 运行测试脚本：`node test-hook.js`
2. 查看日志文件，确认hook是否被触发
3. 尝试输入较长的需求描述

### 问题4：Windows提示找不到bash

**解决方法**：使用Node.js版本（推荐）
- 确保settings.json中配置的是 `node` 命令
- 参考 `.claude/settings.json.example-windows`

### 问题5：Mac/Linux权限错误

**解决方法**：
```bash
chmod +x .claude/hooks/*.sh
```

### 通用调试步骤

1. **最小化测试**：
   ```bash
   # 直接运行hook脚本测试
   echo "帮我写一个登录功能" | node .claude/hooks/user-prompt-submit.js
   ```
   应该输出JSON格式的响应

2. **查看日志**：
   ```bash
   # Windows
   type %TEMP%\hook-prompt-optimizer.log

   # Mac/Linux
   cat /tmp/hook-prompt-optimizer.log
   ```

3. **验证JSON格式**：
   hook输出必须是有效的JSON，格式如下：
   ```json
   {
     "hookSpecificOutput": {
       "additionalContext": "..."
     }
   }
   ```
   或空对象 `{}`



---

## 📚 核心文件说明

### 1. `user-prompt-submit.js` ⭐⭐⭐
Hook的核心脚本（Node.js版）：
- 跨平台支持
- 拦截用户输入
- 智能过滤简单问题
- 调用优化逻辑
- 返回优化后的提示词

### 2. `user-prompt-submit.sh`
Hook的Bash版本（Mac/Linux）：
- 功能同上
- 需要Bash环境

### 3. `prompt-optimizer-meta.md` ⭐⭐⭐
优化提示词模板：
- 5任务元提示词完整版
- CTF公式应用规则
- 输出格式规范
- 示例参考

### 4. `settings.json`
Hook配置文件：
- 启用/禁用Hook
- 指定Hook脚本路径

---

## 💡 核心思想

**把谷歌68页圣经+5任务元提示词的规则，变成自动执行的流程。**

你不用记住所有规则。

你不用每次都检查CTF公式。

你不用纠结该用Zero-Shot还是CoT。

**Hook帮你全干了。**

---

## 🎉 完成！

现在你可以：
- 随便说话，Hook自动优化
- 看到完整的优化过程
- 享受高质量的AI对话

**Have fun! 🚀**
