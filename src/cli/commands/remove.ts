import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Linker, Store } from '../../core';
import { PackageJson } from '../../types';

/**
 * remove 命令 - 移除依赖
 */
export const createRemoveCommand = (): Command => {
  const command = new Command('remove')
    .alias('rm')
    .description('移除依赖')
    .argument('<packages...>', '要移除的包名')
    .option('--store <path>', '指定 store 目录')
    .action(async (packages: string[], options) => {
      try {
        await handleRemove(packages, options);
      } catch (error) {
        console.error('移除依赖失败:', error);
        process.exit(1);
      }
    });

  return command;
};

/**
 * 处理移除依赖逻辑
 */
const handleRemove = async (packageNames: string[], options: any): Promise<void> => {
  console.log(`开始移除依赖: ${packageNames.join(', ')}`);
  
  // 读取当前 package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    throw new Error('当前目录没有找到 package.json 文件');
  }
  
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  
  // 记录移除的包
  const removedPackages: string[] = [];
  
  // 从 dependencies 和 devDependencies 中移除
  for (const packageName of packageNames) {
    let removed = false;
    
    if (packageJson.dependencies && packageName in packageJson.dependencies) {
      delete packageJson.dependencies[packageName];
      removed = true;
      console.log(`从 dependencies 中移除 ${packageName}`);
    }
    
    if (packageJson.devDependencies && packageName in packageJson.devDependencies) {
      delete packageJson.devDependencies[packageName];
      removed = true;
      console.log(`从 devDependencies 中移除 ${packageName}`);
    }
    
    if (removed) {
      removedPackages.push(packageName);
    } else {
      console.warn(`警告: 包 ${packageName} 不在依赖列表中`);
    }
  }
  
  if (removedPackages.length === 0) {
    console.log('没有移除任何依赖');
    return;
  }
  
  // 写回 package.json
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  console.log('package.json 更新完成');
  
  // 清理 node_modules 中的链接
  try {
    const store = new Store(options.store);
    const linker = new Linker(store);
    
    for (const packageName of removedPackages) {
      await linker.unlinkPackage(packageName);
      console.log(`清理 ${packageName} 的链接`);
    }
  } catch (error) {
    console.warn('清理链接时出错:', error);
    console.log('建议手动运行 mini-pnpm install 来重新创建链接结构');
  }
  
  console.log(`成功移除 ${removedPackages.length} 个依赖`);
}; 