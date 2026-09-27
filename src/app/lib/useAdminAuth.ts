import { useEffect, useState } from "react";

// Shared unlock check for every /admin/* page — reused instead of each page
// having its own copy. There's no dedicated auth endpoint: it just piggybacks
// on /api/products, which already validates x-admin-secret the same way.
export function useAdminAuth() {
  const [secret, setSecret] = useState(
    () => sessionStorage.getItem("kv_admin_secret") || ""
  );
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

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

  return { secret, unlocked, checking, error, checkSecret };
}
