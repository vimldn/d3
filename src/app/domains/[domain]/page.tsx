import Link from "next/link";
import { prisma } from "@/db";

export default async function DomainPage({ params }: { params: { domain: string } }) {
  const domainName = decodeURIComponent(params.domain).toLowerCase().trim();
  const data = await prisma.domainDrop.findUnique({
    where: { domainName },
    include: { backorders: true, attempts: { orderBy: { createdAt: "asc" } } }
  });

  if (!data) {
    return (
      <main>
        <Link href="/dashboard" style={{ color: "#111" }}>← Back</Link>
        <p>Not found</p>
      </main>
    );
  }

  return (
    <main>
      <Link href="/dashboard" style={{ color: "#111" }}>← Back</Link>
      <h2 style={{ margin: "12px 0 6px" }}>{data.domainName}</h2>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={card()}>
          <b>Status</b>
          <div style={{ color: "#555", marginTop: 6 }}>
            Drop time (UTC): {new Date(data.dropTimeUtc).toISOString()}<br/>
            Status: {data.status}<br/>
            Last error: {data.lastErrorCode ?? "—"} {data.lastErrorMsg ?? ""}
          </div>
        </div>

        <div style={card()}>
          <b>Backorders</b>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
            {data.backorders.map((b) => (<li key={b.id}>{b.customerId} (priority {b.priority})</li>))}
            {data.backorders.length === 0 && <li>None</li>}
          </ul>
        </div>

        <div style={card()}>
          <b>Attempts</b>
          <div style={{ marginTop: 10, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th()}>#</th>
                  <th style={th()}>Time (UTC)</th>
                  <th style={th()}>RTT ms</th>
                  <th style={th()}>Result</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((a) => (
                  <tr key={a.id}>
                    <td style={td()}>{a.attemptNo}</td>
                    <td style={td()}>{new Date(a.sentTimeUtc).toISOString()}</td>
                    <td style={td()}>{a.rttMs}</td>
                    <td style={td()}>{a.resultCode} {a.resultMsg}</td>
                  </tr>
                ))}
                {data.attempts.length === 0 && (<tr><td style={td()} colSpan={4}>No attempts yet.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function card(): React.CSSProperties {
  return { background: "white", border: "1px solid #eee", borderRadius: 14, padding: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" };
}
function th(): React.CSSProperties {
  return { textAlign: "left", fontSize: 12, color: "#555", padding: "8px 6px", borderBottom: "1px solid #eee" };
}
function td(): React.CSSProperties {
  return { padding: "10px 6px", borderBottom: "1px solid #f2f2f2", verticalAlign: "top" };
}
