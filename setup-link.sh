#!/bin/bash
set -e

PROJECT_DIR="$(pwd)"
BIN_DIR="$HOME/.local/bin"

echo "🚀 设置 mini-pnpm 全局链接..."
echo "项目目录: $PROJECT_DIR"

# 创建本地 bin 目录
mkdir -p "$BIN_DIR"

# 创建开发版本链接
cat > "$BIN_DIR/mini-pnpm-dev" << EOF
#!/bin/bash
cd "$PROJECT_DIR"
exec node_modules/.bin/tsx src/cli/index.ts "\$@"
EOF

# 创建构建版本链接  
cat > "$BIN_DIR/mini-pnpm" << EOF
#!/bin/bash
cd "$PROJECT_DIR"
# 如果 dist 不存在则构建
if [ ! -f "dist/cli/index.js" ]; then
  echo "🔨 构建项目..."
  pnpm build
fi
exec node dist/cli/index.js "\$@"
EOF

# 给予执行权限
chmod +x "$BIN_DIR/mini-pnpm-dev"
chmod +x "$BIN_DIR/mini-pnpm"

echo "✅ 创建了以下命令:"
echo "  📁 $BIN_DIR/mini-pnpm-dev  - 开发模式"
echo "  📁 $BIN_DIR/mini-pnpm      - 构建模式"

# 检查 PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo ""
  echo "📝 需要添加 $BIN_DIR 到 PATH..."
  
  # 检测 shell 类型
  if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
  elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bash_profile"
  else
    SHELL_RC="$HOME/.profile"
  fi
  
  echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$SHELL_RC"
  echo "已添加到 $SHELL_RC"
  echo ""
  echo "⚠️  请运行以下命令生效:"
  echo "   source $SHELL_RC"
  echo ""
  echo "或者重启终端"
else
  echo "✅ PATH 已包含 $BIN_DIR"
fi

echo ""
echo "🎉 设置完成！现在你可以使用:"
echo ""
echo "开发模式 (实时调试):"
echo "  mini-pnpm-dev --help"
echo "  mini-pnpm-dev add lodash"
echo "  mini-pnpm-dev list"
echo ""
echo "构建模式 (最终版本):"
echo "  mini-pnpm --help"
echo "  mini-pnpm add lodash"
echo "  mini-pnpm list"
echo ""
echo "💡 提示: 使用 mini-pnpm-dev 进行开发，mini-pnpm 进行测试" 