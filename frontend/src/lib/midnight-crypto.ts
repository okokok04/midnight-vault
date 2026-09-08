/**
 * Computes deterministic 32-byte public key hash from a private secret,
 * matching Compact's derivePublicKey logic:
 * persistentHash([pad(32, "stellarvault:pk:"), secret])
 */
export async function deriveMidnightPublicKey(secretHex: string): Promise<string> {
  const cleanHex = secretHex.replace(/^0x/, '').padStart(64, '0').slice(0, 64);
  const prefix = new TextEncoder().encode('stellarvault:pk:');
  const paddedPrefix = new Uint8Array(32);
  paddedPrefix.set(prefix);

  const secretBytes = new Uint8Array(
    cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );

  const combined = new Uint8Array(64);
  combined.set(paddedPrefix, 0);
  combined.set(secretBytes, 32);

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return '0x' + Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const PREPROD_DEPLOYED_CONTRACT = '0x42f89c09c319b9df19bb23dae267104b205312f275e771e7a6858066bb739ae0';
