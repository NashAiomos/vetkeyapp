/* eslint-disable react-refresh/only-export-components */
import {
  ActorProvider,
  InterceptorErrorData,
  InterceptorRequestData,
  createActorContext,
  createUseActorHook,
} from "ic-use-actor";
import { canisterId, idlFactory } from "../../../backend/declarations/index";

import { ReactNode } from "react";
import { _SERVICE } from "../../../backend/declarations/backend.did";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

const actorContext = createActorContext<_SERVICE>();
export const useActor = createUseActorHook<_SERVICE>(actorContext);

export default function Actors({ children }: { children: ReactNode }) {
  const { identity, logout } = useAuth();
  const { toast } = useToast();

  const errorToast = (error: unknown) => {
    if (typeof error === "object" && error !== null && "message" in error) {
      toast({
        variant: "destructive",
        description: error.message as string,
      });
    }
  };

  const handleResponseError = (data: InterceptorErrorData) => {
    const { error } = data;
    console.error("onResponseError", error);
    if (
      error instanceof Error &&
      (error.message.includes("Invalid delegation") ||
        error.message.includes("Specified sender delegation has expired") ||
        error.message.includes("Invalid certificate"))
    ) {
      toast({
        variant: "destructive",
        description: "The authentication is invalid, please log in again.",
      });
      setTimeout(() => {
        logout(); // 退出登录
      }, 1000);
      return;
    }

    if (typeof data === "object" && "message" in data) {
      errorToast(data);
    }
  };

  const handleRequest = (data: InterceptorRequestData) => {
    console.log("onRequest", data.args, data.methodName);
    return data.args;
  };

  return (
    <ActorProvider<_SERVICE>
      canisterId={canisterId}
      context={actorContext}
      identity={identity || undefined}
      idlFactory={idlFactory}
      onRequest={handleRequest}
      onRequestError={(error) => {
        errorToast(error);
      }}
      onResponseError={handleResponseError}
    >
      {children}
    </ActorProvider>
  );
}
