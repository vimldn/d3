"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (!res.ok) { setErr("Wrong password"); return; }
    router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 420, background: "white", border: "1px solid #eee", borderRadius: 14, padding: 18, marginTop: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <p style={{ marginTop: 0, color: "#555" }}>Enter your admin password.</p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Password" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }} />
        <button type="submit" style={{ padding: "10px 12px", borderRadius: 10, background: "#111", color: "white", border: "none", cursor: "pointer" }}>Login</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </main>
  );
}
