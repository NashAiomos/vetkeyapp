use crate::{
    transfer::{
        transfer_manager::{TransferManager, TransferManagerCreateArgs},
        transfer_types::Transfer,
    },
    user::user_manager::UserManager,
    utils::principal_to_blob,
};
use candid::{CandidType, Principal};
use ic_cdk::update;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct TransferCreateRequest {
    pub to: String,
    pub filename: String,
    pub content_type: String,
    pub data: Vec<u8>,
}

#[update]
pub async fn transfer_create(args: TransferCreateRequest) -> Result<Transfer, String> {
    let caller = ic_cdk::caller();
    ic_cdk::println!("📤 [传输创建] 开始创建新传输 - 调用者: {}", caller);
    ic_cdk::println!("📤 [传输创建] 目标接收者: {}", args.to);
    ic_cdk::println!("📤 [传输创建] 文件名: {}", args.filename);
    ic_cdk::println!("📤 [传输创建] 文件类型: {}", args.content_type);
    ic_cdk::println!("📤 [传输创建] 加密数据大小: {} 字节", args.data.len());
    
    let principal_blob = principal_to_blob(caller);
    let from = UserManager::get(principal_blob).ok_or("User not found".to_string())?;
    ic_cdk::println!("✅ [传输创建] 发送者验证成功: {}", from);
    
    // 验证目标Principal ID是否有效
    Principal::from_text(&args.to).map_err(|e| {
        ic_cdk::println!("❌ [传输创建] 无效的接收者Principal ID: {} - 错误: {:?}", args.to, e);
        "Invalid Principal ID".to_string()
    })?;
    ic_cdk::println!("✅ [传输创建] 接收者Principal ID验证成功");
    
    ic_cdk::println!("🚀 [传输创建] 调用TransferManager创建传输...");
    let transfer = TransferManager::create(TransferManagerCreateArgs {
        from: from.clone(),
        to: args.to.clone(),
        filename: args.filename.clone(),
        content_type: args.content_type.clone(),
        data: args.data,
    })?;
    
    ic_cdk::println!("✅ [传输创建] 传输创建成功，ID: {}", transfer.id);
    ic_cdk::println!("✅ [传输创建] 传输详情 - 从: {} 到: {} 文件: {}", from, args.to, args.filename);
    
    Ok(transfer)
}
