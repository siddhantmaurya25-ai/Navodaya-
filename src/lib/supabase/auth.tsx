import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, supabaseConfigured } from "./client";
import { AuthContext, type AuthContextValue } from "./auth-context";

const NATIVE_AUTH_SCHEME = "com.navodaya.vijeta";
const EMAIL_OTP_TYPES = ["signup", "email", "magiclink", "recovery", "invite", "email_change"] as const;

type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function getAuthRedirectUrl() {
  if (Capacitor.isNativePlatform()) return `${NATIVE_AUTH_SCHEME}://auth/callback`;
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/`;
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(true);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [callbackError, setCallbackError] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    let authEventSeen = false;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      authEventSeen = true;
      if (active) {
        setUser(session?.user ?? null);
        setReady(true);
      }
    });
    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (!authEventSeen && !error) setUser(data.session?.user ?? null);
        setReady(true);
      })
      .catch(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client || !Capacitor.isNativePlatform()) return;
    let active = true;
    let removeListener: (() => void) | undefined;
    const processedUrls = new Set<string>();

    async function consumeAuthUrl(rawUrl: string) {
      if (!active || !client || processedUrls.has(rawUrl)) return;
      processedUrls.add(rawUrl);
      try {
        const url = new URL(rawUrl);
        if (url.protocol !== `${NATIVE_AUTH_SCHEME}:` || url.hostname !== "auth") return;

        const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
        const value = (key: string) => url.searchParams.get(key) ?? fragment.get(key);
        const error = value("error_description") ?? value("error");
        if (error) throw new Error(error);

        const code = value("code");
        if (code) {
          const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          const accessToken = value("access_token");
          const refreshToken = value("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionError } = await client.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          } else {
            const tokenHash = value("token_hash");
            const type = value("type");
            if (!tokenHash || !EMAIL_OTP_TYPES.includes(type as EmailOtpType)) return;
            const { error: verifyError } = await client.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as EmailOtpType,
            });
            if (verifyError) throw verifyError;
          }
        }
        setCallbackError("");
      } catch (cause) {
        setCallbackError(cause instanceof Error ? cause.message : "पुष्टि लिंक नहीं खुल सका।");
      }
    }

    void (async () => {
      const listener = await App.addListener("appUrlOpen", ({ url }) => {
        void consumeAuthUrl(url);
      });
      if (!active) {
        await listener.remove();
        return;
      }
      removeListener = () => {
        void listener.remove();
      };
      const launch = await App.getLaunchUrl();
      if (launch?.url) await consumeAuthUrl(launch.url);
    })();

    return () => {
      active = false;
      removeListener?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: supabaseConfigured,
      ready,
      user,
      callbackError,
      clearCallbackError() {
        setCallbackError("");
      },
      async signIn(email, password) {
        setCallbackError("");
        if (!supabase) throw new Error("ऑनलाइन खाता सेवा उपलब्ध नहीं है।");
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
      },
      async signUp(email, password) {
        setCallbackError("");
        if (!supabase) throw new Error("ऑनलाइन खाता सेवा उपलब्ध नहीं है।");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: getAuthRedirectUrl() },
        });
        if (error) throw error;
        return Boolean(data.session);
      },
      async signOut() {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) throw error;
      },
    }),
    [callbackError, ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
