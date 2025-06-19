mod declarations;
mod transfer;
mod user;
mod utils;
mod vetkd;

use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::storable::Blob;
use ic_stable_structures::{Cell, DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;
use transfer::transfer_types::{Transfer, TransferId, TransferIndexKey};

type Memory = VirtualMemory<DefaultMemoryImpl>;

const USERS_MEMORY_ID: MemoryId = MemoryId::new(0);
const NEXT_TRANSFER_ID_MEMORY_ID: MemoryId = MemoryId::new(1);
const TRANSFERS_MEMORY_ID: MemoryId = MemoryId::new(2);
const TO_TRANSFERS_INDEX_MEMORY_ID: MemoryId = MemoryId::new(3);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USERS: RefCell<StableBTreeMap<Blob<29>, String, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USERS_MEMORY_ID)),
        )
    );

    static NEXT_TRANSFER_ID: RefCell<Cell<TransferId, Memory>> = RefCell::new(Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(NEXT_TRANSFER_ID_MEMORY_ID)), 0).unwrap());

    static TRANSFERS: RefCell<StableBTreeMap<TransferId, Transfer, Memory>> =
        RefCell::new(
            StableBTreeMap::init(
                MEMORY_MANAGER.with(|m| m.borrow().get(TRANSFERS_MEMORY_ID)),
            )
        );

    static TO_TRANSFERS_INDEX: RefCell<StableBTreeMap<TransferIndexKey, TransferId, Memory>> =
        RefCell::new(
            StableBTreeMap::init(
                MEMORY_MANAGER.with(|m| m.borrow().get(TO_TRANSFERS_INDEX_MEMORY_ID)),
            )
        );
}

// 导出用户控制器函数
pub use user::controller::user_get::user_get;
pub use user::controller::user_register::user_register;

// 导出传输控制器函数
pub use transfer::controller::transfer_create::transfer_create;
pub use transfer::controller::transfer_get::transfer_get;
pub use transfer::controller::transfer_list::transfer_list;

// 导出 vetkd 控制器函数
pub use vetkd::controller::vetkd_encrypted_key::vetkd_encrypted_key;
pub use vetkd::controller::vetkd_public_key::vetkd_public_key;
