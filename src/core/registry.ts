import axios, { AxiosInstance } from 'axios';
import { PackageInfo, RegistryResponse } from '../types';

/**
 * Registry 类 - 处理与 npm registry 的交互
 * 负责获取包信息、下载包等操作
 */
export class Registry {
  private readonly client: AxiosInstance;
  private readonly registryUrl: string;

  constructor(registryUrl: string = 'https://registry.npmjs.org') {
    this.registryUrl = registryUrl;
    this.client = axios.create({
      baseURL: registryUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'mini-pnpm/0.1.0',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * 获取包的完整信息
   */
  public async getPackageInfo(packageName: string): Promise<RegistryResponse> {
    try {
      const response = await this.client.get(`/${packageName}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取包 ${packageName} 信息失败: ${error}`);
    }
  }

  /**
   * 获取特定版本的包信息
   */
  public async getPackageVersion(packageName: string, version: string): Promise<PackageInfo> {
    try {
      const packageInfo = await this.getPackageInfo(packageName);
      
      if (!packageInfo.versions[version]) {
        throw new Error(`包 ${packageName} 没有版本 ${version}`);
      }
      
      return packageInfo.versions[version];
    } catch (error) {
      throw new Error(`获取包 ${packageName}@${version} 信息失败: ${error}`);
    }
  }

  /**
   * 解析版本范围，返回最匹配的版本
   */
  public async resolveVersion(packageName: string, versionRange: string): Promise<string> {
    // TODO: 实现 semver 版本解析
    // 暂时返回 latest
    try {
      const packageInfo = await this.getPackageInfo(packageName);
      return packageInfo['dist-tags'].latest;
    } catch (error) {
      throw new Error(`解析包 ${packageName} 版本 ${versionRange} 失败: ${error}`);
    }
  }

  /**
   * 下载包的 tarball
   */
  public async downloadPackage(tarballUrl: string, destination: string): Promise<void> {
    // TODO: 实现包下载逻辑
    throw new Error('下载功能尚未实现');
  }
} 