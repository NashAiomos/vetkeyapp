use crate::{user::user_manager::UserManager, utils::principal_to_blob};
use candid::{CandidType, Principal};
use ic_cdk::update;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Debug)]
pub enum UserRegisterResponse {
    Ok(String),
    Err(String),
}

#[update]
pub async fn user_register() -> UserRegisterResponse {
    let caller = ic_cdk::caller();
    ic_cdk::println!("user_register called by: {}", caller.to_string());
    
    if caller == Principal::anonymous() {
        ic_cdk::println!("Anonymous caller rejected");
        return UserRegisterResponse::Err("anonymous caller not allowed".to_string());
    }
    
    let principal_blob = principal_to_blob(caller);
    ic_cdk::println!("Principal blob created for: {}", caller.to_string());
    
    match UserManager::register(principal_blob, caller).await {
        Ok(principal_str) => {
            ic_cdk::println!("User registered successfully: {}", principal_str);
            UserRegisterResponse::Ok(principal_str)
        }
        Err(e) => {
            ic_cdk::println!("Error registering user: {}", e);
            UserRegisterResponse::Err(e)
        }
    }
}
