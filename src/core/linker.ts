import * as path from 'path';
import * as fs from 'fs-extra';
import { Package } from './package';
import { Store } from './store';

/**
 * Linker 类 - 处理符号链接和硬链接
 * 实现 pnpm 的核心链接机制
 */
export class Linker {
  private readonly store: Store;
  private readonly projectRoot: string;

  constructor(store: Store, projectRoot: string = process.cwd()) {
    this.store = store;
    this.projectRoot = projectRoot;
  }

  /**
   * 为项目创建 node_modules 结构
   */
  public async createNodeModules(packages: Package[]): Promise<void> {
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    
    // 确保 node_modules 目录存在
    await fs.ensureDir(nodeModulesPath);
    
    // 为每个包创建链接
    for (const pkg of packages) {
      await this.linkPackage(pkg, nodeModulesPath);
    }
  }

  /**
   * 为单个包创建链接
   */
  public async linkPackage(pkg: Package, nodeModulesPath: string): Promise<void> {
    const packageLinkPath = path.join(nodeModulesPath, pkg.name);
    const storePackagePath = await this.store.getPackage(pkg);
    
    if (!storePackagePath) {
      throw new Error(`包 ${pkg.getId()} 在 store 中不存在`);
    }
    
    // 如果链接已存在，先删除
    if (await fs.pathExists(packageLinkPath)) {
      await fs.remove(packageLinkPath);
    }
    
    // 创建符号链接到 store 中的包
    await this.createSymlink(storePackagePath, packageLinkPath);
    
    // 处理包的依赖
    await this.linkDependencies(pkg, packageLinkPath);
  }

  /**
   * 处理包的依赖链接
   */
  private async linkDependencies(pkg: Package, packagePath: string): Promise<void> {
    const dependencies = pkg.getAllDependencies();
    
    if (Object.keys(dependencies).length === 0) {
      return;
    }
    
    const depNodeModulesPath = path.join(packagePath, 'node_modules');
    await fs.ensureDir(depNodeModulesPath);
    
    // TODO: 这里需要实现依赖解析逻辑
    // 暂时跳过，在后续阶段实现
    console.log(`处理 ${pkg.getId()} 的依赖: ${Object.keys(dependencies).join(', ')}`);
  }

  /**
   * 创建符号链接
   */
  private async createSymlink(source: string, target: string): Promise<void> {
    try {
      // 确保目标目录存在
      await fs.ensureDir(path.dirname(target));
      
      // 在某些系统上，可能需要使用硬链接
      if (process.platform === 'win32') {
        // Windows 上使用 junction
        await fs.symlink(source, target, 'junction');
      } else {
        // Unix 系统使用符号链接
        await fs.symlink(source, target, 'dir');
      }
    } catch (error) {
      throw new Error(`创建链接失败 ${source} -> ${target}: ${error}`);
    }
  }

  /**
   * 创建硬链接（用于文件）
   */
  private async createHardlink(source: string, target: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(target));
      await fs.link(source, target);
    } catch (error) {
      throw new Error(`创建硬链接失败 ${source} -> ${target}: ${error}`);
    }
  }

  /**
   * 删除包的链接
   */
  public async unlinkPackage(packageName: string): Promise<void> {
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    const packageLinkPath = path.join(nodeModulesPath, packageName);
    
    if (await fs.pathExists(packageLinkPath)) {
      await fs.remove(packageLinkPath);
    }
  }

  /**
   * 清理所有链接
   */
  public async cleanNodeModules(): Promise<void> {
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    
    if (await fs.pathExists(nodeModulesPath)) {
      await fs.remove(nodeModulesPath);
    }
  }

  /**
   * 验证链接的完整性
   */
  public async validateLinks(): Promise<{ valid: boolean; issues: string[] }> {
    // TODO: 实现链接完整性检查
    return { valid: true, issues: [] };
  }
} 