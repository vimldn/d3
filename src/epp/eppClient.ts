import tls from 'node:tls';
import fs from 'node:fs';
import { config } from '@/config';

type Pending = { resolve: (xml: string) => void; reject: (err: Error) => void; };

export class EppClient {
  private socket?: tls.TLSSocket;
  private buffer = Buffer.alloc(0);
  private pending: Pending[] = [];
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) return;

    const cert = fs.readFileSync(config.EPP_CLIENT_CERT_PATH);
    const key  = fs.readFileSync(config.EPP_CLIENT_KEY_PATH);
    const ca   = fs.readFileSync(config.EPP_CA_PATH);

    this.socket = tls.connect({ host: config.EPP_HOST, port: config.EPP_PORT, cert, key, ca, servername: config.EPP_HOST, rejectUnauthorized: true });
    this.socket.on('data', (c)=>this.onData(c));
    this.socket.on('error', (e)=>this.failAll(new Error(`EPP socket error: ${String(e)}`)));
    this.socket.on('close', ()=>this.failAll(new Error('EPP socket closed')));

    await new Promise<void>((resolve, reject) => { this.socket!.once('secureConnect', ()=>resolve()); this.socket!.once('error', reject); });
    await this.readNextFrame(); // greeting
    this.connected = true;
  }

  async send(xml: string): Promise<string> {
    if (!this.socket) throw new Error('EPP socket not connected');
    const payload = Buffer.from(xml, 'utf8');
    const frame = Buffer.alloc(4 + payload.length);
    frame.writeUInt32BE(4 + payload.length, 0);
    payload.copy(frame, 4);

    const p = new Promise<string>((resolve, reject) => this.pending.push({ resolve, reject }));
    this.socket.write(frame);
    return p;
  }

  private async readNextFrame(): Promise<string> {
    return new Promise((resolve, reject) => this.pending.push({ resolve, reject }));
  }

  private onData(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 4) {
      const len = this.buffer.readUInt32BE(0);
      if (this.buffer.length < len) return;
      const frame = this.buffer.subarray(4, len);
      this.buffer = this.buffer.subarray(len);
      const xml = frame.toString('utf8');
      const p = this.pending.shift();
      if (p) p.resolve(xml);
    }
  }

  private failAll(err: Error) {
    this.connected = false;
    const pend = this.pending.splice(0, this.pending.length);
    for (const p of pend) p.reject(err);
  }
}
