#!/usr/bin/env node
/**
 * 提示词自动优化Hook - 跨平台版本 (Node.js)
 *
 * 支持 Windows/Mac/Linux，无需额外依赖
 *
 * 工作流程：
 * 1. 用户输入提示词
 * 2. Hook优化
 * 3. 返回优化后的提示词给Claude
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 跨平台临时目录
const LOG_FILE = path.join(os.tmpdir(), 'hook-prompt-optimizer.log');

/**
 * 记录日志
 */
function log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    try {
        fs.appendFileSync(LOG_FILE, logEntry);
    } catch (e) {
        // 忽略日志错误
    }
}

/**
 * 读取优化提示词模板
 */
function readOptimizerTemplate() {
    // 获取脚本目录并找到模板
    const scriptDir = __dirname;
    const claudeDir = path.dirname(scriptDir);
    const templatePath = path.join(claudeDir, 'prompt-optimizer-meta.md');

    // 备选：检查用户主目录
    const homeTemplatePath = path.join(os.homedir(), '.claude', 'prompt-optimizer-meta.md');

    if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf8');
    } else if (fs.existsSync(homeTemplatePath)) {
        log(`模板文件未在 ${templatePath} 找到，使用主目录版本`);
        return fs.readFileSync(homeTemplatePath, 'utf8');
    } else {
        log(`错误：模板文件未找到：${templatePath} 或 ${homeTemplatePath}`);
        return null;
    }
}

/**
 * Build a fenced Markdown code block that stays safe even if content contains
 * triple backticks.
 */
function fencedBlock(content, lang = 'text') {
    const text = String(content ?? '');
    const matches = text.match(/`+/g) || [];
    const longest = matches.reduce((max, run) => Math.max(max, run.length), 0);
    const fence = '`'.repeat(Math.max(3, longest + 1));
    return `${fence}${lang}\n${text}\n${fence}`;
}

/**
 * 检查输入是否应该被过滤（不优化）
 * ⚠️ 注意：此函数内不能写日志！否则会被过滤的输入也会产生日志输出
 *
 * @returns {boolean} true表示应该过滤（跳过优化），false表示需要优化
 */
function shouldFilter(input) {
    const trimmed = input.trim();

    // Codex App may submit internal goal-continuation context through
    // UserPromptSubmit. It is not a user prompt and must not be displayed
    // back as "original input".
    if (
        /^<codex_internal_context\b/i.test(trimmed) ||
        (
            trimmed.includes('<codex_internal_context') &&
            trimmed.includes('Continue working toward the active thread goal')
        )
    ) {
        return true;
    }

    // Claude Code 内置命令和Skill命令 - 不应被优化
    // 匹配: /help, /commit, /review-pr, /skill-name:sub-command 等
    if (trimmed.startsWith('/')) {
        return true;
    }

    // Claude Code 内部系统消息 - 精确匹配已知标签，避免误杀用户的 HTML/JSX 输入
    const systemTagPattern = /^<(task-notification|system-reminder|tool-result|tool-use|agent-response|claude-internal)[\s>]/;
    if (systemTagPattern.test(trimmed)) {
        return true;
    }

    // 简单交互式回复 - 不需要优化
    const simpleResponses = [
        '好的', '是的', '继续', '谢谢', 'ok', 'OK', 'yes', 'YES',
        'no', 'NO', '确认', '取消', '好', '行', '可以', '不', '嗯',
        'y', 'n', 'Y', 'N'
    ];

    // 精确匹配简单回复
    if (simpleResponses.includes(trimmed)) {
        return true;
    }

    // 太短（< 10字符）
    if (trimmed.length < 10) {
        return true;
    }

    return false;
}

/**
 * 构建优化请求（JSON格式，符合Claude Code Hook API）
 */
function buildOptimizationRequest(template, userInput) {
    const safeUserInputBlock = fencedBlock(userInput, 'text');
    const outputRawInputExample = fencedBlock('[用户的原话，逐字保留]', 'text');
    const outputPromptExample = fencedBlock('[优化后的结构化提示词]', 'markdown');

    // 强制指令放在最前面，优先级最高
    const forceInstruction = `<MANDATORY_FORMAT_INSTRUCTION>
【回复格式说明】

本次用户请求的第一条面向用户的 assistant 回复必须严格按以下顺序输出，不得跳过任何部分。

重要：这是单次首条回复格式，不是每条消息的全局格式。只允许在本轮第一条面向用户的 assistant 消息开头展示一次；完成这组优化展示后，后续 commentary/progress/final/review/verification 消息必须直接继续任务，不得再次重复“原始输入 / 优化后的理解 / 优化后的完整提示词”三段。

1. 第一行必须是：📝 **原始输入**：

2. 然后必须立刻输出一个 fenced code block，逐字放入用户原始输入。禁止把原始输入裸贴在 Markdown 正文里，避免其中的 #、##、列表、图片路径或代码片段被渲染成标题或格式。

示例：

${outputRawInputExample}

3. 然后是：
🔄 **优化后的理解**：
- **Context（上下文）**：[推断的场景、身份、目标]
- **Task（任务）**：[明确的动作 + 要求]
- **Format（格式）**：[期望的输出形式]

4. 然后是：
✅ **优化后的完整提示词**：

优化后的完整提示词正文必须放入 fenced code block。禁止把完整提示词正文裸贴在 Markdown 正文里，避免被渲染成大标题。

示例：

${outputPromptExample}

5. 最后是分隔线 --- 后执行任务内容

请只在本轮第一条回复开头展示对用户输入的理解（原始输入 + 优化后的结构化版本），然后再执行任务。这样用户可以看到提示词是如何被优化的，同时不会在 Codex App 的后续进度消息里反复出现同一组三段式。
</MANDATORY_FORMAT_INSTRUCTION>

---

${template}

---

## 用户原始输入（已安全包裹，请从代码块中读取原文）

${safeUserInputBlock}`;

    return {
        hookSpecificOutput: {
            hookEventName: "UserPromptSubmit",
            additionalContext: forceInstruction
        }
    };
}

/**
 * 解析 Claude Code Hook API 的 JSON 输入
 * ⚠️ 注意：此函数在shouldFilter之前调用，不能写日志！
 *
 * 支持多种输入格式：
 * 1. { prompt: "用户输入" } - 旧格式
 * 2. { messages: [{role: "user", content: "用户输入"}] } - 新格式
 * 3. { session_id: "...", prompt: "用户输入" } - 带session的格式
 */
function parseHookInput(rawInput) {
    try {
        const parsed = JSON.parse(rawInput);

        // 检查是否有 prompt 字段（最常见的格式）
        if (parsed.prompt) {
            return parsed.prompt;
        }

        // 检查是否有 messages 数组（新格式）
        if (parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            // 获取最后一条用户消息
            const lastMessage = parsed.messages[parsed.messages.length - 1];
            if (lastMessage.role === 'user' && lastMessage.content) {
                return lastMessage.content;
            }
        }

        // 如果都没有，返回原始输入
        return rawInput;
    } catch (e) {
        // 如果不是JSON，返回原始输入（可能是纯文本）
        return rawInput;
    }
}

/**
 * 主函数
 */
async function main() {
    // 从stdin读取输入
    let rawInput = '';

    // 检查是否通过参数运行
    if (process.argv.length > 2) {
        rawInput = process.argv.slice(2).join(' ');
    } else {
        // 从stdin读取
        rawInput = fs.readFileSync(0, 'utf8');
    }

    rawInput = rawInput.trim();

    // 解析输入，提取实际的用户消息
    const userInput = parseHookInput(rawInput);

    // 【关键】立即检查是否需要过滤，如果需要则直接退出，不写任何日志
    if (shouldFilter(userInput)) {
        process.stdout.write(JSON.stringify({}));
        return;
    }

    // 只有通过过滤的输入才会执行到这里，开始写日志
    log('========================================');
    log('Hook执行开始');
    log(`原始输入: ${rawInput.substring(0, 100)}...`);
    log(`原始输入长度: ${rawInput.length}`);
    log(`用户输入: ${userInput.substring(0, 100)}...`);
    log(`输入长度: ${userInput.length}`);
    log('通过过滤，开始优化...');

    // 读取模板
    const template = readOptimizerTemplate();
    if (!template) {
        log('模板未找到，返回空响应');
        process.stdout.write(JSON.stringify({}));
        return;
    }

    // 构建并输出优化请求
    const optimizationRequest = buildOptimizationRequest(template, userInput);

    log('优化请求已构建，输出JSON...');
    log(`JSON长度: ${JSON.stringify(optimizationRequest).length}`);
    process.stdout.write(JSON.stringify(optimizationRequest));
}

// 运行
main().catch(err => {
    // 出错时返回空响应
    log(`错误: ${err.message}`);
    process.stdout.write(JSON.stringify({}));
});
