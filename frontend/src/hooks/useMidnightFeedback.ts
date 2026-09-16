import { useCallback, useEffect, useState } from 'react';
import type { MidnightLaceApi, OnChainFeedbackState } from '../types/midnight';
import { MidnightPrivateStore } from '../lib/midnight-private-store';
import { midnightContractClient } from '../lib/midnight-contract-client';
import { midnightIndexer } from '../lib/midnight-indexer';
import { PREPROD_DEPLOYED_CONTRACT } from '../lib/midnight-crypto';

export const DEFAULT_SURVEY_TOPIC = '0x5374656c6c61725661756c745f467265656c616e63655f526174696e675f3236';

export function useMidnightFeedback(laceApi?: MidnightLaceApi | null) {
  const [participantSecret, setParticipantSecret] = useState<string>(() =>
    MidnightPrivateStore.getFeedbackParticipantSecret()
  );

  const [feedbackStats, setFeedbackStats] = useState<OnChainFeedbackState>({
    totalResponses: 12,
    totalRatingSum: 58,
    lastNullifier: '0x7f2b8c9d10e4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789',
    surveyTopic: DEFAULT_SURVEY_TOPIC,
    contractAddress: PREPROD_DEPLOYED_CONTRACT,
    consumedNullifiers: MidnightPrivateStore.getConsumedNullifiers(),
  });

  const [currentNullifier, setCurrentNullifier] = useState<string>('');
  const [isConsumed, setIsConsumed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zkLogs, setZkLogs] = useState<string[]>([]);

  // Sync with Indexer on mount
  useEffect(() => {
    let active = true;
    midnightIndexer.fetchFeedbackState(DEFAULT_SURVEY_TOPIC).then((state) => {
      if (active) {
        setFeedbackStats((prev) => ({
          ...prev,
          totalResponses: state.totalResponses,
          totalRatingSum: state.totalRatingSum,
          lastNullifier: state.lastNullifier,
        }));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Compute live nullifier whenever participant secret or survey topic changes
  useEffect(() => {
    let active = true;
    MidnightPrivateStore.computeNullifier(participantSecret, feedbackStats.surveyTopic).then((nullifier) => {
      if (active) {
        setCurrentNullifier(nullifier);
        setIsConsumed(MidnightPrivateStore.isNullifierConsumed(nullifier));
      }
    });
    return () => {
      active = false;
    };
  }, [participantSecret, feedbackStats.surveyTopic]);

  const updateParticipantSecret = useCallback((newSecret: string) => {
    MidnightPrivateStore.setFeedbackParticipantSecret(newSecret);
    setParticipantSecret(newSecret);
  }, []);

  const regenerateSecret = useCallback(() => {
    const fresh = MidnightPrivateStore.getFeedbackParticipantSecret();
    setParticipantSecret(fresh);
  }, []);

  const submitRating = useCallback(
    async (rating: number, category: string): Promise<{ nullifier: string; txHash: string }> => {
      setSubmitting(true);
      setError(null);

      try {
        const { nullifier, txHash, zkProofHash } = await midnightContractClient.executeSubmitRating(
          rating,
          category,
          feedbackStats.surveyTopic,
          laceApi
        );

        setFeedbackStats((prev) => ({
          ...prev,
          totalResponses: prev.totalResponses + 1,
          totalRatingSum: prev.totalRatingSum + rating,
          lastNullifier: nullifier,
          consumedNullifiers: [nullifier, ...prev.consumedNullifiers],
        }));

        setIsConsumed(true);

        const logEntry = `[${new Date().toLocaleTimeString()}] ✅ circuit submitRating(${rating}★, ${category}) -> ZK Proof (${zkProofHash.slice(0, 16)}...) verified. Tx: ${txHash.slice(0, 18)}... Nullifier: ${nullifier.slice(0, 16)}... registered on-chain. Participant secret retained in client memory.`;
        setZkLogs((prev) => [logEntry, ...prev]);

        return { nullifier, txHash };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Feedback submission failed';
        setError(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [feedbackStats.surveyTopic, laceApi]
  );

  return {
    participantSecret,
    currentNullifier,
    isConsumed,
    feedbackStats,
    submitting,
    error,
    zkLogs,
    updateParticipantSecret,
    regenerateSecret,
    submitRating,
  };
}
