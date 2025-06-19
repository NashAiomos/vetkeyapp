use candid::Principal;
use ic_stable_structures::storable::Blob;

pub fn principal_to_blob(principal: Principal) -> Blob<29> {
    let principal_bytes = principal.as_slice();
    let mut bytes = [0u8; 29];
    
    // 只复制实际的字节数，如果 principal 小于 29 字节，剩余部分保持为 0
    let copy_len = std::cmp::min(principal_bytes.len(), 29);
    bytes[..copy_len].copy_from_slice(&principal_bytes[..copy_len]);
    
    Blob::try_from(bytes.as_slice()).unwrap()
}
