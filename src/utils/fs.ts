import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 文件系统工具函数
 */

/**
 * 安全地删除目录或文件
 */
export const safeRemove = async (targetPath: string): Promise<void> => {
  try {
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath);
    }
  } catch (error) {
    console.warn(`删除 ${targetPath} 失败:`, error);
  }
};

/**
 * 复制文件或目录，如果目标已存在则跳过
 */
export const copyIfNotExists = async (src: string, dest: string): Promise<boolean> => {
  if (await fs.pathExists(dest)) {
    return false; // 已存在，跳过
  }
  
  await fs.copy(src, dest);
  return true; // 复制成功
};

/**
 * 检查路径是否为符号链接
 */
export const isSymlink = async (targetPath: string): Promise<boolean> => {
  try {
    const stats = await fs.lstat(targetPath);
    return stats.isSymbolicLink();
  } catch (error) {
    return false;
  }
};

/**
 * 获取目录大小（递归计算）
 */
export const getDirSize = async (dirPath: string): Promise<number> => {
  let totalSize = 0;
  
  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        totalSize += await getDirSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // 忽略无法访问的目录
  }
  
  return totalSize;
};

/**
 * 格式化文件大小
 */
export const formatSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 确保目录存在，如果不存在则创建
 */
export const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.ensureDir(dirPath);
};

/**
 * 读取 JSON 文件，如果不存在返回默认值
 */
export const readJsonSafe = async <T>(filePath: string, defaultValue: T): Promise<T> => {
  try {
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
  } catch (error) {
    console.warn(`读取 JSON 文件失败 ${filePath}:`, error);
  }
  
  return defaultValue;
};

/**
 * 写入 JSON 文件，如果目录不存在则创建
 */
export const writeJsonSafe = async (filePath: string, data: any): Promise<void> => {
  try {
    await ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, data, { spaces: 2 });
  } catch (error) {
    throw new Error(`写入 JSON 文件失败 ${filePath}: ${error}`);
  }
}; 