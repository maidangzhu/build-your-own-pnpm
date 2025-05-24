import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as tar from 'tar';
import * as os from 'os';

/**
 * 下载工具类
 */
export class Downloader {
  private readonly tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'mini-pnpm');
  }

  /**
   * 下载并解压 tarball
   */
  public async downloadAndExtract(tarballUrl: string, extractTo: string): Promise<void> {
    // 确保临时目录存在
    await fs.ensureDir(this.tempDir);
    
    // 生成临时文件名
    const tempFile = path.join(this.tempDir, `package-${Date.now()}.tgz`);
    
    try {
      // 下载文件
      await this.downloadFile(tarballUrl, tempFile);
      
      // 解压到目标目录
      await this.extractTarball(tempFile, extractTo);
    } finally {
      // 清理临时文件
      if (await fs.pathExists(tempFile)) {
        await fs.remove(tempFile);
      }
    }
  }

  /**
   * 下载文件
   */
  private async downloadFile(url: string, filePath: string): Promise<void> {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 30000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      throw new Error(`下载文件失败 ${url}: ${error}`);
    }
  }

  /**
   * 解压 tarball
   */
  private async extractTarball(tarballPath: string, extractTo: string): Promise<void> {
    try {
      // 确保目标目录存在
      await fs.ensureDir(extractTo);
      
      // 解压 tarball
      await tar.extract({
        file: tarballPath,
        cwd: extractTo,
        strip: 1  // 去掉顶层的 package 目录
      });
    } catch (error) {
      throw new Error(`解压文件失败 ${tarballPath}: ${error}`);
    }
  }

  /**
   * 清理临时文件
   */
  public async cleanup(): Promise<void> {
    if (await fs.pathExists(this.tempDir)) {
      await fs.remove(this.tempDir);
    }
  }
} 