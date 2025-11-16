'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CONTRACTS } from '@/lib/contracts';
import {
  useCurrentPrice,
  useMakePrediction,
  useActivePrediction,
  useUserScore,
  useLeaderboard,
  useCreateDuel,
  useJoinDuel,
  useActiveDuels,
  useDuelDetails,
  useUserPredictions,
  usePrediction,
  useUserStats,
  useEnsureCorrectNetwork,
  DuelDuration
} from '@/lib/hooks/useContracts';
import { parseEther, formatEther } from 'viem';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isCorrectNetwork, chainId, ensureCorrectNetwork } = useEnsureCorrectNetwork();
  const [activeTab, setActiveTab] = useState<'predictions' | 'myPredictions' | 'duels' | 'leaderboard'>('predictions');

  // Prediction state
  const crypto = 'ETH';
  const { price, isLoading: priceLoading } = useCurrentPrice(crypto);
  const { makePrediction, isPending, isConfirming, isSuccess } = useMakePrediction();
  const { prediction, refetch: refetchPrediction } = useActivePrediction(address, crypto);
  const { score } = useUserScore(address);

  // Leaderboard state
  const { leaderboard, refetch: refetchLeaderboard } = useLeaderboard(10);

  // My Predictions state
  const { predictionIds } = useUserPredictions(address);
  const { stats } = useUserStats(address);

  // Duel state
  const [duelStake, setDuelStake] = useState('0.001');
  const [duelDuration, setDuelDuration] = useState<DuelDuration>(DuelDuration.ONE_DAY);
  const { createDuel, isPending: isCreatingDuel, isSuccess: duelCreated } = useCreateDuel();
  const { duelCount, refetch: refetchDuelCount } = useActiveDuels();

  // Refetch data on success
  useEffect(() => {
    if (isSuccess) {
      refetchPrediction();
      refetchLeaderboard();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (duelCreated) {
      refetchDuelCount();
    }
  }, [duelCreated]);

  const handleMakePrediction = (predictedHigher: boolean) => {
    console.log('Making prediction:', { crypto, predictedHigher, isConnected, address });
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    makePrediction(crypto, predictedHigher);
  };

  const handleCreateDuel = () => {
    console.log('Creating duel:', { duelDuration, stake: duelStake, isConnected, address });
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    createDuel(duelDuration, parseEther(duelStake));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎯 Crypto Prediction Duels
            </h1>

            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Network Indicator */}
                {isCorrectNetwork ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-medium rounded-full">
                    ✓ Base Sepolia
                  </span>
                ) : (
                  <button
                    onClick={() => ensureCorrectNetwork()}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
                  >
                    ⚠️ Wrong Network - Click to Switch
                  </button>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Crypto Prediction Duels!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Predict crypto prices and challenge other players
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-3">📈</div>
                <h3 className="font-bold text-lg mb-2">Make Predictions</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Predict if ETH price will go up or down in 24 hours
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-3">⚔️</div>
                <h3 className="font-bold text-lg mb-2">Create Duels</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Challenge players with real ETH stakes
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold text-lg mb-2">Climb Leaderboard</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Earn points and become the top predictor
                </p>
              </div>
            </div>

            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="px-8 py-4 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition shadow-lg"
            >
              Connect Wallet to Start
            </button>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('predictions')}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === 'predictions'
                    ? 'bg-green-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                📈 Predictions
              </button>
              <button
                onClick={() => setActiveTab('myPredictions')}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === 'myPredictions'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                📊 My Predictions
              </button>
              <button
                onClick={() => setActiveTab('duels')}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === 'duels'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                ⚔️ Duels
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === 'leaderboard'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                🏆 Leaderboard
              </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {activeTab === 'predictions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Make a Prediction</h2>

                  {/* Current Price */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                    <p className="text-sm opacity-90 mb-1">Current ETH Price</p>
                    <p className="text-3xl font-bold">
                      {priceLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : price ? (
                        `$${price.toFixed(2)}`
                      ) : (
                        <span className="text-xl">Connect wallet to view price</span>
                      )}
                    </p>
                  </div>

                  {/* User Score */}
                  <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your Score: <span className="font-bold text-lg">{score} points</span>
                    </p>
                  </div>

                  {/* Active Prediction - Blocking Message */}
                  {prediction && prediction.isActive && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-orange-500 to-red-500 border-2 border-orange-600 rounded-lg text-white shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">⚠️</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-2">
                            Active Prediction in Progress
                          </h3>
                          <div className="bg-white/20 backdrop-blur-sm rounded p-3 mb-3">
                            <p className="text-sm font-semibold mb-1">
                              Direction: {prediction.predictedHigher ? '📈 Higher' : '📉 Lower'}
                            </p>
                            <p className="text-sm mb-1">
                              Start Price: <strong>${(Number(prediction.startPrice) / 1e8).toFixed(2)}</strong>
                            </p>
                            <p className="text-sm opacity-90">
                              Crypto: <strong>{prediction.cryptoSymbol}</strong>
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            ⏰ You cannot make a new prediction until this one resolves (in ~24 hours)
                          </p>
                          <p className="text-xs opacity-90 mt-2">
                            Check the "My Predictions" tab to see all your predictions
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Make Prediction */}
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      Will ETH price be higher or lower in 24 hours?
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleMakePrediction(true)}
                        disabled={isPending || isConfirming || (prediction && prediction.isActive)}
                        className="flex-1 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        title={prediction && prediction.isActive ? 'You already have an active prediction' : ''}
                      >
                        {isPending || isConfirming
                          ? '⏳ Processing...'
                          : (prediction && prediction.isActive)
                          ? '🔒 Locked'
                          : '📈 Higher'}
                      </button>
                      <button
                        onClick={() => handleMakePrediction(false)}
                        disabled={isPending || isConfirming || (prediction && prediction.isActive)}
                        className="flex-1 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        title={prediction && prediction.isActive ? 'You already have an active prediction' : ''}
                      >
                        {isPending || isConfirming
                          ? '⏳ Processing...'
                          : (prediction && prediction.isActive)
                          ? '🔒 Locked'
                          : '📉 Lower'}
                      </button>
                    </div>
                  </div>

                  {/* Success Message */}
                  {isSuccess && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 font-semibold">
                        ✅ Prediction submitted successfully!
                      </p>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Contract:</strong> {CONTRACTS.PredictionGame}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <strong>How it works:</strong> Predictions are free! Earn points for correct predictions and climb the leaderboard.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'myPredictions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">📊 My Predictions</h2>

                  {/* Stats Summary */}
                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                        <p className="text-2xl font-bold">{Number(stats.totalPredictions)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
                        <p className="text-2xl font-bold text-green-600">{Number(stats.correctPredictions)}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
                        <p className="text-2xl font-bold text-red-600">{Number(stats.incorrectPredictions)}</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {stats.totalPredictions > 0
                            ? `${((Number(stats.correctPredictions) / Number(stats.totalPredictions)) * 100).toFixed(1)}%`
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Predictions List */}
                  {predictionIds.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        No predictions yet. Make your first prediction!
                      </p>
                      <button
                        onClick={() => setActiveTab('predictions')}
                        className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Make Prediction
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {predictionIds.slice().reverse().map((id) => (
                        <PredictionItem key={id.toString()} predictionId={id} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'duels' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Create a Duel</h2>

                  {/* Create Duel Form */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white mb-6">
                    <h3 className="text-xl font-bold mb-4">Challenge Another Player</h3>

                    {/* Stake Amount */}
                    <div className="mb-4">
                      <label className="block text-sm mb-2 opacity-90">Stake Amount (ETH)</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={duelStake}
                        onChange={(e) => setDuelStake(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg text-gray-900 font-semibold"
                        placeholder="0.001"
                      />
                      <p className="text-xs opacity-75 mt-1">
                        Winner takes {(parseFloat(duelStake) * 2 * 0.97).toFixed(4)} ETH (after 3% fee)
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="mb-4">
                      <label className="block text-sm mb-2 opacity-90">Duration</label>
                      <select
                        value={duelDuration}
                        onChange={(e) => setDuelDuration(parseInt(e.target.value) as DuelDuration)}
                        className="w-full px-4 py-2 rounded-lg text-gray-900 font-semibold"
                      >
                        <option value={DuelDuration.ONE_DAY}>24 Hours</option>
                        <option value={DuelDuration.THREE_DAYS}>3 Days</option>
                        <option value={DuelDuration.SEVEN_DAYS}>7 Days</option>
                      </select>
                    </div>

                    {/* Create Button */}
                    <button
                      onClick={handleCreateDuel}
                      disabled={isCreatingDuel}
                      className="w-full py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingDuel ? '⏳ Creating Duel...' : '⚔️ Create Duel'}
                    </button>

                    {duelCreated && (
                      <div className="mt-3 p-2 bg-green-500 rounded text-center">
                        ✅ Duel created successfully!
                      </div>
                    )}
                  </div>

                  {/* Active Duels List */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4">Open Duels ({duelCount})</h3>

                    {duelCount === 0 ? (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          No open duels yet. Be the first to create one!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Array.from({ length: duelCount }, (_, i) => i).map((index) => (
                          <DuelItem key={index} duelId={BigInt(index)} currentAddress={address} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-gray-700 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Contract:</strong> {CONTRACTS.DuelManager}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      <strong>How it works:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside mt-1 space-y-1">
                      <li>Create a duel with ETH stake</li>
                      <li>Another player joins with matching stake</li>
                      <li>Both make predictions during the duel period</li>
                      <li>Most correct predictions wins the pot (minus 3% fee)</li>
                      <li>Ties result in refunds</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">🏆 Top Predictors</h2>

                  {leaderboard.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        No players yet. Be the first to make a prediction!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((player: any, index: number) => {
                        if (!player || !player.player) return null;

                        return (
                          <div
                            key={player.player}
                            className={`p-4 rounded-lg flex items-center justify-between ${
                              index === 0
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900'
                                : index === 1
                                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
                                : index === 2
                                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-gray-900'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl font-bold w-8">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                              </span>
                              <div>
                                <p className="font-mono text-sm">
                                  {player.player === address ? (
                                    <span className="font-bold">You</span>
                                  ) : (
                                    `${player.player.slice(0, 6)}...${player.player.slice(-4)}`
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{Number(player.score)}</p>
                              <p className="text-xs opacity-75">points</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Scoring:</strong> Earn 10 points for each correct prediction. Make more predictions to climb the leaderboard!
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                ✅ Fully Functional
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                All smart contracts are deployed and integrated! Connect your wallet to start making predictions and creating duels on Base Sepolia.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Component to display individual duel
function DuelItem({ duelId, currentAddress }: { duelId: bigint; currentAddress: `0x${string}` | undefined }) {
  const router = useRouter();
  const { duel, isLoading } = useDuelDetails(duelId);
  const { joinDuel, isPending, isSuccess } = useJoinDuel();

  if (isLoading || !duel || !duel.creator) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  const hasOpponent = duel.opponent && duel.opponent !== '0x0000000000000000000000000000000000000000';
  const isCreator = duel.creator && currentAddress
    ? duel.creator.toLowerCase() === currentAddress.toLowerCase()
    : false;
  const stakeAmount = duel.stakeAmount ? formatEther(duel.stakeAmount) : '0';
  const durationNames = ['24 Hours', '3 Days', '7 Days'];
  const durationName = duel.duration !== undefined ? durationNames[Number(duel.duration)] || 'Unknown' : 'Unknown';

  const handleJoinDuel = () => {
    joinDuel(duelId, duel.stakeAmount);
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${
      hasOpponent
        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-lg">
            ⚔️ Duel #{duelId.toString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stake: <strong>{stakeAmount} ETH</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Duration: <strong>{durationName}</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Creator: {duel.creator.slice(0, 6)}...{duel.creator.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          {hasOpponent ? (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500 text-white">
              ⏳ In Progress
            </span>
          ) : isCreator ? (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500 text-white">
              ⏰ Waiting
            </span>
          ) : (
            <button
              onClick={handleJoinDuel}
              disabled={isPending}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold disabled:opacity-50"
            >
              {isPending ? '⏳ Joining...' : '🎯 Join Duel'}
            </button>
          )}
        </div>
      </div>

      {hasOpponent && (
        <p className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
          Opponent: {duel.opponent.slice(0, 6)}...{duel.opponent.slice(-4)}
        </p>
      )}

      {isSuccess && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-center">
          <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
            ✅ Joined successfully!
          </p>
        </div>
      )}

      {/* View Stats Button */}
      <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
        <button
          onClick={() => router.push(`/duels/${duelId.toString()}`)}
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition font-semibold text-sm"
        >
          📊 View Detailed Statistics
        </button>
      </div>
    </div>
  );
}

// Component to display individual prediction
function PredictionItem({ predictionId }: { predictionId: bigint }) {
  const { prediction, isLoading } = usePrediction(predictionId);

  if (isLoading || !prediction) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  const isResolved = prediction.resolved;
  const won = prediction.won;
  const direction = prediction.predictedHigher ? 'Higher' : 'Lower';
  const startPrice = (Number(prediction.initialPrice) / 1e8).toFixed(2);
  const timestamp = new Date(Number(prediction.timestamp) * 1000).toLocaleDateString();

  return (
    <div className={`p-4 rounded-lg border-2 ${
      !isResolved
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        : won
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-lg">
            {prediction.cryptoSymbol} - {direction === 'Higher' ? '📈' : '📉'} {direction}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Start Price: ${startPrice}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {timestamp}
          </p>
        </div>
        <div className="text-right">
          {isResolved ? (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              won
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {won ? '✅ Won' : '❌ Lost'}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500 text-white">
              ⏳ Pending
            </span>
          )}
        </div>
      </div>
      {isResolved && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Points earned: {won ? '+10' : '0'}
        </p>
      )}
    </div>
  );
}
