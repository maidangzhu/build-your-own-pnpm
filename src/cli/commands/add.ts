import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Store, Registry, Package } from '../../core';
import { PackageJson } from '../../types';

/**
 * add 命令 - 添加新依赖
 * 原理：
 * 1. 确保 store 存在
 * 2. 读取 package.json 文件，并解析为对象
 * 3. 解析安装包规格，获取包名和版本号，如果没有带版本号，通过 axios 请求 npm registry 获取最新版本号
 * 4. 添加到 package.json 对象内
 * 5. 写回 package.json 文件
 * 6. 自动运行 install 来安装新添加的依赖
 */
export const createAddCommand = (): Command => {
  const command = new Command('add')
    .description('添加新依赖')
    .argument('<packages...>', '要添加的包名')
    .option('-D, --save-dev', '添加到开发依赖')
    .option('--store <path>', '指定 store 目录')
    .action(async (packages: string[], options) => {
      try {
        await handleAdd(packages, options);
      } catch (error) {
        console.error('添加依赖失败:', error);
        process.exit(1);
      }
    });

  return command;
};

/**
 * 处理添加依赖逻辑
 */
const handleAdd = async (packageNames: string[], options: any): Promise<void> => {
  console.log(`开始添加依赖: ${packageNames.join(', ')}`);
  
  // 初始化核心组件
  const store = new Store(options.store);
  const registry = new Registry();
  
  // 初始化 store
  await store.init();
  
  // 读取当前 package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    throw new Error('当前目录没有找到 package.json 文件');
  }
  
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  
  // 解析要添加的包
  const resolvedPackages: Array<{ name: string; version: string }> = [];
  
  for (const packageSpec of packageNames) {
    const { name, versionRange } = parsePackageSpec(packageSpec);
    
    console.log(`正在解析 ${name}@${versionRange}...`);
    
    try {
      // 解析版本
      const version = await registry.resolveVersion(name, versionRange);
      
      // 获取包信息（验证包存在）
      await registry.getPackageVersion(name, version);
      
      resolvedPackages.push({ name, version });
      
      console.log(`✓ 解析成功: ${name}@${version}`);
    } catch (error) {
      console.error(`✗ 解析失败 ${name}@${versionRange}:`, error);
      throw error;
    }
  }
  
  // 更新 package.json
  const dependencyKey = options.saveDev ? 'devDependencies' : 'dependencies';
  
  if (!packageJson[dependencyKey]) {
    packageJson[dependencyKey] = {};
  }
  
  for (const { name, version } of resolvedPackages) {
    packageJson[dependencyKey]![name] = `^${version}`;
    console.log(`添加 ${name}@^${version} 到 ${dependencyKey}`);
  }
  
  // 写回 package.json
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  
  console.log('package.json 更新完成');
  
  // TODO: 自动运行 install 来安装新添加的依赖
  console.log('请运行 mini-pnpm install 来安装新添加的依赖');
};

/**
 * 解析包规格 (例如: lodash, lodash@4.17.21, lodash@^4.0.0)
 */
const parsePackageSpec = (packageSpec: string): { name: string; versionRange: string } => {
  const atIndex = packageSpec.lastIndexOf('@');
  
  if (atIndex <= 0) {
    // 没有版本号，使用 latest
    return { name: packageSpec, versionRange: 'latest' };
  }
  
  const name = packageSpec.substring(0, atIndex);
  const versionRange = packageSpec.substring(atIndex + 1);
  
  return { name, versionRange };
}; 