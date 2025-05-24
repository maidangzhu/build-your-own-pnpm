import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Store, Registry, Linker, Package } from '../../core';
import { PackageJson } from '../../types';

/**
 * install 命令 - 安装项目依赖
 */
export const createInstallCommand = (): Command => {
  const command = new Command('install')
    .alias('i')
    .description('安装项目依赖')
    .option('--dev', '同时安装开发依赖')
    .option('--store <path>', '指定 store 目录')
    .action(async (options) => {
      try {
        await handleInstall(options);
      } catch (error) {
        console.error('安装失败:', error);
        process.exit(1);
      }
    });

  return command;
};

/**
 * 处理安装逻辑
 */
const handleInstall = async (options: any): Promise<void> => {
  console.log('开始安装依赖...');
  
  // 初始化核心组件
  const store = new Store(options.store);
  const registry = new Registry();
  const linker = new Linker(store);
  
  // 初始化 store
  await store.init();
  
  // 读取 package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    throw new Error('当前目录没有找到 package.json 文件');
  }
  
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  
  // 获取需要安装的依赖
  const dependencies = packageJson.dependencies || {};
  const devDependencies = options.dev ? (packageJson.devDependencies || {}) : {};
  const allDependencies = { ...dependencies, ...devDependencies };
  
  if (Object.keys(allDependencies).length === 0) {
    console.log('没有发现需要安装的依赖');
    return;
  }
  
  console.log(`发现 ${Object.keys(allDependencies).length} 个依赖需要安装`);
  
  // TODO: 实现依赖解析和安装逻辑
  const packages: Package[] = [];
  
  for (const [name, versionRange] of Object.entries(allDependencies)) {
    console.log(`正在解析 ${name}@${versionRange}...`);
    
    try {
      // 解析版本
      const version = await registry.resolveVersion(name, versionRange);
      
      // 获取包信息
      const packageInfo = await registry.getPackageVersion(name, version);
      
      // 创建 Package 实例
      const pkg = new Package(name, version, packageInfo);
      
      packages.push(pkg);
      
      console.log(`✓ 解析成功: ${pkg.getId()}`);
    } catch (error) {
      console.error(`✗ 解析失败 ${name}@${versionRange}:`, error);
      throw error;
    }
  }
  
  // TODO: 下载和存储包到 store
  // TODO: 创建链接结构
  
  console.log('依赖解析完成，但下载和链接功能尚未实现');
  console.log('已解析的包:');
  packages.forEach(pkg => {
    console.log(`  - ${pkg.getId()}`);
  });
}; 