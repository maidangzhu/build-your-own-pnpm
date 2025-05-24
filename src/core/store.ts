import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { Package } from './package';

/**
 * Store 类 - 管理 pnpm 的中心化存储
 * 负责包的存储、缓存和去重
 */
export class Store {
  private readonly storeDir: string;
  private readonly contentDir: string;
  private readonly metadataDir: string;

  constructor(storeDir?: string) {
    // 默认存储目录为用户主目录下的 .mini-pnpm-store
    this.storeDir = storeDir || path.join(os.homedir(), '.mini-pnpm-store');
    this.contentDir = path.join(this.storeDir, 'v3');
    this.metadataDir = path.join(this.storeDir, 'metadata');
  }

  /**
   * 初始化 store 目录
   */
  public async init(): Promise<void> {
    await fs.ensureDir(this.contentDir);
    await fs.ensureDir(this.metadataDir);
  }

  /**
   * 获取包在 store 中的路径
   */
  public getPackagePath(pkg: Package): string {
    const hash = this.calculatePackageHash(pkg);
    return path.join(this.contentDir, hash);
  }

  /**
   * 检查包是否已经在 store 中存在
   */
  public async hasPackage(pkg: Package): Promise<boolean> {
    const packagePath = this.getPackagePath(pkg);
    return fs.pathExists(packagePath);
  }

  /**
   * 将包存储到 store 中
   */
  public async storePackage(pkg: Package, sourceDir: string): Promise<string> {
    const packagePath = this.getPackagePath(pkg);
    
    // 如果已经存在，直接返回路径
    if (await this.hasPackage(pkg)) {
      return packagePath;
    }

    // 确保目标目录存在
    await fs.ensureDir(path.dirname(packagePath));
    
    // 复制包内容到 store
    await fs.copy(sourceDir, packagePath);
    
    // 保存元数据
    await this.saveMetadata(pkg);
    
    return packagePath;
  }

  /**
   * 从 store 中获取包
   */
  public async getPackage(pkg: Package): Promise<string | null> {
    const packagePath = this.getPackagePath(pkg);
    
    if (await fs.pathExists(packagePath)) {
      return packagePath;
    }
    
    return null;
  }

  /**
   * 计算包的哈希值
   */
  private calculatePackageHash(pkg: Package): string {
    // TODO: 实现基于包内容的哈希计算
    // 暂时使用简单的字符串拼接
    const hashInput = `${pkg.name}@${pkg.version}`;
    return Buffer.from(hashInput).toString('hex');
  }

  /**
   * 保存包的元数据
   */
  private async saveMetadata(pkg: Package): Promise<void> {
    const metadataPath = path.join(this.metadataDir, `${pkg.name}@${pkg.version}.json`);
    const metadata = {
      name: pkg.name,
      version: pkg.version,
      installedAt: new Date().toISOString(),
      dependencies: pkg.dependencies
    };
    
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
  }

  /**
   * 清理 store（删除未使用的包）
   */
  public async prune(): Promise<void> {
    // TODO: 实现清理逻辑
    console.log('Store 清理功能尚未实现');
  }

  /**
   * 获取 store 的统计信息
   */
  public async getStats(): Promise<{ totalPackages: number; totalSize: number }> {
    // TODO: 实现统计功能
    return { totalPackages: 0, totalSize: 0 };
  }
} 