import { createHash } from 'crypto';

/**
 * 为包生成唯一的哈希值
 * 基于包名和版本生成，确保相同的包不会重复存储
 */
export const generatePackageHash = (name: string, version: string): string => {
  const content = `${name}@${version}`;
  return createHash('sha256').update(content).digest('hex');
};

/**
 * 为文件内容生成哈希值
 * 用于验证下载的包的完整性
 */
export const generateFileHash = (content: Buffer): string => {
  return createHash('sha1').update(content).digest('hex');
};

/**
 * 验证文件哈希值是否匹配
 */
export const verifyHash = (content: Buffer, expectedHash: string): boolean => {
  const actualHash = generateFileHash(content);
  return actualHash === expectedHash;
}; 