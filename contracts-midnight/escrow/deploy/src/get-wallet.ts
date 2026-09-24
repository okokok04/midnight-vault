import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { NetworkId as ZswapNetworkId } from '@midnight-ntwrk/zswap';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { ENDPOINTS, mnEnv, proofServerUri } from './network.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.join(__dirname, '..', `.wallet-seed.${mnEnv()}.json`);

export function loadOrCreateSeed(): string {
  if (existsSync(SEED_FILE)) {
    return JSON.parse(readFileSync(SEED_FILE, 'utf-8')).seed;
  }
  const seedHex = Buffer.from(generateRandomSeed()).toString('hex');
  writeFileSync(SEED_FILE, JSON.stringify({ seed: seedHex }, null, 2));
  return seedHex;
}

export async function openWallet(): Promise<any> {
  const env = mnEnv();
  const endpoints = ENDPOINTS[env];
  const seed = loadOrCreateSeed();

  setNetworkId(env);

  const wallet = await WalletBuilder.build(
    endpoints.indexer,
    endpoints.indexerWs,
    proofServerUri(),
    endpoints.node,
    seed,
    ZswapNetworkId.TestNet,
    'warn',
  );
  wallet.start();
  return wallet;
}
