# 向任意以太坊地址发送加密文件

本演示应用程序允许您向任意以太坊地址发送加密文件。它使用[基于身份的加密(IBE)](https://en.wikipedia.org/wiki/Identity-based_encryption)和Internet Computer的[vetKeys](https://internetcomputer.org/docs/current/references/vetkeys-overview/)（可验证加密阈值密钥派生）功能。

> **简介** 
> Internet Computer上的vetKeys让开发者更容易进行加密、阈值解密和签名。**vetKeys允许公共区块链持有秘密。**

[![贡献者][contributors-shield]][contributors-url]
[![分支][forks-shield]][forks-url]
[![星标][stars-shield]][stars-url]
[![问题][issues-shield]][issues-url]
[![MIT许可证][license-shield]](LICENSE)

> [!注意]
> vetKeys功能将在2025年第二季度推出。本演示使用[chainkey_testing_canister](https://github.com/dfinity/chainkey-testing-canister)来模拟vetKeys。

## 目录
- [发送文件](#发送文件)
  - [创建传输](#创建传输)
    - [获取接收者的公钥](#获取接收者的公钥)
    - [在前端加密文件](#在前端加密文件)
    - [在后端存储加密文件](#在后端存储加密文件)
- [接收文件](#接收文件)
  - [获取私钥](#获取私钥)
  - [解密文件](#解密文件)
- [本地运行](#本地运行)
- [开发模式运行前端](#开发模式运行前端)
- [部署到Internet Computer](#部署到internet-computer)
- [许可证](#许可证)
- [贡献](#贡献)

## 发送文件

用户使用[ic-siwe](https://github.com/kristoferlund/ic-siwe)提供者容器及其[支持库ic-siwe-js](https://www.npmjs.com/package/ic-siwe-js)通过以太坊地址登录。

登录过程安全地建立用户以太坊地址与其Internet Identity之间的链接。

### 创建传输

用户可以通过指定接收者的以太坊地址和要发送的文件来创建传输。

当点击`发送文件`时，会发生以下过程：

#### 获取接收者的公钥

前端调用`chainkey_testing_canister`的`vetkd_public_key`方法获取接收者的公钥。接收者的以太坊地址用作生成公钥的IBE方案的身份。

[📄 vetkd_public_key.rs](src/backend/src/vetkd/controller/vetkd_public_key.rs)

```rust
#[update]
async fn vetkd_public_key(address: String) -> Result<Vec<u8>, String> {
    let address = Address::parse_checksummed(address, None).map_err(|e| e.to_string())?;

    let args = VetkdPublicKeyArgs {
        key_id: VetkdPublicKeyArgsKeyId {
            name: "insecure_test_key_1".to_string(),
            curve: VetkdCurve::Bls12381,
        },
        derivation_path: vec![ByteBuf::from(*address.0)],
        canister_id: None,
    };

    let (result,) = chainkey_testing_canister
        .vetkd_public_key(args)
        .await
        .unwrap();

    Ok(result.public_key.to_vec())
}
```

当vetKeys功能可用后，测试容器调用将被实际的vetKeys调用替换。

#### 在前端加密文件

前端使用接收者的公钥加密文件。文件使用`ic-vetkd-utils`支持包中的`vetkd.IBECiphertext.encrypt`方法加密。当vetKeys功能可用时，该包将提供新版本。

[📄 useTransferCreate.tsx](src/frontend/src/transfer/hooks/useTransferCreate.tsx)
```javascript
/// ... 
const response = await backend.vetkd_public_key(recipientAddress);
if ("Err" in response) {
  console.error("获取接收者公钥错误", response.Err);
  return;
}

const recipientPublicKey = response.Ok as Uint8Array;
const seed = window.crypto.getRandomValues(new Uint8Array(32));
const fileBuffer = await file.arrayBuffer();
const encodedMessage = new Uint8Array(fileBuffer);
const encryptedFile = vetkd.IBECiphertext.encrypt(
  recipientPublicKey,
  new Uint8Array(0),
  encodedMessage,
  seed
);
const request = {
  to: recipientAddress,
  content_type: file.type,
  filename: file.name,
  data: encryptedFile.serialize(),
};
return backend.transfer_create(request);
```

#### 在后端存储加密文件

后端容器验证`from`和`to`参数并存储加密文件。

[📄 transfer_create.rs](src/backend/src/transfer/controller/transfer_create.rs)

```rust
#[update]
pub async fn transfer_create(args: TransferCreateRequest) -> Result<Transfer, String> {
    let principal_blob = principal_to_blob(ic_cdk::caller());
    let from = UserManager::get(principal_blob).ok_or("用户未找到".to_string())?;
    let to = Address::parse_checksummed(args.to, None).map_err(|e| e.to_string())?;
    let transfer = TransferManager::create(TransferManagerCreateArgs {
        from,
        to,
        filename: args.filename,
        content_type: args.content_type,
        data: args.data,
    })?;
    Ok(transfer)
}
```

## 接收文件

接收用户使用与发送者相同的方式通过以太坊地址登录。前端调用后端的`transfer_list`方法获取传输列表。然后用户可以下载加密文件并使用其私钥解密。

[📄 useTransferList.tsx](src/frontend/src/transfer/hooks/useTransferList.tsx)

Internet Computer上的vetKeys让开发者在ICP上构建dapp时更容易进行加密、阈值解密和签名。它基于一个名为vetKD（可验证加密阈值密钥派生）的协议，允许按需派生解密密钥。

### 获取私钥

在Internet Computer这样的开放网络中进行加密时，面临的挑战之一是如何安全地存储和检索私钥。vetKeys通过允许用户按需派生私钥来解决这个问题。为了安全地将私钥传输给请求用户，使用传输密钥来加密传输过程中的私钥。

[📄 useVetkdEncryptedKey.tsx](src/frontend/src/vetkd/hooks/useVetkdEncryptedKey.tsx)

```javascript
// ...
const seed = window.crypto.getRandomValues(new Uint8Array(32));
const transportSecretKey = new vetkd.TransportSecretKey(seed);
const response = await backend?.vetkd_encrypted_key(
  transportSecretKey.public_key(),
);
```

与获取公钥类似，后端使用调用者的以太坊地址作为密钥派生路径。还要注意传输密钥如何传递给`vetkd_encrypted_key`函数，以在返回前端之前加密私钥。

[📄 vetkd_encrypted_key.rs](src/backend/src/vetkd/controller/vetkd_encrypted_key.rs)

```rust
#[update]
async fn vetkd_encrypted_key(encryption_public_key: Vec<u8>) -> Result<Vec<u8>, String> {
    let address = get_caller_address().await?;

    let args = VetkdEncryptedKeyArgs {
        key_id: VetkdEncryptedKeyArgsKeyId {
            name: "insecure_test_key_1".to_string(),
            curve: VetkdCurve::Bls12381,
        },
        public_key_derivation_path: vec![ByteBuf::from(*address.0)],
        derivation_id: ByteBuf::new(),
        encryption_public_key: ByteBuf::from(encryption_public_key),
    };

    let (result,) = chainkey_testing_canister
        .vetkd_encrypted_key(args)
        .await
        .unwrap();

    Ok(result.encrypted_key.to_vec())
}
```

### 解密文件

一旦拥有加密的私钥，前端可以首先使用传输密钥解密私钥，然后使用私钥解密文件。

[📄 useTransferGet.tsx](src/frontend/src/transfer/hooks/useTransferGet.tsx)

```javascript
// ...
const key = transportSecretKey.decrypt(
  encryptedKey,
  publicKey!,
  new Uint8Array()
);
const ibeCiphertext = vetkd.IBECiphertext.deserialize(
  transfer.data as Uint8Array
);
const decryptedData = ibeCiphertext.decrypt(key);
return { decryptedData, ...transfer };
```

## 本地运行

前置要求：

- [本地Internet Computer开发环境](https://internetcomputer.org/docs/current/developer-docs/backend/rust/dev-env)
- [pnpm](https://pnpm.io/installation)

安装前置要求后，可以克隆此仓库并运行项目。

```bash
dfx start --clean --background
pnpm i
bash scripts/deploy.sh
```

## 开发模式运行前端

```bash
pnpm run dev
```

## 部署到Internet Computer

```bash
bash scripts/deploy-ic.sh
```

## 许可证

本项目采用MIT许可证。有关详细信息，请参阅LICENSE文件。

## 贡献

欢迎贡献！如果您有任何建议或改进，请提交issue或pull request。

[contributors-shield]: https://img.shields.io/github/contributors/kristoferlund/send_file_to_eth_demo.svg?style=for-the-badge
[contributors-url]: https://github.com/kristoferlund/send_file_to_eth_demo/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/kristoferlund/send_file_to_eth_demo.svg?style=for-the-badge
[forks-url]: https://github.com/kristoferlund/send_file_to_eth_demo/network/members
[stars-shield]: https://img.shields.io/github/stars/kristoferlund/send_file_to_eth_demo?style=for-the-badge
[stars-url]: https://github.com/kristoferlund/send_file_to_eth_demo/stargazers
[issues-shield]: https://img.shields.io/github/issues/kristoferlund/send_file_to_eth_demo.svg?style=for-the-badge
[issues-url]: https://github.com/kristoferlund/send_file_to_eth_demo/issues
[license-shield]: https://img.shields.io/github/license/kristoferlund/send_file_to_eth_demo.svg?style=for-the-badge
[license-url]: https://github.com/kristoferlund/send_file_to_eth_demo/blob/master/LICENSE.txt

