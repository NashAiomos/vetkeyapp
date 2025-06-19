use super::transfer_types::{Transfer, TransferId, TransferIndexKey};
use crate::{NEXT_TRANSFER_ID, TO_TRANSFERS_INDEX, TRANSFERS};

pub struct TransferManager {}

pub struct TransferManagerCreateArgs {
    pub from: String,
    pub to: String,
    pub filename: String,
    pub content_type: String,
    pub data: Vec<u8>,
}

impl TransferManager {
    pub fn create(args: TransferManagerCreateArgs) -> Result<Transfer, String> {
        ic_cdk::println!("📦 [传输管理器] 开始创建传输存储");
        ic_cdk::println!("📦 [传输管理器] 存储参数 - 从: {} 到: {} 文件: {}", args.from, args.to, args.filename);
        
        let next_id = NEXT_TRANSFER_ID.with_borrow_mut(|id| {
            let current_id = id.get();
            let next_id = current_id + 1;
            ic_cdk::println!("🔢 [传输管理器] 分配传输ID: {} -> {}", current_id, next_id);
            id.set(next_id).unwrap();
            next_id
        });

        let transfer = TRANSFERS.with_borrow_mut(|transfers| {
            let current_time = ic_cdk::api::time();
            ic_cdk::println!("⏰ [传输管理器] 传输创建时间: {}", current_time);
            
            let transfer = Transfer {
                id: next_id,
                created: current_time,
                from: args.from.clone(),
                to: args.to.clone(),
                filename: args.filename,
                size: args.data.len() as u32,
                content_type: args.content_type,
                data: args.data,
            };
            
            ic_cdk::println!("💾 [传输管理器] 将传输存储到主存储，ID: {}", next_id);
            transfers.insert(next_id, transfer.clone());
            transfer
        });

        TO_TRANSFERS_INDEX.with_borrow_mut(|index| {
            let key = TransferIndexKey {
                to: args.to.clone(),
                transfer_id: next_id,
            };
            ic_cdk::println!("🗂️ [传输管理器] 更新接收者索引: {} -> ID: {}", args.to, next_id);
            index.insert(key, next_id)
        });

        ic_cdk::println!("✅ [传输管理器] 传输存储完成，ID: {} 大小: {} 字节", next_id, transfer.size);
        Ok(transfer)
    }

    pub fn get(id: TransferId) -> Option<Transfer> {
        ic_cdk::println!("🔍 [传输管理器] 查找传输，ID: {}", id);
        
        let transfer = TRANSFERS.with_borrow(|transfers| transfers.get(&id));
        
        match &transfer {
            Some(t) => {
                ic_cdk::println!("✅ [传输管理器] 传输查找成功");
                ic_cdk::println!("📄 [传输管理器] 传输信息 - 文件: {} 大小: {} 字节", t.filename, t.size);
            },
            None => {
                ic_cdk::println!("❌ [传输管理器] 传输未找到，ID: {}", id);
            }
        }
        
        transfer
    }

    pub fn list_by_to(to: String) -> Vec<Transfer> {
        ic_cdk::println!("📋 [传输管理器] 查找用户接收的传输列表: {}", to);
        
        let transfers = TO_TRANSFERS_INDEX.with_borrow(|index| {
            let start_key = TransferIndexKey {
                to: to.clone(),
                transfer_id: TransferId::MIN,
            };
            index
                .range(start_key..)
                .take_while(|(key, _)| key.to == to)
                .filter_map(|(_, transfer_id)| Self::get(transfer_id))
                .collect::<Vec<Transfer>>()
        });
        
        ic_cdk::println!("✅ [传输管理器] 找到 {} 个传输给用户: {}", transfers.len(), to);
        transfers
    }
}
