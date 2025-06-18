import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Actors from "./ic/Actors.tsx";
import App from "./App.tsx";
import AuthGuard from "./AuthGuard.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./auth/AuthContext.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";

export const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Actors>
          <AuthGuard>
            <App />
            <Toaster />
          </AuthGuard>
        </Actors>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
