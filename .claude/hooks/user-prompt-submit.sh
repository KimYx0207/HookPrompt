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

# 过滤：简单交互式回复
case "$USER_INPUT" in
    好的|是的|继续|谢谢|ok|OK|yes|YES|no|NO|确认|取消|好|行|可以|不|嗯|y|n|Y|N)
        log "简单回复，跳过优化"
        echo "{}"
        exit 0
        ;;
esac

# 过滤：太短（< 10字符）
INPUT_LENGTH=${#USER_INPUT}
if [ "$INPUT_LENGTH" -lt 10 ]; then
    log "输入太短 ($INPUT_LENGTH < 10)，跳过优化"
    echo "{}"
    exit 0
fi

log "通过过滤，开始优化..."

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

log "模板已加载，构建优化请求..."

# 构建优化上下文内容
ADDITIONAL_CONTEXT="$OPTIMIZER_PROMPT

---

## 用户原始输入

$USER_INPUT

---

请严格按照格式输出优化结果，最后必须包含完整的优化后提示词。

**重要**：输出优化结果后，立即执行\"优化后的完整提示词\"中描述的任务，不要等待用户确认。"

# 输出JSON格式（使用jq或手动构建）
# 为了兼容性，手动构建JSON（转义特殊字符）
ESCAPED_CONTEXT=$(echo "$ADDITIONAL_CONTEXT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed '$ s/\\n$//')

cat << EOF
{"hookSpecificOutput":{"additionalContext":"$ESCAPED_CONTEXT"}}
EOF

log "优化请求已发送（JSON格式）"
