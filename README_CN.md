# 基于 Internet Identity 的加密文件传输系统

这是一个使用 Internet Computer 的 Internet Identity (II) 登录系统的加密文件传输应用。用户可以使用 II 登录后，向任何 Principal ID 发送加密文件。

## 主要功能

- 使用 Internet Identity 进行身份验证
- 基于 Principal ID 的文件加密传输
- 使用 vetKeys 和基于身份的加密 (IBE) 技术
- 支持最大 1MB 的文件传输

## 技术架构

### 前端
- React + TypeScript
- Vite 构建工具
- TailwindCSS 样式
- @dfinity/auth-client 用于 II 认证
- ic-vetkd-utils 用于文件加密

### 后端
- Rust canister
- 使用 Principal ID 作为用户标识
- 集成 chainkey_testing_canister 用于 vetKeys 功能

## 运行项目

### 前置要求
- Node.js >= 18.18.0
- dfx >= 0.15.0
- Rust
- Internet Computer 本地开发环境

### 启动步骤

1. 启动本地 IC 网络：
```bash
dfx start --clean
```

2. 部署 canisters：
```bash
dfx deploy
```

3. 启动前端开发服务器：
```bash
npm run dev
```

4. 访问 http://localhost:5173

## 使用说明

1. 点击"使用 Internet Identity 登录"按钮
2. 完成 II 认证流程
3. 登录后可以看到你的 Principal ID
4. 在"发送文件"区域输入接收者的 Principal ID
5. 选择或拖拽文件（最大 1MB）
6. 点击"发送文件"
7. 在"接收的文件"区域查看收到的文件
8. 点击文件可以解密并下载

## 注意事项

- 本项目使用的是 vetKeys API 的模拟实现，仅供演示使用
- vetKeys 的生产版本将于 2025 年第二季度推出
- 请勿将真实的密钥信息托付给此应用程序

## 项目结构

```
vetkey_eth/
├── src/
│   ├── backend/          # Rust 后端 canister
│   ├── frontend/         # React 前端应用
│   └── chainkey_testing_canister/  # vetKeys 测试 canister
├── dfx.json             # IC 项目配置
└── package.json         # npm 依赖配置
``` 