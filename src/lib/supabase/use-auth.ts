import { useContext } from "react";
import { AuthContext } from "./auth-context";

export function useSupabaseAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useSupabaseAuth must be used inside SupabaseAuthProvider");
  return value;
}
