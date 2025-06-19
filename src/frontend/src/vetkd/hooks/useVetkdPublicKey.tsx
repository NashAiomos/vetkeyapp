import { useQuery } from "@tanstack/react-query";
import { useActor } from "../../ic/Actors";

export default function useVetkdPublicKey() {
  const { actor: backend } = useActor();
  return useQuery({
    queryKey: ["public_key_get"],
    queryFn: async () => {
      console.log("🔓 [VETKD] 开始获取系统公钥...");
      
      const response = await backend?.vetkd_public_key();
      if (!response) {
        console.error("❌ [VETKD] 错误获取公钥，空响应");
        return;
      }
      if ("Err" in response) {
        console.error("❌ [VETKD] 错误获取公钥:", response.Err);
        return;
      }
      
      const publicKey = response.Ok as Uint8Array;
      console.log("✅ [VETKD] 成功获取系统公钥，长度:", publicKey.length, "字节");
      
      return publicKey;
    },
    enabled: !!backend,
  });
}
