/**
 * Image-to-Prompt 自动化测试脚本
 * 测试 Coze API fallback 到 Google Vision API 的完整流程
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('═══════════════════════════════════════════════════════════');
console.log('        Image-to-Prompt 自动化测试');
console.log('═══════════════════════════════════════════════════════════\n');

// 配置
const API_URL = 'http://localhost:3002/api/v1/image-to-prompt';
const TEST_TIMEOUT = 30000; // 30秒超时

// 创建测试图片（更复杂的图片，包含更多内容）
const createTestImage = () => {
  // 这是一个 10x10 像素的彩色PNG图片（红色渐变）
  const base64Image =
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';
  return Buffer.from(base64Image, 'base64');
};

// 测试用例
const testCases = [
  {
    name: '测试 1: General 风格（英文）',
    modelStyle: 'general',
    language: 'english',
  },
  {
    name: '测试 2: Midjourney 风格（英文）',
    modelStyle: 'midjourney',
    language: 'english',
  },
  {
    name: '测试 3: Stable Diffusion 风格（英文）',
    modelStyle: 'stable-diffusion',
    language: 'english',
  },
  {
    name: '测试 4: General 风格（中文）',
    modelStyle: 'general',
    language: 'chinese',
  },
];

// 测试结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  usedFallback: 0,
  details: [],
};

/**
 * 执行单个测试
 */
async function runTest(testCase) {
  const startTime = Date.now();

  try {
    console.log(`\n📋 ${testCase.name}`);
    console.log('─────────────────────────────────────────────────────────');
    console.log(`   模型风格: ${testCase.modelStyle}`);
    console.log(`   语言: ${testCase.language}`);

    // 创建表单数据
    const formData = new FormData();
    const imageBuffer = createTestImage();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test.png');
    formData.append('modelStyle', testCase.modelStyle);
    formData.append('language', testCase.language);

    console.log('   发送请求...');

    // 发送请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    console.log(`   响应时间: ${responseTime}ms`);
    console.log(`   HTTP 状态: ${response.status} ${response.statusText}`);

    const data = await response.json();

    // 验证响应
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || '未知错误'}`);
    }

    if (!data.success) {
      throw new Error(data.error || '请求失败');
    }

    // 验证数据结构
    if (!data.data || !data.data.prompt) {
      throw new Error('响应数据结构不完整');
    }

    const prompt = data.data.prompt;
    const usedFallback = data.data.fallbackResponse || false;

    console.log('   ✅ 测试通过');
    console.log(`   使用 Fallback: ${usedFallback ? '是' : '否'}`);
    console.log(`   生成的提示词长度: ${prompt.length} 字符`);
    console.log(`   提示词预览: ${prompt.substring(0, 100)}...`);

    if (usedFallback) {
      console.log('   🔄 检测到使用了 Google Vision API fallback');
      results.usedFallback++;
    }

    results.passed++;
    results.details.push({
      name: testCase.name,
      status: 'PASSED',
      responseTime,
      usedFallback,
      promptLength: prompt.length,
    });

    return true;
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.log('   ❌ 测试失败');
    console.log(`   错误: ${error.message}`);

    if (error.name === 'AbortError') {
      console.log(`   原因: 请求超时（超过 ${TEST_TIMEOUT}ms）`);
    }

    results.failed++;
    results.details.push({
      name: testCase.name,
      status: 'FAILED',
      responseTime,
      error: error.message,
    });

    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始执行测试...\n');
  console.log(`API 端点: ${API_URL}`);
  console.log(`测试用例数: ${testCases.length}`);
  console.log(`超时设置: ${TEST_TIMEOUT}ms\n`);

  // 先检查服务器是否可访问
  console.log('🔍 检查服务器连接...');
  try {
    const healthCheck = await fetch('http://localhost:3002', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    console.log('✅ 服务器正在运行\n');
  } catch (error) {
    console.error('❌ 无法连接到服务器');
    console.error('请确保开发服务器正在运行: pnpm dev');
    console.error(`错误: ${error.message}\n`);
    process.exit(1);
  }

  // 执行所有测试
  results.total = testCases.length;

  for (const testCase of testCases) {
    await runTest(testCase);
    // 在测试之间稍作延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 打印测试报告
  printTestReport();
}

/**
 * 打印测试报告
 */
function printTestReport() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    测试报告');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 总体统计
  console.log('📊 总体统计:');
  console.log(`   总测试数: ${results.total}`);
  console.log(`   通过: ${results.passed} ✅`);
  console.log(`   失败: ${results.failed} ❌`);
  console.log(`   成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log(`   使用 Fallback: ${results.usedFallback} 次`);

  // 详细结果
  console.log('\n📋 详细结果:');
  results.details.forEach((detail, index) => {
    const icon = detail.status === 'PASSED' ? '✅' : '❌';
    console.log(`\n${index + 1}. ${icon} ${detail.name}`);
    console.log(`   状态: ${detail.status}`);
    console.log(`   响应时间: ${detail.responseTime}ms`);

    if (detail.status === 'PASSED') {
      console.log(`   使用 Fallback: ${detail.usedFallback ? '是' : '否'}`);
      console.log(`   提示词长度: ${detail.promptLength} 字符`);
    } else {
      console.log(`   错误: ${detail.error}`);
    }
  });

  // Fallback 机制评估
  console.log('\n🔄 Fallback 机制评估:');
  if (results.usedFallback > 0) {
    console.log('   ✅ Fallback 机制工作正常');
    console.log('   当 Coze API 失败时，系统成功切换到 Google Vision API');
    console.log(`   ${results.usedFallback}/${results.passed} 次成功请求使用了 fallback`);
  } else if (results.passed > 0) {
    console.log('   ℹ️  所有请求都通过 Coze API 成功完成');
    console.log('   未触发 fallback 机制（这是正常的，说明 Coze API 工作正常）');
  } else {
    console.log('   ⚠️  无法评估 fallback 机制（所有测试都失败了）');
  }

  // 最终结论
  console.log('\n🎯 最终结论:');
  if (results.failed === 0) {
    console.log('   ✅ 所有测试通过！Image-to-Prompt 功能正常工作。');
    if (results.usedFallback > 0) {
      console.log('   ✅ Fallback 机制验证成功！');
    }
  } else if (results.passed > 0) {
    console.log(`   ⚠️  部分测试失败 (${results.failed}/${results.total})`);
    console.log('   建议检查失败的测试用例');
  } else {
    console.log('   ❌ 所有测试失败！请检查：');
    console.log('      1. 服务器是否正常运行');
    console.log('      2. 环境变量是否正确配置');
    console.log('      3. 查看服务器日志获取更多信息');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // 退出代码
  process.exit(results.failed === 0 ? 0 : 1);
}

// 运行测试
runAllTests().catch((error) => {
  console.error('\n❌ 测试执行出错:', error);
  process.exit(1);
});
