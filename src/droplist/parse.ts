export type DroplistRow = { domainName: string; dropTimeUtc: Date };

export function parseDroplist(csv: string): DroplistRow[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  const hasHeader = lines[0]?.toLowerCase().includes('drop') || lines[0]?.toLowerCase().includes('domain');
  const start = hasHeader ? 1 : 0;

  const out: DroplistRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const domainName = (parts[0] ?? '').trim().toLowerCase();
    const drop = (parts[1] ?? '').trim();
    if (!domainName || !drop) continue;
    const dropTimeUtc = new Date(drop);
    if (Number.isNaN(dropTimeUtc.getTime())) continue;
    out.push({ domainName, dropTimeUtc });
  }
  return out;
}
