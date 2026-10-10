import { useEffect, useState } from "react";

// Shared unlock check for every /admin/* page — reused instead of each page
// having its own copy. There's no dedicated auth endpoint: it just piggybacks
// on /api/products, which already validates x-admin-secret the same way.
// Pass { allowEditor: true } on pages the limited "editor" login may open
// (the admin home and Products). Everything else rejects the editor login.
export function useAdminAuth(options: { allowEditor?: boolean } = {}) {
  const [secret, setSecret] = useState(
    () => sessionStorage.getItem("kv_admin_secret") || ""
  );
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | null>(null);

  const checkSecret = async (value: string) => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/products?type=fashion_find&all=1", {
        headers: { "x-admin-secret": value },
      });
      if (res.status === 401) {
        setError("That secret was rejected — try again.");
        setUnlocked(false);
        return;
      }
      let who: "admin" | "editor" = "admin";
      try {
        const w = await fetch("/api/products?whoami=1", { headers: { "x-admin-secret": value } });
        if (w.ok && (await w.json()).role === "editor") who = "editor";
      } catch {
        /* older API without whoami: treat as admin */
      }
      setRole(who);
      if (who === "editor" && !options.allowEditor) {
        setError("This login can only change product status and price. Use the Products page.");
        setUnlocked(false);
        return;
      }
      sessionStorage.setItem("kv_admin_secret", value);
      setSecret(value);
      setUnlocked(true);
    } catch (e: any) {
      setError(e.message || "Could not verify secret");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (secret) checkSecret(secret);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { secret, unlocked, checking, error, role, checkSecret };
}
