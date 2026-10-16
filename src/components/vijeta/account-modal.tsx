import { useState, type FormEvent } from "react";
import { Cloud, LoaderCircle, UserRound, X } from "lucide-react";
import { useSupabaseAuth } from "@/lib/supabase/use-auth";

export type CloudSyncStatus = "not-configured" | "guest" | "loading" | "saving" | "synced" | "offline";

type AccountModalProps = {
  onClose: () => void;
  syncStatus: CloudSyncStatus;
  onSyncNow: () => void;
};

function statusLabel(status: CloudSyncStatus) {
  switch (status) {
    case "not-configured":
      return "ऑनलाइन सेवा सेट नहीं है";
    case "guest":
      return "मेहमान मोड — इस फ़ोन पर सेव";
    case "loading":
      return "क्लाउड प्रगति खुल रही है…";
    case "saving":
      return "क्लाउड में सेव हो रहा है…";
    case "synced":
      return "क्लाउड सेव अपडेट है";
    case "offline":
      return "क्लाउड उपलब्ध नहीं — लोकल सेव सुरक्षित है";
  }
}

function friendlyError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("invalid login") || text.includes("invalid credentials")) return "ईमेल या पासवर्ड सही नहीं है।";
  if (text.includes("already registered") || text.includes("already exists")) return "यह ईमेल पहले से जुड़ा है। लॉगिन करें।";
  if (text.includes("email not confirmed")) return "पहले ईमेल में आया पुष्टि लिंक खोलें, फिर लॉगिन करें।";
  if (text.includes("network") || text.includes("fetch")) return "इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें।";
  return message;
}

export function AccountModal({ onClose, syncStatus, onSyncNow }: AccountModalProps) {
  const auth = useSupabaseAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const shownError = error || auth.callbackError;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    auth.clearCallbackError();
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await auth.signIn(email, password);
        setNotice("लॉगिन सफल। प्रगति अपने-आप क्लाउड में सेव होगी।");
      } else {
        const signedIn = await auth.signUp(email, password);
        setNotice(
          signedIn
            ? "खाता बन गया। आपकी प्रगति अब क्लाउड में सेव होगी।"
            : "अगर यह ईमेल नया है, तो पुष्टि लिंक इनबॉक्स में आएगा। लिंक खोलें—ऐप वापस खुलकर खाता सक्रिय कर देगा।",
        );
      }
    } catch (cause) {
      setError(friendlyError(cause instanceof Error ? cause.message : "लॉगिन नहीं हो सका।"));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setError("");
    setBusy(true);
    try {
      await auth.signOut();
      setNotice("लॉगआउट हो गया। लोकल मेहमान प्रगति सुरक्षित है।");
    } catch (cause) {
      setError(friendlyError(cause instanceof Error ? cause.message : "लॉगआउट नहीं हो सका।"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-3" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <section className="w-full max-w-md rounded-3xl border border-line bg-paper-2 p-5 shadow-xl">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
              <UserRound className="size-4" />
              नवोदय विजेता खाता
            </p>
            <h2 id="account-title" className="mt-1 text-xl font-bold">
              {auth.user ? "आपका ऑनलाइन खाता" : mode === "signin" ? "लॉगिन करें" : "नया खाता बनाएँ"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full bg-paper" aria-label="बंद करें">
            <X className="size-4" />
          </button>
        </header>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-paper p-3 text-sm">
          {syncStatus === "loading" || syncStatus === "saving" ? (
            <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin text-ink-soft" />
          ) : (
            <Cloud className="mt-0.5 size-4 shrink-0 text-ink-soft" />
          )}
          <div>
            <p className="font-semibold">{statusLabel(syncStatus)}</p>
            <p className="mt-0.5 text-xs leading-5 text-ink-soft">ऑफ़लाइन पढ़ाई जारी रहेगी; ऑनलाइन खाता दोनों छात्रों की प्रगति दूसरे फ़ोन पर भी सुरक्षित रखता है।</p>
          </div>
        </div>

        {!auth.configured ? (
          <p className="mt-4 rounded-2xl bg-saffron-soft p-3 text-sm leading-6">ऑनलाइन खाता सेवा अभी तैयार नहीं है। इस फ़ोन की लोकल प्रगति और बैकअप कोड काम करते रहेंगे।</p>
        ) : auth.user ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-paper p-3">
              <p className="text-xs text-ink-soft">लॉगिन ईमेल</p>
              <p className="mt-1 break-all text-sm font-semibold">{auth.user.email ?? "ईमेल खाता"}</p>
            </div>
            <button type="button" onClick={onSyncNow} className="min-h-11 w-full rounded-full bg-ink px-4 text-sm font-bold text-paper-2">
              अभी क्लाउड सिंक करें
            </button>
            <button type="button" onClick={signOut} disabled={busy} className="min-h-11 w-full rounded-full border border-line-strong bg-paper px-4 text-sm font-bold disabled:opacity-60">
              {busy ? "कृपया रुकें…" : "लॉगआउट"}
            </button>
          </div>
        ) : (
          <>
            <form className="mt-4 space-y-3" onSubmit={submit}>
              <label className="block text-sm font-semibold">
                ईमेल
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base font-normal"
                  placeholder="name@example.com"
                />
              </label>
              <label className="block text-sm font-semibold">
                पासवर्ड
                <input
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 min-h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base font-normal"
                  placeholder="कम-से-कम 8 अक्षर"
                />
              </label>
              <button type="submit" disabled={busy || !auth.ready} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-paper-2 disabled:opacity-60">
                {busy && <LoaderCircle className="size-4 animate-spin" />}
                {busy ? "कृपया रुकें…" : mode === "signin" ? "ईमेल से लॉगिन" : "खाता बनाएँ"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setMode((current) => (current === "signin" ? "signup" : "signin"));
                setError("");
                setNotice("");
              }}
              className="mt-3 min-h-11 w-full rounded-full px-3 text-sm font-semibold text-ink-soft underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "नया खाता बनाएँ" : "पहले से खाता है? लॉगिन करें"}
            </button>
          </>
        )}

        {notice && <p className="mt-3 rounded-2xl bg-moss-soft p-3 text-sm leading-6 text-moss" role="status">{notice}</p>}
        {shownError && <p className="mt-3 rounded-2xl bg-saffron-soft p-3 text-sm leading-6" role="alert">{shownError}</p>}
        <p className="mt-4 text-center text-xs leading-5 text-ink-soft">पासवर्ड ऐप में नहीं रखा जाता। लोकल पढ़ाई और बैकअप कोड बिना लॉगिन भी उपलब्ध हैं।</p>
      </section>
    </div>
  );
}
