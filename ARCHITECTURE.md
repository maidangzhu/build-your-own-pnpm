# Mini-PNPM 架构说明

## 项目结构

```
src/
├── core/                 # 核心功能模块
│   ├── package.ts       # Package 类 - 表示单个包
│   ├── registry.ts      # Registry 类 - 与 npm 仓库交互
│   ├── store.ts         # Store 类 - 中心化存储管理
│   ├── linker.ts        # Linker 类 - 符号链接管理
│   └── index.ts         # 核心模块导出
├── cli/                 # 命令行接口
│   ├── commands/        # 各种命令实现
│   │   ├── install.ts   # install 命令
│   │   ├── add.ts       # add 命令
│   │   ├── remove.ts    # remove 命令
│   │   ├── list.ts      # list 命令
│   │   └── index.ts     # 命令导出
│   └── index.ts         # CLI 入口
├── types/               # TypeScript 类型定义
│   └── index.ts         # 所有类型定义
└── utils/               # 工具函数
    ├── hash.ts          # 哈希计算工具
    ├── download.ts      # 下载工具
    ├── fs.ts            # 文件系统工具
    └── index.ts         # 工具导出
```

## 核心概念

### 1. Package 类
- 表示单个 npm 包
- 包含包的基本信息、依赖关系
- 提供包的唯一标识符和哈希值计算

### 2. Registry 类
- 处理与 npm registry 的交互
- 获取包信息、解析版本范围
- 下载包的 tarball

### 3. Store 类
- 管理 pnpm 的中心化存储
- 实现包的去重和缓存
- 存储在 `~/.mini-pnpm-store` 目录

### 4. Linker 类
- 处理符号链接和硬链接
- 创建 node_modules 结构
- 实现 pnpm 的核心链接机制

## 已实现功能

### ✅ 基础架构
- [x] 项目结构搭建
- [x] TypeScript 配置
- [x] 核心类定义
- [x] CLI 框架

### ✅ 命令行工具
- [x] `mini-pnpm list` - 列出已安装的包
- [x] `mini-pnpm add <package>` - 添加新依赖
- [x] `mini-pnpm remove <package>` - 移除依赖
- [x] `mini-pnpm install` - 安装依赖（基础框架）

### ✅ Registry 交互
- [x] 获取包信息
- [x] 版本解析（基础版本）
- [x] 包验证

## 待实现功能

### 🚧 核心功能
- [ ] 完整的 semver 版本解析
- [ ] 包下载和解压
- [ ] Store 存储实现
- [ ] 符号链接创建
- [ ] 依赖树解析
- [ ] 锁文件生成

### 🚧 高级功能
- [ ] 依赖冲突解决
- [ ] Peer dependencies 处理
- [ ] 缓存优化
- [ ] 并发下载
- [ ] 完整性校验

## 使用示例

```bash
# 构建项目
pnpm build

# 在测试项目中使用
cd test-project

# 列出依赖
../dist/cli/index.js list

# 添加依赖
../dist/cli/index.js add lodash

# 移除依赖
../dist/cli/index.js remove lodash

# 安装依赖（目前只是解析）
../dist/cli/index.js install
```

## 学习要点

1. **包管理器的核心概念**：理解包、依赖、版本管理
2. **中心化存储**：pnpm 的核心优势，避免重复存储
3. **符号链接**：实现高效的 node_modules 结构
4. **依赖解析**：处理复杂的依赖关系
5. **CLI 设计**：用户友好的命令行接口

## 下一步开发建议

1. 先实现包下载功能
2. 然后实现 Store 存储逻辑
3. 接着实现符号链接创建
4. 最后完善依赖解析算法

这个架构为你提供了一个完整的学习框架，你可以逐步实现各个功能模块！ 