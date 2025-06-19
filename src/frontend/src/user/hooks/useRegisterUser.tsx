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
      console.log("开始用户注册流程，Principal:", principal);
      
      if (!backend) {
        console.error("Backend actor 未初始化");
        throw new Error("Backend actor not initialized");
      }

      try {
        // 首先尝试获取用户
        console.log("尝试获取现有用户...");
        const getResponse = await backend.user_get();
        console.log("user_get 响应:", getResponse);
        
        if ("Err" in getResponse) {
          console.error("获取用户时出错:", getResponse.Err);
          throw new Error(`获取用户失败: ${JSON.stringify(getResponse.Err)}`);
        }
        
        const registeredPrincipal = getResponse.Ok;
        if (registeredPrincipal && registeredPrincipal.length > 0) {
          console.log("用户已存在:", registeredPrincipal[0]);
          return registeredPrincipal[0];
        }

        // 如果用户不存在，则注册新用户
        console.log("用户不存在，开始注册...");
        const registerResponse = await backend.user_register();
        console.log("user_register 响应:", registerResponse);
        
        if ("Err" in registerResponse) {
          console.error("注册用户时出错:", registerResponse.Err);
          throw new Error(`注册用户失败: ${JSON.stringify(registerResponse.Err)}`);
        }
        
        console.log("用户注册成功:", registerResponse.Ok);
        return registerResponse.Ok;
      } catch (error) {
        console.error("用户注册流程出错:", error);
        throw error;
      }
    },
    enabled: !!principal && !!backend,
    retry: 3,
    retryDelay: 1000,
  });
}
