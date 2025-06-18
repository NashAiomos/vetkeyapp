use crate::{user::user_manager::UserManager, utils::principal_to_blob};
use candid::Principal;
use ic_cdk::update;

#[update]
pub async fn user_register() -> Result<String, String> {
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        return Err("anonymous caller not allowed".to_string());
    }
    let principal_blob = principal_to_blob(caller);
    let principal_str = UserManager::register(principal_blob, caller).await?;
    Ok(principal_str)
}
