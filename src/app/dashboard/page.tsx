import Link from "next/link";
import { prisma } from "@/db";

export default async function Dashboard() {
  const domains = await prisma.domainDrop.findMany({
    orderBy: { dropTimeUtc: "asc" },
    take: 200,
    select: { domainName: true, dropTimeUtc: true, status: true, backorders: { select: { id: true } } }
  });

  const hb = await prisma.workerHeartbeat.findUnique({ where: { name: "main-worker" } });

  return (
    <main>
      <h1 style={{ margin: "12px 0 6px" }}>Dashboard</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0 18px" }}>
        <form action="/api/admin/ingest" method="post">
          <button style={{ padding: "10px 12px", borderRadius: 10, background: "#111", color: "white", border: "none", cursor: "pointer" }}>Ingest droplist now</button>
        </form>
        <form action="/api/admin/schedule" method="post">
          <button style={{ padding: "10px 12px", borderRadius: 10, background: "white", border: "1px solid #ddd", cursor: "pointer" }}>Schedule next 24h</button>
        </form>
        <Link href="/dashboard/new" style={{ padding: "10px 12px", borderRadius: 10, background: "white", border: "1px solid #ddd", textDecoration: "none", color: "#111" }}>Add backorder</Link>
      </div>

      <div style={{ background: "white", border: "1px solid #eee", borderRadius: 14, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.04)", marginBottom: 14 }}>
        <b>Worker</b>
        <div style={{ color: "#555", marginTop: 6 }}>
          Status: {hb ? "OK" : "Unknown"}<br/>
          Last seen: {hb ? new Date(hb.lastSeen).toLocaleString() : "—"}
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #eee", borderRadius: 14, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        <b>Tracked domains</b>
        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th()}>Domain</th>
                <th style={th()}>Drop time (UTC)</th>
                <th style={th()}>Status</th>
                <th style={th()}>Backorders</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d.domainName}>
                  <td style={td()}><Link href={`/domains/${encodeURIComponent(d.domainName)}`}>{d.domainName}</Link></td>
                  <td style={td()}>{new Date(d.dropTimeUtc).toISOString()}</td>
                  <td style={td()}>{d.status}</td>
                  <td style={td()}>{d.backorders.length}</td>
                </tr>
              ))}
              {domains.length === 0 && (
                <tr><td style={td()} colSpan={4}>No domains yet. Add a backorder first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function th(): React.CSSProperties {
  return { textAlign: "left", fontSize: 12, color: "#555", padding: "8px 6px", borderBottom: "1px solid #eee" };
}
function td(): React.CSSProperties {
  return { padding: "10px 6px", borderBottom: "1px solid #f2f2f2", verticalAlign: "top" };
}
