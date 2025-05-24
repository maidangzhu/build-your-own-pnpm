# Mini-PNPM 调试指南 🛠️

## 快速开始调试

### 1. 开发模式调试 (推荐)

使用 `pnpm dev` 直接运行 TypeScript 代码，无需构建：

```bash
# 在项目根目录
pnpm dev --help                    # 查看帮助
pnpm dev list                      # 运行 list 命令
pnpm dev add lodash                # 运行 add 命令
pnpm dev install                   # 运行 install 命令
```

### 2. 构建后调试

```bash
# 构建项目
pnpm build

# 运行编译后的代码
node dist/cli/index.js --help
node dist/cli/index.js list
```

### 3. 在测试项目中调试

```bash
# 进入测试项目
cd test-project

# 使用开发模式
../node_modules/.bin/tsx ../src/cli/index.ts list
../node_modules/.bin/tsx ../src/cli/index.ts add axios

# 或使用构建后的版本
../dist/cli/index.js list
../dist/cli/index.js add axios
```

## VS Code 调试配置

创建 `.vscode/launch.json` 文件进行断点调试：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug mini-pnpm install",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/cli/index.ts",
      "args": ["install"],
      "cwd": "${workspaceFolder}/test-project",
      "runtimeArgs": ["-r", "tsx/cjs"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug mini-pnpm add",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/cli/index.ts",
      "args": ["add", "lodash"],
      "cwd": "${workspaceFolder}/test-project",
      "runtimeArgs": ["-r", "tsx/cjs"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug mini-pnpm list",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/cli/index.ts",
      "args": ["list"],
      "cwd": "${workspaceFolder}/test-project",
      "runtimeArgs": ["-r", "tsx/cjs"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## 调试技巧

### 1. 添加调试日志

在代码中添加 console.log 进行调试：

```typescript
// 在任何函数中添加
console.log('🐛 调试信息:', { packageName, version });
console.log('📦 包信息:', JSON.stringify(packageInfo, null, 2));
```

### 2. 环境变量调试

设置调试环境变量：

```bash
# 开启调试模式
DEBUG=mini-pnpm:* pnpm dev install

# 或者
NODE_ENV=development pnpm dev install
```

### 3. 创建测试用例

创建简单的测试脚本：

```bash
# test.sh
#!/bin/bash
echo "测试 add 命令..."
pnpm dev add lodash@4.17.21

echo "测试 list 命令..."
pnpm dev list

echo "测试 remove 命令..."
pnpm dev remove lodash
```

## 常用调试命令

### 在项目根目录

```bash
# 1. 查看帮助
pnpm dev --help

# 2. 调试 list 命令
pnpm dev list

# 3. 调试 add 命令（不会真正安装）
pnpm dev add axios@1.6.0

# 4. 调试 install 命令（当前只解析依赖）
pnpm dev install

# 5. 查看构建产物
ls -la dist/
```

### 在测试项目目录 (test-project/)

```bash
# 进入测试目录
cd test-project

# 1. 查看当前依赖
../dist/cli/index.js list

# 2. 添加依赖
../dist/cli/index.js add moment

# 3. 查看 package.json 变化
cat package.json

# 4. 移除依赖
../dist/cli/index.js remove moment
```

## 调试特定功能

### 调试 Registry 交互

```typescript
// 在 src/core/registry.ts 中添加
console.log('🌐 请求 URL:', `${this.registryUrl}/${packageName}`);
console.log('📥 响应数据:', response.data);
```

### 调试 Package 解析

```typescript
// 在 src/core/package.ts 中添加
console.log('📦 创建包:', { name, version });
console.log('🔗 依赖:', this.dependencies);
```

### 调试 CLI 参数

```typescript
// 在命令文件中添加
console.log('⚙️ 命令选项:', options);
console.log('📝 参数:', packageNames);
```

## 错误调试

### 常见错误及解决方案

1. **模块导入错误**
```bash
# 确保构建是最新的
pnpm build
```

2. **网络请求错误**
```bash
# 检查网络连接
curl https://registry.npmjs.org/lodash
```

3. **权限错误**
```bash
# 确保有执行权限
chmod +x dist/cli/index.js
```

## 监控模式

### 开发时自动重建

```bash
# 监听文件变化并自动重建
pnpm build --watch
```

### 监听模式调试

```bash
# 在一个终端运行监听构建
pnpm build --watch

# 在另一个终端调试
node dist/cli/index.js list
```

## 性能调试

### 查看执行时间

```typescript
// 在函数开始
const startTime = Date.now();

// 在函数结束
console.log(`⏱️ 执行时间: ${Date.now() - startTime}ms`);
```

### 内存使用监控

```typescript
console.log('💾 内存使用:', process.memoryUsage());
```

## 快速调试脚本

创建 `debug.js` 文件：

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🚀 开始调试 mini-pnpm...');

try {
  // 构建项目
  console.log('🔨 构建项目...');
  execSync('pnpm build', { stdio: 'inherit' });
  
  // 运行测试
  console.log('🧪 运行测试...');
  execSync('cd test-project && ../dist/cli/index.js list', { stdio: 'inherit' });
  
  console.log('✅ 调试完成！');
} catch (error) {
  console.error('❌ 调试失败:', error.message);
}
```

使用：

```bash
node debug.js
```

这样你就可以轻松调试 mini-pnpm 的各个功能了！🎯 