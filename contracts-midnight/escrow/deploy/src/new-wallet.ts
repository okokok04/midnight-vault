import { mnEnv, FAUCET_URL } from './network.js';
import { loadOrCreateSeed, openWallet } from './get-wallet.js';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

async function main() {
  const env = mnEnv();
  console.log(`[MidnightVault - Midnight] Initializing wallet for network: ${env}`);
  const seed = loadOrCreateSeed();
  console.log(`Seed loaded / created (first 12 chars): ${seed.slice(0, 12)}...`);

  const wallet = await openWallet();
  console.log('Syncing wallet state with network indexer...');

  const state: any = await firstValueFrom(
    wallet.state().pipe(filter((s: any) => s !== undefined))
  );

  console.log('\n--- Wallet Details ---');
  console.log(`Network: ${env}`);
  console.log(`Address: ${state?.address}`);
  console.log(`Faucet URL to request tDUST / tNIGHT: ${FAUCET_URL[env]}`);
  console.log('----------------------\n');

  await wallet.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to get/create wallet:', err);
  process.exit(1);
});
