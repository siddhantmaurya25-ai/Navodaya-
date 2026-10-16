import { createContext } from "react";
import type { User } from "@supabase/supabase-js";

export type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  user: User | null;
  callbackError: string;
  clearCallbackError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
