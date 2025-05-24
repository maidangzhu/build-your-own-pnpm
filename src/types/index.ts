// 包的基本信息
export interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  dist?: {
    tarball: string;
    shasum: string;
  };
  [key: string]: any;
}

// package.json 文件结构
export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: any;
}

// 依赖映射类型
export type DependencyMap = Record<string, string>;

// Registry 响应类型
export interface RegistryResponse {
  name: string;
  versions: Record<string, PackageInfo>;
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  [key: string]: any;
}

// 包的元数据 (从 npm registry 获取)
export interface PackageMetadata {
  name: string;
  versions: Record<string, PackageInfo>;
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
}

// 版本信息
export interface VersionInfo {
  version: string;
  dist: {
    tarball: string;
    shasum: string;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

// 锁定文件结构
export interface LockFile {
  lockfileVersion: number;
  dependencies?: Record<string, LockDependency>;
  packages?: Record<string, LockPackage>;
}

export interface LockDependency {
  version: string;
  resolved: string;
  integrity: string;
  dependencies?: Record<string, string>;
}

export interface LockPackage {
  resolution: {
    integrity: string;
    tarball: string;
  };
  dependencies?: Record<string, string>;
}

// 安装配置
export interface InstallOptions {
  saveDev?: boolean;
  saveOptional?: boolean;
  global?: boolean;
}

// 存储中的包信息
export interface StoredPackage {
  name: string;
  version: string;
  hash: string;
  path: string;
  tarballPath: string;
  extractedPath: string;
}

// 依赖树节点
export interface DependencyNode {
  name: string;
  version: string;
  resolved: string;
  integrity: string;
  dependencies: Map<string, DependencyNode>;
  path: string;
  depth: number;
} 