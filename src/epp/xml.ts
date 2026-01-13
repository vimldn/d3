export function wrapCommand(inner: string, clTRID: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">
  <command>
    ${inner}
    <clTRID>${escapeXml(clTRID)}</clTRID>
  </command>
</epp>`;
}
export function escapeXml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
