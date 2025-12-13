import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({

  baseURL: 'https://rush-platform.vercel.app',
  plugins: [
    expoClient({
      scheme: "rush",
      storagePrefix: "rush",
      storage: SecureStore,
      
    }),
  ],
});

// Export types for convenience
export type Session = typeof authClient.$Infer.Session;