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
      if (!backend) {
        console.error("Backend actor not available");
        return;
      }
      
      // 验证Principal ID格式
      try {
        Principal.fromText(recipientPrincipal);
      } catch (error) {
        throw new Error("无效的 Principal ID 格式");
      }
      
      const response = await backend.vetkd_public_key();
      if ("Err" in response) {
        console.error("Error getting recipient public key", response.Err);
        return;
      }

      const recipientPublicKey = response.Ok as Uint8Array;
      const seed = window.crypto.getRandomValues(new Uint8Array(32));
      const fileBuffer = await file.arrayBuffer();
      const encodedMessage = new Uint8Array(fileBuffer);
      
      // 使用Principal ID的字节作为加密标识
      const principalBytes = Principal.fromText(recipientPrincipal).toUint8Array();
      
      const encryptedFile = vetkd.IBECiphertext.encrypt(
        recipientPublicKey,
        principalBytes,
        encodedMessage,
        seed
      );
      const request = {
        to: recipientPrincipal,
        content_type: file.type,
        filename: file.name,
        data: encryptedFile.serialize(),
      };
      return backend.transfer_create(request);
    },
  });
}
