use ic_cdk_bindgen::{Builder, Config};
use std::env;
use std::path::PathBuf;

/// This build script generates bindings in the declarations module to simplify interacting
/// with the deployed chainkey_testing_canister.
fn main() {
    let manifest_dir =
        PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").expect("Cannot find manifest dir"));

    let chainkey_testing_canister_did_path = manifest_dir
        .join("../chainkey_testing_canister/declarations/chainkey_testing_canister.did");
    let chainkey_testing_canister_did_str = chainkey_testing_canister_did_path
        .to_str()
        .expect("Path invalid");

    unsafe {
        env::set_var(
            "CANISTER_CANDID_PATH_CHAINKEY_TESTING_CANISTER",
            chainkey_testing_canister_did_str,
        );
    };

    // chainkey_testing_canister
    let mut chainkey_testing_canister = Config::new("chainkey_testing_canister");
    chainkey_testing_canister
        .binding
        .set_type_attributes("#[derive(Debug, CandidType, Deserialize)]".into());

    let mut builder = Builder::new();
    builder.add(chainkey_testing_canister);
    builder.build(Some(manifest_dir.join("src/declarations")));
}
