import React from "react";
import LoginPage from "./components/login/LoginPage";
import { useAuth } from "./auth/AuthContext";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // 如果用户未登录，显示登录页面
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
