# 提示词自动优化Hook

> 把谷歌68页圣经+5任务元提示词变成自动执行的Hook
> 你随便说两句大白话，AI自动翻译成专业提示词

---

## 📋 更新日志

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
  └── .claude/
      ├── hooks/
      │   ├── user-prompt-submit.js   ← Node.js版（推荐，跨平台）
      │   └── user-prompt-submit.sh   ← Bash版（Mac/Linux）
      ├── prompt-optimizer-meta.md    ← 优化提示词模板
      └── settings.json               ← Hook配置
```

---

## 🚀 快速开始

### 方法1：在这个项目中使用

1. 用Claude Code打开这个项目目录
2. 随便说点什么测试（超过10个字符）
3. 看Hook是否显示优化过程

### 方法2：复制到其他项目

```bash
# 复制整个.claude目录到你的项目
cp -r .claude /你的项目根目录/
```

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
```json
{
  "hooks": {
    "user-prompt-submit": {
      "enabled": true,
      "command": "node",
      "args": ["~/.claude/hooks/userpromptsubmit.js"]
    }
  }
}
```

> ⚠️ **Windows用户注意**：使用绝对路径，如 `C:/Users/你的用户名/.claude/hooks/userpromptsubmit.js`

---

## ✨ 核心特性

### 1. 跨平台支持
- **Node.js版**（推荐）：Windows/Mac/Linux全平台支持
- **Bash版**：Mac/Linux原生支持

### 2. 智能过滤
| 输入类型 | 是否优化 |
|---------|---------|
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

### 启用/禁用Hook

编辑 `.claude/settings.json`：

```json
{
  "hooks": {
    "user-prompt-submit": {
      "enabled": false
    }
  }
}
```

### 切换Bash版本（Mac/Linux）

```json
{
  "hooks": {
    "userpromptsubmit": {
      "enabled": true,
      "command": "bash",
      "args": [".claude/hooks/user-prompt-submit.sh"]
    }
  }
}
```

### 自定义优化规则

编辑 `.claude/prompt-optimizer-meta.md`：
- 修改CTF公式应用方式
- 调整输出格式
- 添加自定义检查项

---

## 🐛 故障排查

### 问题1：Hook没有执行

**检查步骤**：
1. 确认 `.claude/settings.json` 中 `enabled: true`
2. 确认Node.js已安装（运行 `node -v` 检查）
3. 重启Claude Code

### 问题2：没有显示优化过程

**检查**：
- 你的输入是否太短（<10字符）？
- 是否是简单回复（"好的"、"继续"）？
- 查看日志：
  - Windows: `%TEMP%\hook-prompt-optimizer.log`
  - Mac/Linux: `/tmp/hook-prompt-optimizer.log`

### 问题3：Windows提示找不到bash

使用Node.js版本（默认配置已经是Node.js版）。

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
