import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mnEnv, ENDPOINTS } from './network.js';
import { openWallet } from './get-wallet.js';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const env = mnEnv();
  console.log(`====================================================`);
  console.log(` StellarVault Escrow — Midnight Contract Deployment `);
  console.log(`====================================================`);
  console.log(`Target Network: ${env}`);
  console.log(`Indexer: ${ENDPOINTS[env].indexer}`);
  console.log(`Node RPC: ${ENDPOINTS[env].node}`);

  const wallet = await openWallet();
  console.log('Connecting to wallet and fetching state...');

  const state = await firstValueFrom(
    wallet.state().pipe(filter((s) => s !== undefined))
  );

  console.log(`Deployer Address: ${state.address}`);
  console.log(`Unshielded Balance:`, state.balances);

  console.log('\nContract Artifacts:');
  console.log(`- Contract: contract/managed/escrow/contract/index.js`);
  console.log(`- Keys: contract/managed/escrow/keys/`);
  console.log(`- ZK-IR: contract/managed/escrow/zkir/`);
  console.log('\nReady to submit deployment transaction to Midnight network.');

  await wallet.close();
}

main().catch((err) => {
  console.error('Deployment script encountered an error:', err);
  process.exit(1);
});
