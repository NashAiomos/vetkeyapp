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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化AuthClient
  useEffect(() => {
    AuthClient.create().then(async (client: AuthClient) => {
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      
      if (isAuthenticated) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal().toString();
        setIdentity(identity);
        setPrincipal(principal);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async () => {
    if (!authClient) return;

    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: () => {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toString();
        setIdentity(identity);
        setPrincipal(principal);
        setIsAuthenticated(true);
      },
      windowOpenerFeatures: 
        `left=${window.screen.width / 2 - 525 / 2}, ` +
        `top=${window.screen.height / 2 - 705 / 2},` +
        `toolbar=0,location=0,menubar=0,width=525,height=705`,
    });
  };

  const logout = () => {
    if (!authClient) return;
    authClient.logout();
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