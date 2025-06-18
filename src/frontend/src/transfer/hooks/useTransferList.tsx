import { useQuery } from "@tanstack/react-query";
import { useActor } from "../../ic/Actors";
import { useAuth } from "@/auth/AuthContext";

export default function useTransferList() {
  const { actor: backend } = useActor();
  const { principal } = useAuth();
  return useQuery({
    queryKey: ["transfer_list", principal],
    queryFn: async () => {
      const response = await backend?.transfer_list();

      if (!response || "Err" in response) {
        return [];
      }

      return response.Ok;
    },
    enabled: !!backend && !!principal,
  });
}
