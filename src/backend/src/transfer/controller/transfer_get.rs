use crate::{
    transfer::{
        transfer_manager::TransferManager,
        transfer_types::{Transfer, TransferId},
    },
    user::user_manager::UserManager,
    utils::principal_to_blob,
};
use ic_cdk::query;

#[query]
pub async fn transfer_get(transfer_id: TransferId) -> Result<Transfer, String> {
    let caller = ic_cdk::caller();
    ic_cdk::println!("📥 [传输获取] 开始获取传输 - 调用者: {} 传输ID: {}", caller, transfer_id);
    
    let principal_blob = principal_to_blob(caller);
    let user_principal = UserManager::get(principal_blob).ok_or_else(|| {
        ic_cdk::println!("❌ [传输获取] 用户未找到: {}", caller);
        "User not found".to_string()
    })?;
    ic_cdk::println!("✅ [传输获取] 用户验证成功: {}", user_principal);
    
    let transfer = TransferManager::get(transfer_id).ok_or_else(|| {
        ic_cdk::println!("❌ [传输获取] 传输未找到，ID: {}", transfer_id);
        "Transfer not found".to_string()
    })?;
    ic_cdk::println!("✅ [传输获取] 传输数据获取成功");
    ic_cdk::println!("📄 [传输获取] 传输详情 - 从: {} 到: {} 文件: {}", transfer.from, transfer.to, transfer.filename);
    ic_cdk::println!("📄 [传输获取] 文件类型: {} 数据大小: {} 字节", transfer.content_type, transfer.data.len());
    
    if transfer.to != user_principal {
        ic_cdk::println!("❌ [传输获取] 权限验证失败 - 期望接收者: {} 实际请求者: {}", transfer.to, user_principal);
        return Err("Unauthorized".to_string());
    }
    ic_cdk::println!("✅ [传输获取] 权限验证成功，允许访问传输");
    
    Ok(transfer)
}
