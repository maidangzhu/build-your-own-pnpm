import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Store } from '../../core';
import { PackageJson } from '../../types';

/**
 * list 命令 - 列出已安装的包
 */
export const createListCommand = (): Command => {
  const command = new Command('list')
    .alias('ls')
    .description('列出已安装的包')
    .option('--depth <number>', '显示依赖深度', '0')
    .option('--dev', '包含开发依赖')
    .option('--store <path>', '指定 store 目录')
    .action(async (options) => {
      try {
        await handleList(options);
      } catch (error) {
        console.error('列出依赖失败:', error);
        process.exit(1);
      }
    });

  return command;
};

/**
 * 处理列出依赖逻辑
 */
const handleList = async (options: any): Promise<void> => {
  // 读取当前 package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    throw new Error('当前目录没有找到 package.json 文件');
  }
  
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  
  console.log(`${packageJson.name || 'unknown'}@${packageJson.version || '0.0.0'}`);
  console.log(process.cwd());
  
  // 收集依赖
  const dependencies = packageJson.dependencies || {};
  const devDependencies = options.dev ? (packageJson.devDependencies || {}) : {};
  
  // 显示生产依赖
  if (Object.keys(dependencies).length > 0) {
    console.log('\n生产依赖:');
    for (const [name, version] of Object.entries(dependencies)) {
      const status = await getPackageStatus(name, options.store);
      console.log(`├── ${name}@${version} ${status}`);
    }
  }
  
  // 显示开发依赖
  if (options.dev && Object.keys(devDependencies).length > 0) {
    console.log('\n开发依赖:');
    for (const [name, version] of Object.entries(devDependencies)) {
      const status = await getPackageStatus(name, options.store);
      console.log(`├── ${name}@${version} ${status}`);
    }
  }
  
  // 显示统计信息
  const totalDeps = Object.keys(dependencies).length;
  const totalDevDeps = Object.keys(devDependencies).length;
  
  console.log(`\n总计: ${totalDeps} 个生产依赖${options.dev ? `，${totalDevDeps} 个开发依赖` : ''}`);
  
  // TODO: 在后续阶段实现依赖树显示
  if (parseInt(options.depth) > 0) {
    console.log('\n注意: 依赖树显示功能尚未实现');
  }
};

/**
 * 获取包的安装状态
 */
const getPackageStatus = async (packageName: string, storeDir?: string): Promise<string> => {
  try {
    // 检查 node_modules 中是否存在
    const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName);
    const existsInNodeModules = await fs.pathExists(nodeModulesPath);
    
    if (!existsInNodeModules) {
      return '(未安装)';
    }
    
    // 检查是否为符号链接
    const stats = await fs.lstat(nodeModulesPath);
    if (stats.isSymbolicLink()) {
      return '(已链接)';
    }
    
    return '(已安装)';
  } catch (error) {
    return '(状态未知)';
  }
}; 