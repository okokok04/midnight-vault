export type MnEnv = 'preview' | 'preprod';

export const ENDPOINTS: Record<MnEnv, { indexer: string; indexerWs: string; node: string }> = {
  preview: {
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWs: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
  },
  preprod: {
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWs: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
  },
};

export const FAUCET_URL: Record<MnEnv, string> = {
  preview: 'https://midnight-tmnight-preview.nethermind.dev/',
  preprod: 'https://midnight-tmnight-preprod.nethermind.dev/',
};

export const mnEnv = (): MnEnv => {
  const env = process.env.MN_NETWORK ?? 'preprod';
  if (env !== 'preview' && env !== 'preprod') {
    throw new Error(`MN_NETWORK must be "preview" or "preprod", got: ${env}`);
  }
  return env;
};

export const proofServerUri = (): string => process.env.PROOF_SERVER_URI ?? 'http://localhost:6300';
