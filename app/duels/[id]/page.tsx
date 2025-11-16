'use client';

import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  useDuelDetails,
  useDuelPredictions,
  useEnsureCorrectNetwork,
  useMakeDuelPrediction,
  useCurrentPrice
} from '@/lib/hooks/useContracts';
import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DuelStatsPage({ params }: PageProps) {
  const router = useRouter();
  const [duelIdStr, setDuelIdStr] = useState<string | null>(null);
  const { address } = useAccount();
  const { isCorrectNetwork, ensureCorrectNetwork } = useEnsureCorrectNetwork();

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      console.log('Params resolved:', p);
      setDuelIdStr(p.id);
    });
  }, [params]);

  // Parse duel ID - use BigInt(0) as a safe default for hooks
  const duelId = duelIdStr ? BigInt(duelIdStr) : BigInt(0);

  // Call all hooks unconditionally
  const { duel, isLoading: duelLoading, refetch: refetchDuel } = useDuelDetails(duelId);

  // Get predictions for both players
  const creatorAddress = duel?.creator as `0x${string}` | undefined;
  const opponentAddress = duel?.opponent as `0x${string}` | undefined;

  const { predictions: creatorPredictions, isLoading: creatorPredictionsLoading } =
    useDuelPredictions(duelId, creatorAddress);
  const { predictions: opponentPredictions, isLoading: opponentPredictionsLoading } =
    useDuelPredictions(duelId, opponentAddress);

  // Prediction making
  const { makeDuelPrediction, isPending: isPredicting, isConfirming: isConfirmingPrediction, isSuccess: predictionSuccess } = useMakeDuelPrediction();
  const crypto = 'ETH';
  const { price, isLoading: priceLoading } = useCurrentPrice(crypto);

  // Combine all pending states
  const isProcessingPrediction = isPredicting || isConfirmingPrediction;

  // Check if user has any unresolved predictions
  const userPredictions = address && duel && (
    address.toLowerCase() === duel.creator.toLowerCase() ? creatorPredictions : opponentPredictions
  );
  const hasPendingPredictions = userPredictions?.some((pred: any) => !pred.resolved) || false;
  const pendingCount = userPredictions?.filter((pred: any) => !pred.resolved).length || 0;

  // Block new predictions if any are pending resolution
  const canMakePrediction = !isProcessingPrediction && !hasPendingPredictions;

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Check if current user is a participant
  const isParticipant = address && duel && (
    duel.creator.toLowerCase() === address.toLowerCase() ||
    (duel.opponent && duel.opponent.toLowerCase() === address.toLowerCase())
  );

  const handleMakePrediction = async (predictedHigher: boolean) => {
    // Prevent multiple clicks while processing
    if (isProcessingPrediction) {
      console.log('Transaction already in progress, ignoring click');
      return;
    }

    // Prevent new predictions while others are pending resolution
    if (hasPendingPredictions) {
      alert(`You have ${pendingCount} prediction(s) pending resolution. Please wait for them to resolve before making a new prediction.`);
      return;
    }

    if (!duelIdStr) {
      alert('Duel ID not found - page not fully loaded');
      return;
    }

    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    const actualDuelId = BigInt(duelIdStr);
    console.log('Making prediction:', {
      duelId: actualDuelId.toString(),
      crypto,
      predictedHigher,
      address,
      isProcessing: isProcessingPrediction,
    });

    try {
      await makeDuelPrediction(actualDuelId, crypto, predictedHigher);
      console.log('Prediction transaction submitted');
    } catch (error) {
      console.error('Error making duel prediction:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Refetch predictions after successful prediction
  useEffect(() => {
    if (predictionSuccess) {
      setTimeout(() => {
        refetchDuel();
      }, 2000);
    }
  }, [predictionSuccess, refetchDuel]);

  // Calculate time remaining
  useEffect(() => {
    if (!duel || !duel.endTime || !duelIdStr) return;

    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(duel.endTime);
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Ended');
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [duel, duelIdStr]);

  // Show loading while params are being resolved
  if (!duelIdStr) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading duel...</p>
        </div>
      </div>
    );
  }

  if (duelLoading || !duel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading duel statistics...</p>
        </div>
      </div>
    );
  }

  const hasOpponent = duel.opponent && duel.opponent !== '0x0000000000000000000000000000000000000000';
  const stakeAmount = duel.stakeAmount ? formatEther(duel.stakeAmount) : '0';
  const totalPot = duel.stakeAmount ? formatEther(BigInt(duel.stakeAmount) * BigInt(2)) : '0';
  const durationNames = ['24 Hours', '3 Days', '7 Days'];
  const durationName = duel.duration !== undefined ? durationNames[Number(duel.duration)] : 'Unknown';
  const statusNames = ['Open', 'Active', 'Ended', 'Resolved'];
  const statusName = duel.status !== undefined ? statusNames[Number(duel.status)] : 'Unknown';

  const creatorCorrect = Number(duel.creatorCorrectPredictions || 0);
  const creatorTotal = Number(duel.creatorTotalPredictions || 0);
  const opponentCorrect = Number(duel.opponentCorrectPredictions || 0);
  const opponentTotal = Number(duel.opponentTotalPredictions || 0);

  const creatorAccuracy = creatorTotal > 0 ? ((creatorCorrect / creatorTotal) * 100).toFixed(1) : '0';
  const opponentAccuracy = opponentTotal > 0 ? ((opponentCorrect / opponentTotal) * 100).toFixed(1) : '0';

  const isResolved = duel.status === 3; // RESOLVED
  const hasWinner = duel.winner && duel.winner !== '0x0000000000000000000000000000000000000000';
  const isTie = isResolved && !hasWinner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ⚔️ Duel #{duelIdStr || '...'} Statistics
              </h1>
            </div>
            {isCorrectNetwork ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-medium rounded-full">
                ✓ Base Sepolia
              </span>
            ) : (
              <button
                onClick={() => ensureCorrectNetwork()}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
              >
                ⚠️ Wrong Network
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Duel Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Duel Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    statusName === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    statusName === 'Resolved' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                    statusName === 'Ended' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {statusName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Stake (each):</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{stakeAmount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Pot:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{totalPot} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{durationName}</span>
                </div>
                {hasOpponent && statusName === 'Active' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{timeRemaining}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Prize Distribution</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee (3%):</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(parseFloat(totalPot) * 0.03).toFixed(6)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Winner Takes:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {(parseFloat(totalPot) * 0.97).toFixed(6)} ETH
                  </span>
                </div>
                {isTie && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      🤝 <strong>Tie!</strong> Both players received their stakes back.
                    </p>
                  </div>
                )}
                {isResolved && hasWinner && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                      🏆 <strong>Winner:</strong>
                    </p>
                    <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                      {duel.winner}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Make Prediction Section - Only for participants in active duels */}
        {isParticipant && statusName === 'Active' && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-4">⚔️ Make Your Prediction</h2>

            {/* Current Price */}
            <div className="mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <p className="text-sm opacity-90 mb-1">Current ETH Price</p>
              <p className="text-3xl font-bold">
                {priceLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : price ? (
                  `$${price.toFixed(2)}`
                ) : (
                  <span className="text-xl">Price unavailable</span>
                )}
              </p>
            </div>

            <p className="mb-4 text-sm opacity-90">
              Predict if ETH price will be <strong>higher or lower</strong> in 24 hours.
              Each correct prediction counts toward your score!
            </p>

            {predictionSuccess && (
              <div className="mb-4 p-3 bg-green-500 rounded-lg text-center">
                <p className="font-bold">✅ Prediction submitted successfully!</p>
                <p className="text-sm opacity-90">It will resolve in 24 hours</p>
              </div>
            )}

            {/* Show pending predictions warning */}
            {hasPendingPredictions && !isProcessingPrediction && (
              <div className="mb-4 p-3 bg-orange-500 rounded-lg text-center">
                <p className="font-bold">⏳ You have {pendingCount} prediction(s) pending resolution</p>
                <p className="text-sm opacity-90">Wait for them to resolve before making a new prediction</p>
              </div>
            )}

            {/* Show transaction status */}
            {isProcessingPrediction && (
              <div className="mb-4 p-3 bg-yellow-500 rounded-lg text-center animate-pulse">
                <p className="font-bold">
                  {isPredicting ? '⏳ Awaiting wallet confirmation...' : '⏳ Transaction confirming...'}
                </p>
                <p className="text-sm opacity-90">
                  {isPredicting ? 'Please confirm in your wallet' : 'Waiting for blockchain confirmation'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleMakePrediction(true)}
                disabled={!canMakePrediction || !price}
                className="py-4 bg-green-500 hover:bg-green-600 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={hasPendingPredictions ? `${pendingCount} prediction(s) pending - wait for resolution` : ''}
              >
                {isProcessingPrediction ? '⏳ Processing...' : hasPendingPredictions ? '🔒 Locked' : '📈 Higher'}
              </button>
              <button
                onClick={() => handleMakePrediction(false)}
                disabled={!canMakePrediction || !price}
                className="py-4 bg-red-500 hover:bg-red-600 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={hasPendingPredictions ? `${pendingCount} prediction(s) pending - wait for resolution` : ''}
              >
                {isProcessingPrediction ? '⏳ Processing...' : hasPendingPredictions ? '🔒 Locked' : '📉 Lower'}
              </button>
            </div>

            <p className="text-xs mt-3 opacity-75 text-center">
              ⏰ Time remaining to make predictions: <strong>{timeRemaining}</strong>
            </p>
          </div>
        )}

        {/* Info for non-participants */}
        {!isParticipant && statusName === 'Active' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-center">
              👀 You are viewing this duel as a spectator. Only participants can make predictions.
            </p>
          </div>
        )}

        {/* Players Statistics */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Creator Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                👤 Creator
              </h3>
              {isResolved && hasWinner && duel.winner.toLowerCase() === duel.creator.toLowerCase() && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-bold rounded">
                  🏆 WINNER
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-4 break-all">
              {duel.creator}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Predictions:</span>
                <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                  {creatorTotal}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Correct:</span>
                <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                  {creatorCorrect}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  {creatorAccuracy}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {creatorTotal > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${creatorAccuracy}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Opponent Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                👤 Opponent
              </h3>
              {isResolved && hasWinner && duel.winner.toLowerCase() === duel.opponent?.toLowerCase() && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-bold rounded">
                  🏆 WINNER
                </span>
              )}
            </div>
            {hasOpponent ? (
              <>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-4 break-all">
                  {duel.opponent}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Predictions:</span>
                    <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                      {opponentTotal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Correct:</span>
                    <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                      {opponentCorrect}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                    <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                      {opponentAccuracy}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {opponentTotal > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${opponentAccuracy}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  ⏳ Waiting for opponent to join...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Predictions List */}
        {hasOpponent && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Creator Predictions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Creator's Predictions ({creatorPredictions.length})
              </h3>
              {creatorPredictionsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : creatorPredictions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No predictions yet
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {creatorPredictions.map((pred: any, idx: number) => (
                    <PredictionCard key={idx} prediction={pred} index={idx} />
                  ))}
                </div>
              )}
            </div>

            {/* Opponent Predictions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Opponent's Predictions ({opponentPredictions.length})
              </h3>
              {opponentPredictionsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : opponentPredictions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No predictions yet
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {opponentPredictions.map((pred: any, idx: number) => (
                    <PredictionCard key={idx} prediction={pred} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PredictionCard({ prediction, index }: { prediction: any; index: number }) {
  const initialPrice = prediction.initialPrice ? (Number(prediction.initialPrice) / 1e8).toFixed(2) : '0';
  const direction = prediction.predictedHigher ? '📈 Higher' : '📉 Lower';
  const isResolved = prediction.resolved;
  const won = prediction.won;

  // Format timestamp
  const timestamp = prediction.timestamp ? Number(prediction.timestamp) : 0;
  const createdDate = new Date(timestamp * 1000);
  const formattedDate = createdDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate time until resolution
  const resolutionTime = prediction.resolutionTime ? Number(prediction.resolutionTime) : 0;
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = resolutionTime - now;
  const hoursLeft = Math.floor(timeLeft / 3600);
  const minutesLeft = Math.floor((timeLeft % 3600) / 60);

  return (
    <div className={`p-3 rounded-lg border-2 ${
      !isResolved
        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        : won
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            Prediction #{index + 1}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {prediction.cryptoSymbol || 'ETH'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            🕐 {formattedDate}
          </p>
        </div>
        {isResolved && (
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            won
              ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
              : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
          }`}>
            {won ? '✓ Correct' : '✗ Wrong'}
          </span>
        )}
      </div>
      <div className="text-xs space-y-1">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Direction:</strong> {direction}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Start Price:</strong> ${initialPrice}
        </p>
        {!isResolved && timeLeft > 0 && (
          <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">
            ⏳ Resolves in {hoursLeft}h {minutesLeft}m
          </p>
        )}
        {!isResolved && timeLeft <= 0 && (
          <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">
            ⏳ Ready to resolve
          </p>
        )}
      </div>
    </div>
  );
}
