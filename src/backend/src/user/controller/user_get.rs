use crate::{user::user_manager::UserManager, utils::principal_to_blob};
use candid::{CandidType, Principal};
use ic_cdk::query;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Debug)]
pub enum UserGetResponse {
    Ok(Option<String>),
    Err(String),
}

#[query]
pub fn user_get() -> UserGetResponse {
    let caller = ic_cdk::caller();
    ic_cdk::println!("user_get called by: {}", caller.to_string());
    
    if caller == Principal::anonymous() {
        ic_cdk::println!("Anonymous caller rejected");
        return UserGetResponse::Err("anonymous caller not allowed".to_string());
    }
    
    let principal_blob = principal_to_blob(caller);
    ic_cdk::println!("Principal blob created for: {}", caller.to_string());
    
    let result = UserManager::get(principal_blob);
    ic_cdk::println!("User get result: {:?}", result);
    
    UserGetResponse::Ok(result)
}
