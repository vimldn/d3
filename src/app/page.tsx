import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1 style={{ margin: "12px 0 6px" }}>Nominet Dropcatch</h1>
      <p style={{ marginTop: 0, color: "#444" }}>Simple dashboard + background worker.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <Link href="/login" style={{ padding: "10px 14px", borderRadius: 10, background: "#111", color: "white", textDecoration: "none" }}>Login</Link>
        <Link href="/dashboard" style={{ padding: "10px 14px", borderRadius: 10, background: "white", border: "1px solid #ddd", color: "#111", textDecoration: "none" }}>Dashboard</Link>
      </div>
    </main>
  );
}
