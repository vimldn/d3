"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBackorder() {
  const [domainName, setDomainName] = useState("");
  const [customerId, setCustomerId] = useState("me");
  const [priority, setPriority] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/backorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domainName, customerId, priority })
    });
    if (!res.ok) { setErr("Failed to add backorder"); return; }
    router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 520, background: "white", border: "1px solid #eee", borderRadius: 14, padding: 18, marginTop: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
      <h2 style={{ marginTop: 0 }}>Add backorder</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>Domain</div>
          <input value={domainName} onChange={e => setDomainName(e.target.value)} placeholder="example.co.uk"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>Customer ID (any label)</div>
          <input value={customerId} onChange={e => setCustomerId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>Priority (0-100)</div>
          <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }} />
        </label>
        <button style={{ padding: "10px 12px", borderRadius: 10, background: "#111", color: "white", border: "none", cursor: "pointer" }}>Save</button>
        <Link href="/dashboard" style={{ color: "#111" }}>Back</Link>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </main>
  );
}
