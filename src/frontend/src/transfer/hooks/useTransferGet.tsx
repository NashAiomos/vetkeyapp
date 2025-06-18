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
      const response = await backend?.transfer_get(transferId);
      if (!response) {
        console.error("Error fetching transfer, empty response");
        return;
      }
      if ("Err" in response) {
        console.error("Error fetching transfer", response.Err);
        return;
      }
      const transfer = response.Ok;
      const { transportSecretKey, encryptedKey } = vetkdEncryptedKeyReturn!;
      try {
        const principalBytes = Principal.fromText(principal!).toUint8Array();
        const key = transportSecretKey.decrypt(
          encryptedKey,
          publicKey!,
          principalBytes
        );
        const ibeCiphertext = vetkd.IBECiphertext.deserialize(
          transfer.data as Uint8Array
        );
        const decryptedData = ibeCiphertext.decrypt(key);
        return { decryptedData, ...transfer };
      } catch (e) {
        console.error("Error decrypting transfer", e);
      }
    },
    enabled: !!backend && !!vetkdEncryptedKeyReturn && !!publicKey && !!principal,
  });
}
