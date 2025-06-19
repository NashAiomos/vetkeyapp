import { useMutation } from "@tanstack/react-query";
import * as vetkd from "ic-vetkd-utils";
import { useActor } from "@/ic/Actors";
import { Principal } from "@dfinity/principal";

export default function useTransferCreate() {
  const { actor: backend } = useActor();

  return useMutation({
    mutationFn: async ({
      recipientPrincipal,
      file,
    }: {
      recipientPrincipal: string;
      file: File;
    }) => {
      console.log("📤 [传输] 开始创建加密文件传输...");
      console.log("📤 [传输] 接收者Principal:", recipientPrincipal);
      console.log("📤 [传输] 文件名:", file.name);
      console.log("📤 [传输] 文件大小:", file.size, "字节");
      console.log("📤 [传输] 文件类型:", file.type);

      if (!backend) {
        console.error("❌ [传输] Backend actor不可用");
        return;
      }
      
      // 验证Principal ID格式
      try {
        Principal.fromText(recipientPrincipal);
        console.log("✅ [传输] Principal ID格式验证通过");
      } catch (error) {
        console.error("❌ [传输] Principal ID格式无效:", error);
        throw new Error("Invalid Principal ID format");
      }
      
      console.log("🔓 [传输] 获取接收者公钥...");
      const response = await backend.vetkd_public_key();
      if ("Err" in response) {
        console.error("❌ [传输] 获取接收者公钥错误:", response.Err);
        return;
      }

      const recipientPublicKey = response.Ok as Uint8Array;
      console.log("✅ [传输] 获取接收者公钥成功，长度:", recipientPublicKey.length, "字节");
      
      console.log("🎲 [传输] 生成加密种子...");
      const seed = window.crypto.getRandomValues(new Uint8Array(32));
      console.log("✅ [传输] 加密种子生成完成，长度:", seed.length, "字节");
      
      console.log("📄 [传输] 读取文件内容...");
      const fileBuffer = await file.arrayBuffer();
      const encodedMessage = new Uint8Array(fileBuffer);
      console.log("✅ [传输] 文件内容读取完成，数据长度:", encodedMessage.length, "字节");
      
      // 使用Principal ID的字节作为加密标识
      const principalBytes = Principal.fromText(recipientPrincipal).toUint8Array();
      console.log("🔑 [传输] Principal字节长度:", principalBytes.length, "字节");
      
      console.log("🔐 [传输] 开始加密文件数据...");
      const encryptedFile = vetkd.IBECiphertext.encrypt(
        recipientPublicKey,
        principalBytes,
        encodedMessage,
        seed
      );
      console.log("✅ [传输] 文件加密完成");
      
      const serializedData = encryptedFile.serialize();
      console.log("📦 [传输] 加密数据序列化完成，长度:", serializedData.length, "字节");
      
      const request = {
        to: recipientPrincipal,
        content_type: file.type,
        filename: file.name,
        data: serializedData,
      };
      
      console.log("🚀 [传输] 向后端提交加密传输请求...");
      const result = await backend.transfer_create(request);
      
      if ("Ok" in result) {
        console.log("✅ [传输] 加密传输创建成功，传输ID:", result.Ok);
      } else {
        console.error("❌ [传输] 加密传输创建失败:", result.Err);
      }
      
      return result;
    },
  });
}
