# 项目重构总结

## 主要变更

### 1. 认证系统改变
- **移除**: 以太坊钱包登录 (ic_siwe_provider, wagmi, viem)
- **新增**: Internet Identity (II) 登录
- **影响**: 用户现在使用 Principal ID 而不是以太坊地址作为身份标识

### 2. 前端变更

#### 新增文件
- `src/frontend/src/auth/AuthContext.tsx` - II 认证上下文管理

#### 修改文件
- `main.tsx` - 移除 WagmiProvider 和 SiweIdentityProvider，使用 AuthProvider
- `AuthGuard.tsx` - 使用新的 AuthContext
- `LoginPage.tsx` - 简化为只有 II 登录按钮
- `SendFile.tsx` - 接收 Principal ID 而不是以太坊地址
- `ReceivedFiles.tsx` - 显示 Principal ID 而不是以太坊地址
- `Header.tsx` - 显示 Principal ID 徽章
- `SessionDialog.tsx` - 显示 Principal 信息
- `App.tsx` - 所有文本改为中文

#### 删除文件
- `wagmi/` 目录 - 所有 wagmi 相关配置
- `components/EthBadge.tsx` - 以太坊地址徽章
- `components/login/ConnectButton.tsx` - 钱包连接按钮
- `components/login/LoginButton.tsx` - 以太坊登录按钮
- `lib/shortenEthAddress.ts` - 以太坊地址格式化工具

### 3. 后端变更

#### 修改文件
- `lib.rs` - USERS 存储类型从 EthAddressBytes 改为 String
- `user_manager.rs` - 直接存储 Principal ID 字符串
- `user_register.rs` - 返回 Principal ID 而不是以太坊地址
- `transfer_manager.rs` - 使用 String 类型的 Principal ID
- `transfer_create.rs` - 验证 Principal ID 格式而不是以太坊地址
- `vetkd_encrypted_key.rs` - 使用 Principal 作为 derivation_id
- `utils.rs` - 删除 get_caller_address 函数

#### 删除内容
- 所有 alloy 库的使用（以太坊相关）
- ic_siwe_provider 的调用

### 4. 依赖变更

#### package.json
- **移除**: ic-siwe-js, wagmi, viem
- **新增**: @dfinity/auth-client

#### Cargo.toml
- 移除了对 ic_siwe_provider 的依赖引用

### 5. 配置变更

#### dfx.json
- 移除 ic_siwe_provider canister 配置

## 功能对比

| 功能 | 重构前 | 重构后 |
|------|--------|--------|
| 登录方式 | 以太坊钱包 | Internet Identity |
| 用户标识 | 以太坊地址 (0x...) | Principal ID |
| 文件加密密钥派生 | 基于以太坊地址 | 基于 Principal ID |
| 文件接收者 | 以太坊地址 | Principal ID |

## 注意事项

1. 所有用户界面文本已改为中文
2. chainkey_testing_canister 相关功能保持不变
3. vetKeys 加密功能保持不变，只是标识符从以太坊地址改为 Principal ID
4. 文件大小限制（1MB）保持不变 