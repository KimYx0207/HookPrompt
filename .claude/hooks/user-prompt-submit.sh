#!/bin/bash
#
# 提示词自动优化Hook - Bash版本 (Mac/Linux)
#
# Windows用户请使用 user-prompt-submit.js
#
# 工作流程：
# 1. 用户输入提示词
# 2. Hook优化
# 3. 返回优化后的提示词给Claude
#

set -euo pipefail

# 跨平台临时目录
LOG_FILE="${TMPDIR:-${TMP:-/tmp}}/hook-prompt-optimizer.log"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
}

log "========================================"
log "Hook执行开始"

# 安全读取用户输入
USER_INPUT=""
if [ $# -gt 0 ]; then
    USER_INPUT="$*"
else
    USER_INPUT=$(cat)
fi

# 去除首尾空白
USER_INPUT=$(echo "$USER_INPUT" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

log "用户输入: ${USER_INPUT:0:100}..."
log "输入长度: ${#USER_INPUT}"

is_prompt_level_slash_command() {
    [[ "$1" =~ ^/(meta-theory|meta_theory)([[:space:]]|$) ]]
}

# 过滤：Claude Code 内置命令（以 / 开头）
if [[ "$USER_INPUT" =~ ^/ ]] && ! is_prompt_level_slash_command "$USER_INPUT"; then
    log "检测到斜杠命令（Claude Code内置命令），跳过优化"
    echo "{}"
    exit 0
fi

# 过滤：简单交互式回复
case "$USER_INPUT" in
    好的|是的|继续|谢谢|ok|OK|yes|YES|no|NO|确认|取消|好|行|可以|不|嗯|y|n|Y|N)
        log "简单回复，跳过优化"
        echo "{}"
        exit 0
        ;;
esac

# 短但带诊断/修复/优化意图的输入也应进入优化层。
SHORT_TASK_INTENT=0
case "$USER_INPUT" in
    这个不行|这不行|不行|这个不对|这不对|不对|有问题|报错|报错了|失败了|错了|坏了|乱了|太乱|太乱了|不好看|卡住了|跑不通|看不懂|帮我看看|看看|看下|检查|排查|修复|修一下|改一下|优化一下|整理一下|error|failed|failure|broken|bug|pleasecheck|"please check"|checkthis|"check this"|fixthis|"fix this"|"this does not work"|"this doesn't work"|thisdoesnotwork|thisdoesntwork)
        SHORT_TASK_INTENT=1
        ;;
esac

# 过滤：太短且没有可执行意图
INPUT_LENGTH=${#USER_INPUT}
if [ "$INPUT_LENGTH" -lt 10 ] && [ "$SHORT_TASK_INTENT" -ne 1 ]; then
    log "输入太短 ($INPUT_LENGTH < 10)，跳过优化"
    echo "{}"
    exit 0
fi

log "通过过滤，开始优化..."

if [ "${HOOKPROMPT_COMPACT_CONTEXT:-}" != "1" ]; then
    # 获取脚本目录（带fallback）
    SCRIPT_DIR=""
    if [ -n "${BASH_SOURCE[0]:-}" ]; then
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || true
    fi

    # 查找模板文件
    OPTIMIZER_PROMPT_FILE=""
    if [ -n "$SCRIPT_DIR" ]; then
        CLAUDE_DIR="$(dirname "$SCRIPT_DIR")"
        OPTIMIZER_PROMPT_FILE="$CLAUDE_DIR/prompt-optimizer-meta.md"
    fi

    # 备选：用户主目录
    if [ ! -f "$OPTIMIZER_PROMPT_FILE" ]; then
        OPTIMIZER_PROMPT_FILE="$HOME/.claude/prompt-optimizer-meta.md"
    fi

    # 检查模板是否存在
    if [ ! -f "$OPTIMIZER_PROMPT_FILE" ]; then
        log "错误：模板文件未找到"
        echo "{}"
        exit 0
    fi

    # 读取模板
    OPTIMIZER_PROMPT=$(cat "$OPTIMIZER_PROMPT_FILE") || {
        log "错误：读取模板文件失败"
        echo "{}"
        exit 0
    }

    log "模板已加载，构建默认完整优化请求..."

    ADDITIONAL_CONTEXT="$OPTIMIZER_PROMPT

---

## 用户原始输入（已安全包裹，请从代码块中读取原文）

\`\`\`text
$USER_INPUT
\`\`\`

---

请严格按照格式输出优化结果，最后必须包含完整的优化后提示词。

**重要**：输出优化结果后，立即执行\"优化后的完整提示词\"中描述的任务，不要等待用户确认。"
else
    log "构建显式短后台展示契约..."

    ADDITIONAL_CONTEXT="<MANDATORY_FORMAT_INSTRUCTION compact=\"true\">
【HookPrompt 前台展示契约】

本条 additionalContext 是后台指令，不要把它原样展示给用户。

本轮第一条面向用户的 assistant 回复必须以完整 HookPrompt 三段式开头：

1. 第一行：📝 **原始输入**：
   下一段必须是 fenced text code block，逐字放入用户原始输入。若下方提供“已解包用户原始输入”，优先使用它。

2. 然后输出：🔄 **优化后的理解**：
   用 3 个 bullet 展示 Context（上下文）、Task（任务）、Format（格式）。

3. 然后输出：✅ **优化后的完整提示词**：
   下一段必须是 fenced markdown code block，写出完整、可执行、结构化的优化提示词。

4. 最后输出 --- 分隔线，再继续完成用户真实任务。

只在本轮第一条可见回复展示一次三段式；后续 commentary、progress、final、review、verification 直接继续任务，不重复三段式。

优化提示词时使用 role-first + outcome-contract + tagged structure；首屏理解可保留 CTF 摘要，复杂任务可加入 Critical / Fetch / Thinking / Review 的结果摘要。保留用户可见的完整体验，但保持后台 hook 输出简短。

已解包用户原始输入：

\`\`\`text
$USER_INPUT
\`\`\`
</MANDATORY_FORMAT_INSTRUCTION>"
fi

# 输出JSON格式（使用jq或手动构建）
# 为了兼容性，手动构建JSON（转义特殊字符）
ESCAPED_CONTEXT=$(echo "$ADDITIONAL_CONTEXT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed '$ s/\\n$//')

cat << EOF
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"$ESCAPED_CONTEXT"}}
EOF

log "优化请求已发送（JSON格式）"
