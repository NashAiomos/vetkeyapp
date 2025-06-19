use crate::{
    declarations::chainkey_testing_canister::{
        chainkey_testing_canister, VetkdCurve, VetkdDeriveEncryptedKeyArgs,
        VetkdDeriveEncryptedKeyArgsKeyId,
    },
};
use candid::{CandidType, Principal};
use ic_cdk::update;
use serde::Deserialize;
use serde_bytes::ByteBuf;

#[derive(CandidType, Deserialize, Debug)]
pub enum VetkdEncryptedKeyResponse {
    Ok(Vec<u8>),
    Err(String),
}

#[update]
pub async fn vetkd_encrypted_key(encryption_public_key: Vec<u8>) -> VetkdEncryptedKeyResponse {
    let caller = ic_cdk::caller();
    ic_cdk::println!("[VETKD] 开始生成加密密钥 - 调用者: {}", caller);
    
    if caller == Principal::anonymous() {
        ic_cdk::println!("❌ [VETKD] 拒绝匿名调用者");
        return VetkdEncryptedKeyResponse::Err("anonymous caller not allowed".to_string());
    }

    ic_cdk::println!("[VETKD] 接收到的加密公钥长度: {} 字节", encryption_public_key.len());
    ic_cdk::println!("[VETKD] 使用推导ID: {:?}", caller.as_slice());

    let args = VetkdDeriveEncryptedKeyArgs {
        key_id: VetkdDeriveEncryptedKeyArgsKeyId {
            name: "insecure_test_key_1".to_string(),
            curve: VetkdCurve::Bls12381G2,
        },
        derivation_path: vec![],
        derivation_id: ByteBuf::from(caller.as_slice()),
        encryption_public_key: ByteBuf::from(encryption_public_key),
    };

    ic_cdk::println!("[VETKD] 调用chainkey_testing_canister.vetkd_derive_encrypted_key...");

    match chainkey_testing_canister
        .vetkd_derive_encrypted_key(args)
        .await
    {
        Ok((result,)) => {
            ic_cdk::println!("✅ [VETKD] 成功生成加密密钥，长度: {} 字节", result.encrypted_key.len());
            VetkdEncryptedKeyResponse::Ok(result.encrypted_key.to_vec())
        },
        Err(e) => {
            ic_cdk::println!("❌ [VETKD] 生成加密密钥失败: {:?}", e);
            VetkdEncryptedKeyResponse::Err(format!("Failed to derive encrypted key: {:?}", e))
        }
    }
}
