import { wrapCommand, escapeXml } from './xml';
import { config } from '@/config';

export function xmlLogin() {
  const inner = `
<login>
  <clID>${escapeXml(config.EPP_USERNAME)}</clID>
  <pw>${escapeXml(config.EPP_PASSWORD)}</pw>
  <options><version>1.0</version><lang>en</lang></options>
  <svcs>
    <objURI>urn:ietf:params:xml:ns:domain-1.0</objURI>
    <objURI>urn:ietf:params:xml:ns:contact-1.0</objURI>
    <svcExtension>
      <extURI>http://www.nominet.org.uk/epp/xml/contact-nom-ext-1.0</extURI>
      <extURI>http://www.nominet.org.uk/epp/xml/domain-nom-ext-1.0</extURI>
    </svcExtension>
  </svcs>
</login>`;
  return wrapCommand(inner, `login-${Date.now()}`);
}

export function xmlHello() {
  return `<?xml version="1.0" encoding="UTF-8"?><epp xmlns="urn:ietf:params:xml:ns:epp-1.0"><hello/></epp>`;
}

export function xmlDomainCreate(opts: { domain: string; periodYears?: number; registrantContactId: string; adminContactId?: string; techContactId?: string; nameservers: string[]; }) {
  const period = Math.max(1, Math.min(10, opts.periodYears ?? 1));
  const ns = opts.nameservers.map(h => `<domain:hostObj>${escapeXml(h)}</domain:hostObj>`).join('');
  const contacts = [
    opts.adminContactId ? `<domain:contact type="admin">${escapeXml(opts.adminContactId)}</domain:contact>` : '',
    opts.techContactId ? `<domain:contact type="tech">${escapeXml(opts.techContactId)}</domain:contact>` : ''
  ].filter(Boolean).join('');

  const inner = `
  <create>
    <domain:create xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">
      <domain:name>${escapeXml(opts.domain)}</domain:name>
      <domain:period unit="y">${period}</domain:period>
      <domain:ns>${ns}</domain:ns>
      <domain:registrant>${escapeXml(opts.registrantContactId)}</domain:registrant>
      ${contacts}
      <domain:authInfo><domain:pw>${escapeXml(randomPw())}</domain:pw></domain:authInfo>
    </domain:create>
  </create>`;
  return wrapCommand(inner, `create-${opts.domain}-${Date.now()}`);
}
function randomPw(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2); }
