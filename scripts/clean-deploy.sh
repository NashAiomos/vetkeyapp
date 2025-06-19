#!/bin/bash

set -e          # Exit immediately if a command exits with a non-zero status
set -u          # Treat unset variables as an error
set -o pipefail # Ensure errors propagate in pipelines

echo "清理缓存和构建文件..."

# 清理前端缓存
rm -rf node_modules/.vite
rm -rf src/frontend/.vite
rm -rf dist

# 清理后端缓存
rm -rf target

# 清理 dfx 缓存
dfx stop
rm -rf .dfx

echo "启动本地网络..."
dfx start --clean --background

echo "部署 Internet Identity..."
dfx deploy internet_identity

echo "重新部署所有容器..."
./scripts/deploy.sh

echo "部署完成！"
echo "请访问: http://localhost:4943"
echo ""
echo "提示："
echo "1. 请使用 Chrome 隐身模式测试，避免缓存问题"
echo "2. 登录后请等待几秒钟让会话完全建立"
echo "3. 如果仍有问题，请查看浏览器控制台的日志" 