import { AuthClient } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authClient: AuthClient | null;
  identity: Identity | null;
  principal: string | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authClient: null,
  identity: null,
  principal: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

// 7天的纳秒数
const SEVEN_DAYS_IN_NANOSECONDS = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化AuthClient
  useEffect(() => {
    console.log("初始化 AuthClient...");
    AuthClient.create({
      // 设置空闲选项
      idleOptions: {
        // 空闲超时时间：4 小时
        idleTimeout: 4 * 60 * 60 * 1000, // 4 小时（毫秒）
        // 不禁用空闲管理
        disableIdle: false,
        // 空闲回调
        onIdle: () => {
          console.log("用户已空闲，即将退出登录");
          logout();
        },
      },
    }).then(async (client: AuthClient) => {
      console.log("AuthClient 创建成功");
      setAuthClient(client);
      
      try {
        const isAuthenticated = await client.isAuthenticated();
        console.log("检查认证状态:", isAuthenticated);

        if (isAuthenticated) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal().toString();
          console.log("用户已认证，Principal:", principal);
          setIdentity(identity);
          setPrincipal(principal);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("检查认证状态时出错:", error);
      } finally {
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error("创建 AuthClient 时出错:", error);
      setIsLoading(false);
    });
  }, []);

  const login = async () => {
    if (!authClient) {
      console.error("AuthClient 未初始化");
      return;
    }

    console.log("开始登录流程...");
    try {
      const identityProvider = process.env.DFX_NETWORK === "ic"
        ? "https://identity.ic0.app"
        : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
      
      await authClient.login({
        identityProvider,
        // 设置最大生存时间为 7 天
        maxTimeToLive: SEVEN_DAYS_IN_NANOSECONDS,
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();
          console.log("登录成功，Principal:", principal);
          setIdentity(identity);
          setPrincipal(principal);
          setIsAuthenticated(true);
        },
        onError: (error) => {
          console.error("登录失败:", error);
        },
        windowOpenerFeatures: 
          `left=${window.screen.width / 2 - 525 / 2}, ` +
          `top=${window.screen.height / 2 - 705 / 2},` +
          `toolbar=0,location=0,menubar=0,width=525,height=705`,
      });
    } catch (error) {
      console.error("登录过程中出错:", error);
    }
  };

  const logout = async () => {
    if (!authClient) return;
    console.log("退出登录...");
    await authClient.logout();
    setIdentity(null);
    setPrincipal(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        authClient,
        identity,
        principal,
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 