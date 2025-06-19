use crate::declarations::chainkey_testing_canister::{
    chainkey_testing_canister, VetkdCurve, VetkdPublicKeyArgs, VetkdPublicKeyArgsKeyId,
};
use candid::CandidType;
use ic_cdk::update;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Debug)]
pub enum VetkdPublicKeyResponse {
    Ok(Vec<u8>),
    Err(String),
}

#[update]
pub async fn vetkd_public_key() -> VetkdPublicKeyResponse {
    let caller = ic_cdk::caller();
    ic_cdk::println!("🔓 [VETKD] 开始获取公钥 - 调用者: {}", caller);
    
    let args = VetkdPublicKeyArgs {
        key_id: VetkdPublicKeyArgsKeyId {
            name: "insecure_test_key_1".to_string(),
            curve: VetkdCurve::Bls12381G2,
        },
        derivation_path: vec![],
        canister_id: None,
    };

    ic_cdk::println!("[VETKD] 调用chainkey_testing_canister.vetkd_public_key...");

    match chainkey_testing_canister
        .vetkd_public_key(args)
        .await
    {
        Ok((result,)) => {
            ic_cdk::println!("✅ [VETKD] 成功获取公钥，长度: {} 字节", result.public_key.len());
            VetkdPublicKeyResponse::Ok(result.public_key.to_vec())
        },
        Err(e) => {
            ic_cdk::println!("❌ [VETKD] 获取公钥失败: {:?}", e);
            VetkdPublicKeyResponse::Err(format!("Failed to get public key: {:?}", e))
        }
    }
}
