#!/usr/bin/env node
/**
 * Hook功能测试工具
 *
 * 用于本地测试user-prompt-submit hook是否正常工作
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 测试用例
const testCases = [
    {
        name: '简短回复（应跳过优化）',
        input: '好的',
        expectOptimization: false
    },
    {
        name: '太短输入（应跳过优化）',
        input: '继续',
        expectOptimization: false
    },
    {
        name: '正常长文本（应触发优化）',
        input: '帮我写一个用户登录功能',
        expectOptimization: true
    },
    {
        name: '复杂需求（应触发优化）',
        input: '我需要实现一个完整的购物车系统，包括添加商品、修改数量、删除商品和结算功能',
        expectOptimization: true
    }
];

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 运行单个测试
function runTest(testCase) {
    return new Promise((resolve) => {
        log(`\n${'='.repeat(60)}`, 'cyan');
        log(`测试: ${testCase.name}`, 'blue');
        log(`输入: "${testCase.input}"`, 'blue');
        log('='.repeat(60), 'cyan');

        const hookPath = path.join(__dirname, '.claude', 'hooks', 'user-prompt-submit.js');

        // 检查hook文件是否存在
        if (!fs.existsSync(hookPath)) {
            log(`❌ Hook文件不存在: ${hookPath}`, 'red');
            resolve({ passed: false, error: 'Hook文件不存在' });
            return;
        }

        const hookProcess = spawn('node', [hookPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        hookProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        hookProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        hookProcess.on('close', (code) => {
            log(`\n进程退出码: ${code}`, code === 0 ? 'green' : 'red');

            if (stderr) {
                log(`\nStderr输出:`, 'yellow');
                console.log(stderr);
            }

            if (stdout) {
                log(`\nStdout输出:`, 'yellow');
                console.log(stdout.substring(0, 500)); // 只显示前500字符
                if (stdout.length > 500) {
                    log(`... (输出已截断，总长度: ${stdout.length})`, 'yellow');
                }
            }

            // 验证输出
            let result = { passed: false };

            try {
                const jsonOutput = JSON.parse(stdout);
                const hasOptimization = jsonOutput.hookSpecificOutput &&
                                      jsonOutput.hookSpecificOutput.additionalContext;

                if (testCase.expectOptimization) {
                    if (hasOptimization) {
                        log(`\n✅ 测试通过：正确触发了优化`, 'green');
                        result.passed = true;
                    } else {
                        log(`\n❌ 测试失败：应该触发优化但没有`, 'red');
                        result.error = '应该触发优化但返回了空对象';
                    }
                } else {
                    if (!hasOptimization) {
                        log(`\n✅ 测试通过：正确跳过了优化`, 'green');
                        result.passed = true;
                    } else {
                        log(`\n❌ 测试失败：不应该触发优化但触发了`, 'red');
                        result.error = '不应该触发优化但返回了优化内容';
                    }
                }
            } catch (e) {
                log(`\n❌ 测试失败：输出不是有效的JSON`, 'red');
                result.error = `JSON解析错误: ${e.message}`;
            }

            resolve(result);
        });

        // 发送输入
        hookProcess.stdin.write(testCase.input);
        hookProcess.stdin.end();
    });
}

// 主函数
async function main() {
    log('\n' + '='.repeat(60), 'cyan');
    log('提示词优化Hook测试工具', 'cyan');
    log('='.repeat(60), 'cyan');

    const results = [];

    for (const testCase of testCases) {
        const result = await runTest(testCase);
        results.push({ name: testCase.name, ...result });

        // 等待一下，避免日志混乱
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 输出总结
    log('\n' + '='.repeat(60), 'cyan');
    log('测试总结', 'cyan');
    log('='.repeat(60), 'cyan');

    results.forEach((result, index) => {
        const status = result.passed ? '✅ 通过' : '❌ 失败';
        const color = result.passed ? 'green' : 'red';
        log(`${index + 1}. ${result.name}: ${status}`, color);
        if (result.error) {
            log(`   错误: ${result.error}`, 'yellow');
        }
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    log(`\n总计: ${passedCount}/${totalCount} 通过`, passedCount === totalCount ? 'green' : 'red');

    // 检查日志文件
    const os = require('os');
    const logFile = path.join(os.tmpdir(), 'hook-prompt-optimizer.log');
    if (fs.existsSync(logFile)) {
        log(`\n日志文件位置: ${logFile}`, 'blue');
        log('查看日志: cat "' + logFile + '"', 'blue');
    }

    log('', 'reset');
}

main().catch(err => {
    log(`\n致命错误: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
});
