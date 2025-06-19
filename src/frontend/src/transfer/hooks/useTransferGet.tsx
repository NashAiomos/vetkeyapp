/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as vetkd from "ic-vetkd-utils";
import { useQuery } from "@tanstack/react-query";
import useVetkdEncryptedKey from "@/vetkd/hooks/useVetkdEncryptedKey";
import useVetkdPublicKey from "@/vetkd/hooks/useVetkdPublicKey";
import { useAuth } from "@/auth/AuthContext";
import { useActor } from "@/ic/Actors";
import { Principal } from "@dfinity/principal";

export default function useTransferGet(transferId: number) {
  const { actor: backend } = useActor();
  const { principal } = useAuth();
  const { data: vetkdEncryptedKeyReturn } = useVetkdEncryptedKey();
  const { data: publicKey } = useVetkdPublicKey();
  
  return useQuery({
    queryKey: ["transfer_get", transferId, principal],
    queryFn: async () => {
      console.log("📥 [解密] 开始获取和解密传输，ID:", transferId);
      console.log("📥 [解密] 当前用户Principal:", principal);
      
      console.log("🚀 [解密] 从后端获取传输数据...");
      const response = await backend?.transfer_get(transferId);
      if (!response) {
        console.error("❌ [解密] 获取传输失败，空响应");
        return;
      }
      if ("Err" in response) {
        console.error("❌ [解密] 获取传输失败:", response.Err);
        return;
      }
      
      const transfer = response.Ok;
      console.log("✅ [解密] 传输数据获取成功");
      console.log("📄 [解密] 文件名:", transfer.filename);
      console.log("📄 [解密] 文件类型:", transfer.content_type);
      console.log("📄 [解密] 加密数据长度:", transfer.data.length, "字节");
      console.log("👤 [解密] 发送者:", transfer.from);
      
      const { transportSecretKey, encryptedKey } = vetkdEncryptedKeyReturn!;
      console.log("🔑 [解密] 传输密钥准备就绪");
      console.log("🔐 [解密] 加密密钥准备就绪，长度:", encryptedKey.length, "字节");
      console.log("🔓 [解密] 系统公钥准备就绪，长度:", publicKey!.length, "字节");
      
      try {
        console.log("🔑 [解密] 生成Principal字节数据...");
        const principalBytes = Principal.fromText(principal!).toUint8Array();
        console.log("✅ [解密] Principal字节数据生成完成，长度:", principalBytes.length, "字节");
        
        console.log("🔓 [解密] 使用传输密钥解密获得IBE密钥...");
        const key = transportSecretKey.decrypt(
          encryptedKey,
          publicKey!,
          principalBytes
        );
        console.log("✅ [解密] IBE密钥解密成功");
        
        console.log("📦 [解密] 反序列化IBE密文...");
        const ibeCiphertext = vetkd.IBECiphertext.deserialize(
          transfer.data as Uint8Array
        );
        console.log("✅ [解密] IBE密文反序列化成功");
        
        console.log("🔐 [解密] 开始解密文件数据...");
        const decryptedData = ibeCiphertext.decrypt(key);
        console.log("✅ [解密] 文件解密成功，解密数据长度:", decryptedData.length, "字节");
        
        return { decryptedData, ...transfer };
      } catch (e) {
        console.error("❌ [解密] 解密传输过程中发生错误:", e);
        console.error("❌ [解密] 错误详情:", {
          error: e,
          transferId,
          principal,
          encryptedKeyLength: encryptedKey?.length,
          publicKeyLength: publicKey?.length,
          transferDataLength: transfer.data.length
        });
      }
    },
    enabled: !!backend && !!vetkdEncryptedKeyReturn && !!publicKey && !!principal,
  });
}
