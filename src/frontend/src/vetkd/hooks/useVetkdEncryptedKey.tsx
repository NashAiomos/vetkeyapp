import { useQuery } from "@tanstack/react-query";
import { useActor } from "../../ic/Actors";
import * as vetkd from "ic-vetkd-utils";

export default function useVetkdEncryptedKey() {
  const { actor: backend } = useActor();
  return useQuery({
    queryKey: ["encrypted_key_get"],
    queryFn: async () => {
      console.log("🔐 [VETKD] 开始生成传输密钥...");
      
      const seed = window.crypto.getRandomValues(new Uint8Array(32));
      console.log("🎲 [VETKD] 生成随机种子，长度:", seed.length, "字节");
      
      const transportSecretKey = new vetkd.TransportSecretKey(seed);
      const publicKeyBytes = transportSecretKey.public_key();
      console.log("🔑 [VETKD] 传输密钥生成完成，公钥长度:", publicKeyBytes.length, "字节");
      
      console.log("[VETKD] 请求后端生成加密密钥...");
      const response = await backend?.vetkd_encrypted_key(publicKeyBytes);
      
      if (!response) {
        console.error("❌ [VETKD] 错误获取加密密钥，空响应");
        return;
      }
      if ("Err" in response) {
        console.error("❌ [VETKD] 错误获取加密密钥:", response.Err);
        return;
      }
      
      const encryptedKey = response.Ok as Uint8Array;
      console.log("✅ [VETKD] 成功获取加密密钥，长度:", encryptedKey.length, "字节");
      
      return { transportSecretKey, encryptedKey };
    },
    enabled: !!backend,
  });
}
