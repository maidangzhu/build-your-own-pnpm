import { PackageInfo, DependencyMap } from '../types';

/**
 * Package 类 - 表示单个 npm 包
 * 包含包的基本信息、依赖关系和安装状态
 */
export class Package {
  public readonly name: string;
  public readonly version: string;
  public readonly info: PackageInfo;
  public readonly dependencies: DependencyMap;
  public readonly devDependencies: DependencyMap;
  
  constructor(name: string, version: string, info: PackageInfo) {
    this.name = name;
    this.version = version;
    this.info = info;
    this.dependencies = info.dependencies || {};
    this.devDependencies = info.devDependencies || {};
  }

  /**
   * 获取包的唯一标识符
   */
  public getId(): string {
    return `${this.name}@${this.version}`;
  }

  /**
   * 获取包的哈希值（用于 store 存储）
   */
  public getHash(): string {
    // TODO: 实现基于包内容的哈希计算
    return '';
  }

  /**
   * 获取所有依赖（包括 dev 依赖）
   */
  public getAllDependencies(includeDev: boolean = false): DependencyMap {
    if (!includeDev) {
      return this.dependencies;
    }
    
    return {
      ...this.dependencies,
      ...this.devDependencies
    };
  }

  /**
   * 检查是否有指定的依赖
   */
  public hasDependency(packageName: string): boolean {
    return packageName in this.dependencies || packageName in this.devDependencies;
  }
} 