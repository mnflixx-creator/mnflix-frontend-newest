// Type declarations for external modules

declare module '@noble/hashes/pbkdf2' {
  export function pbkdf2(
    password: Uint8Array,
    salt: Uint8Array,
    opts: { c: number; dkLen: number }
  ): Uint8Array;
  
  export function pbkdf2Async(
    password: Uint8Array,
    salt: Uint8Array,
    opts: { c: number; dkLen: number }
  ): Promise<Uint8Array>;
}

declare module '@noble/hashes/sha256' {
  export function sha256(data: Uint8Array): Uint8Array;
  export class SHA256 {
    update(data: Uint8Array): this;
    digest(): Uint8Array;
  }
}

declare module '@scure/bip39/wordlists/english' {
  const wordlist: string[];
  export { wordlist };
}

declare module '@plasmohq/messaging' {
  export interface PlasmoMessaging {
    name: string;
    body: any;
    respond: (response: any) => void;
  }
  
  export function sendToBackground(message: any): Promise<any>;
  export function sendToContentScript(message: any): Promise<any>;
}
