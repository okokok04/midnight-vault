import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { mnEnv, ENDPOINTS, proofServerUri } from './network.js';
import { openWallet } from './get-wallet.js';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { Contract, ledger } from '../../contract/managed/escrow/contract/index.js';
import { witnesses, createEscrowPrivateState } from '../../contract/src/witnesses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANAGED_PATH = path.resolve(__dirname, '../../contract/managed/escrow');
const DEPLOY_RECEIPT_PATH = path.resolve(__dirname, '../../../../docs/midnight-deployment.json');

async function main() {
  const env = mnEnv();
  const dryRun = process.argv.includes('--dry-run');

  console.log(`====================================================`);
  console.log(` StellarVault Escrow — Midnight Contract Deployment `);
  console.log(`====================================================`);
  console.log(`Target Network: ${env}`);
  console.log(`Indexer: ${ENDPOINTS[env].indexer}`);
  console.log(`Node RPC: ${ENDPOINTS[env].node}`);
  console.log(`Proof Server: ${proofServerUri()}`);

  const wallet = await openWallet();
  console.log('\n[1/4] Synchronizing wallet state...');

  const state = await firstValueFrom(
    wallet.state().pipe(filter((s) => s !== undefined))
  );

  console.log(`Deployer Address: ${state.address}`);
  console.log(`Unshielded Balance:`, state.balances);

  const zkConfigProvider = new NodeZkConfigProvider<string>(MANAGED_PATH);
  const proofProvider = httpClientProofProvider(proofServerUri());
  const publicDataProvider = indexerPublicDataProvider(
    ENDPOINTS[env].indexer,
    ENDPOINTS[env].indexerWs
  );
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: `.stellarvault-midnight-deploy-${env}`,
  });

  const providers = {
    walletProvider: wallet,
    zkConfigProvider,
    proofProvider,
    publicDataProvider,
    privateStateProvider,
  };

  const sellerBytes = new Uint8Array(32).fill(1);
  const arbiterBytes = new Uint8Array(32).fill(2);
  const milestoneAmount = 100n;
  const buyerSecret = new Uint8Array(32).fill(3);

  console.log('\n[2/4] Prepared initial contract arguments:');
  console.log(`- Milestone Amount: ${milestoneAmount} tNIGHT`);
  console.log(`- Seller PK Hash: 0x${Buffer.from(sellerBytes).toString('hex').slice(0, 16)}...`);
  console.log(`- Arbiter PK Hash: 0x${Buffer.from(arbiterBytes).toString('hex').slice(0, 16)}...`);

  if (!dryRun) {
    console.log('\n[3/4] Initiating authenticated deployContract() on Midnight Preprod...');
    const deployed = await deployContract(providers, {
      contract: new Contract(witnesses),
      compiledContract: {
        contract: new Contract(witnesses),
        keys: path.join(MANAGED_PATH, 'keys'),
        zkir: path.join(MANAGED_PATH, 'zkir'),
      } as any,
      initialPrivateState: createEscrowPrivateState(buyerSecret),
      args: [sellerBytes, arbiterBytes, milestoneAmount],
      privateStateId: 'escrowPrivateState',
    } as any);

    const deployedContractAddress = (deployed as any).deployTxData?.public?.contractAddress;
    const txHash = (deployed as any).deployTxData?.public?.txId;
    const blockHeight = (deployed as any).deployTxData?.public?.blockHeight;

    if (!deployedContractAddress || !txHash) {
      throw new Error(`Deployment completed without returning valid contractAddress or txId`);
    }

    console.log(`\n✅ Deployed successfully! Contract Address: ${deployedContractAddress}`);
    console.log(`Tx ID: ${txHash}, Block: ${blockHeight}`);

    const receipt = {
      network: env,
      contractAddress: deployedContractAddress,
      deployerAddress: state.address,
      txHash,
      blockHeight,
      deployedAt: new Date().toISOString(),
      verifierKeys: 'verified_compact_escrow_v0.23',
    };

    writeFileSync(DEPLOY_RECEIPT_PATH, JSON.stringify(receipt, null, 2));
    console.log(`\n[4/4] Wrote deployment receipt to ${DEPLOY_RECEIPT_PATH}`);
  } else {
    console.log('\n[3/4] Dry-run verification complete. Skipping on-chain deployment.');
  }

  await wallet.close();
}

main().catch((err) => {
  console.error('Deployment script encountered an error:', err);
  process.exit(1);
});
