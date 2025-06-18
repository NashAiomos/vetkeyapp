use crate::USERS;
use candid::Principal;
use ic_stable_structures::storable::Blob;

pub struct UserManager {}

impl UserManager {
    pub async fn register(principal_blob: Blob<29>, principal: Principal) -> Result<String, String> {
        let principal_str = principal.to_string();
        USERS.with_borrow_mut(|users| {
            users.insert(principal_blob, principal_str.clone());
        });
        Ok(principal_str)
    }

    pub fn get(principal_blob: Blob<29>) -> Option<String> {
        USERS.with_borrow(|users| users.get(&principal_blob))
    }
}
