/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useActor } from "@/ic/Actors";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";

// 调用此hook会"注册"用户到后端actor，
// 即确保后端actor知道该用户，并将用户的Principal ID与用户关联。
export default function useRegisterUser() {
  const { principal } = useAuth();
  const { actor: backend } = useActor();
  
  return useQuery({
    queryKey: ["user_register", principal],
    queryFn: async () => {
      const getResponse = await backend!.user_get();
      if ("Err" in getResponse) {
        console.error("Error fetching user", getResponse.Err);
        return;
      }
      const registeredPrincipal = getResponse.Ok;
      if (registeredPrincipal.length > 0) {
        return registeredPrincipal[0];
      }

      const registerResponse = await backend!.user_register();
      if ("Err" in registerResponse) {
        console.error("Error registering user", registerResponse.Err);
        return;
      }
      return registerResponse.Ok;
    },
    enabled: !!principal && !!backend,
  });
}
