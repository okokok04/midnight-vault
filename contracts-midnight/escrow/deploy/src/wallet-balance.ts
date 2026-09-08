import { mnEnv, FAUCET_URL } from './network.js';
import { openWallet } from './get-wallet.js';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

async function main() {
  const env = mnEnv();
  console.log(`[StellarVault - Midnight] Checking wallet balance for network: ${env}`);

  const wallet = await openWallet();
  console.log('Connecting and syncing wallet with indexer...');

  const state = await firstValueFrom(
    wallet.state().pipe(filter((s) => s !== undefined))
  );

  console.log('\n--- Wallet State ---');
  console.log(`Address: ${state.address}`);
  console.log(`Unshielded Balances:`, state.balances);
  console.log(`Sync status: Synced`);
  console.log(`Faucet URL: ${FAUCET_URL[env]}`);
  console.log('--------------------\n');

  await wallet.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to query wallet balance:', err);
  process.exit(1);
});
