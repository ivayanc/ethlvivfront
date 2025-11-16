import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts';
import PredictionGameABI from '../abis/PredictionGame.json';
import DuelManagerABI from '../abis/DuelManager.json';
import PriceOracleABI from '../abis/PriceOracle.json';

// Enums from contracts
export enum DuelDuration {
  ONE_DAY = 0,
  THREE_DAYS = 1,
  SEVEN_DAYS = 2,
}

// Hook for Oracle
export function useCurrentPrice(crypto: string) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.PriceOracle as `0x${string}`,
    abi: PriceOracleABI.abi,
    functionName: 'getLatestPrice',
    args: [crypto],
  });

  // getLatestPrice returns (price, decimals, timestamp)
  const price = data && Array.isArray(data) ? Number(data[0]) / 1e8 : null;

  return {
    price,
    isLoading,
    error,
  };
}

// Hook for making predictions
export function useMakePrediction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const makePrediction = (crypto: string, predictedHigher: boolean) => {
    console.log('useMakePrediction - calling writeContract with:', {
      address: CONTRACTS.PredictionGame,
      functionName: 'makePrediction',
      args: [crypto, predictedHigher],
      hasABI: !!PredictionGameABI.abi,
    });

    try {
      writeContract({
        address: CONTRACTS.PredictionGame as `0x${string}`,
        abi: PredictionGameABI.abi,
        functionName: 'makePrediction',
        args: [crypto, predictedHigher],
      });
    } catch (err) {
      console.error('Error calling writeContract:', err);
    }
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  console.log('useMakePrediction state:', { isPending, isConfirming, isSuccess, error, hash });

  return {
    makePrediction,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook for checking if user has an active prediction
export function useActivePrediction(address: `0x${string}` | undefined, crypto: string) {
  const { stats } = useUserStats(address);
  const { predictionIds } = useUserPredictions(address);

  // Get the most recent prediction (if any)
  const latestPredictionId = predictionIds.length > 0 ? predictionIds[predictionIds.length - 1] : undefined;
  const { prediction: latestPrediction } = usePrediction(latestPredictionId);

  // If user has pending predictions and the latest one is unresolved, return it
  const hasActivePrediction = stats && Number(stats.pendingPredictions) > 0;

  if (hasActivePrediction && latestPrediction && !latestPrediction.resolved) {
    return {
      prediction: {
        ...latestPrediction,
        isActive: true,
        startPrice: latestPrediction.initialPrice,
      },
      isLoading: false,
      refetch: () => {},
    };
  }

  return {
    prediction: null,
    isLoading: false,
    refetch: () => {},
  };
}

// Hook for getting user's score
export function useUserScore(address: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.PredictionGame as `0x${string}`,
    abi: PredictionGameABI.abi,
    functionName: 'userScores',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    score: data ? Number(data) : 0,
    isLoading,
  };
}

// Hook for getting leaderboard
export function useLeaderboard(limit: number = 10) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.PredictionGame as `0x${string}`,
    abi: PredictionGameABI.abi,
    functionName: 'getLeaderboard',
    args: [limit],
  });

  // getLeaderboard returns (addresses[], scores[])
  const leaderboard = data && Array.isArray(data) && data.length === 2
    ? (data[0] as string[]).map((address, index) => ({
        player: address,
        score: data[1][index]
      }))
    : [];

  return {
    leaderboard,
    isLoading,
    refetch,
  };
}

// Hook for creating a duel
export function useCreateDuel() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createDuel = (duration: DuelDuration, stakeAmount: bigint) => {
    console.log('useCreateDuel - calling writeContract with:', {
      address: CONTRACTS.DuelManager,
      functionName: 'createDuel',
      args: [duration],
      value: stakeAmount.toString(),
      hasABI: !!DuelManagerABI.abi,
    });

    try {
      writeContract({
        address: CONTRACTS.DuelManager as `0x${string}`,
        abi: DuelManagerABI.abi,
        functionName: 'createDuel',
        args: [duration],
        value: stakeAmount,
      });
    } catch (err) {
      console.error('Error calling writeContract:', err);
    }
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  console.log('useCreateDuel state:', { isPending, isConfirming, isSuccess, error, hash });

  return {
    createDuel,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook for joining a duel
export function useJoinDuel() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const joinDuel = (duelId: bigint, stakeAmount: bigint) => {
    writeContract({
      address: CONTRACTS.DuelManager as `0x${string}`,
      abi: DuelManagerABI.abi,
      functionName: 'joinDuel',
      args: [duelId],
      value: stakeAmount,
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    joinDuel,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook for making a duel prediction
export function useMakeDuelPrediction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const makeDuelPrediction = (duelId: bigint, predictedHigher: boolean) => {
    writeContract({
      address: CONTRACTS.DuelManager as `0x${string}`,
      abi: DuelManagerABI.abi,
      functionName: 'makeDuelPrediction',
      args: [duelId, predictedHigher],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    makeDuelPrediction,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook for getting active duels
export function useActiveDuels() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.DuelManager as `0x${string}`,
    abi: DuelManagerABI.abi,
    functionName: 'duelCounter',
  });

  return {
    duelCount: data ? Number(data) : 0,
    isLoading,
    refetch,
  };
}

// Hook for getting duel details
export function useDuelDetails(duelId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.DuelManager as `0x${string}`,
    abi: DuelManagerABI.abi,
    functionName: 'getDuel',
    args: [duelId],
  });

  return {
    duel: data as any,
    isLoading,
    refetch,
  };
}

// Hook for getting user's prediction IDs
export function useUserPredictions(address: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.PredictionGame as `0x${string}`,
    abi: PredictionGameABI.abi,
    functionName: 'getUserPredictions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    predictionIds: (data as bigint[]) || [],
    isLoading,
    refetch,
  };
}

// Hook for getting a single prediction
export function usePrediction(predictionId: bigint | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.PredictionGame as `0x${string}`,
    abi: PredictionGameABI.abi,
    functionName: 'getPrediction',
    args: predictionId !== undefined ? [predictionId] : undefined,
    query: {
      enabled: predictionId !== undefined,
    },
  });

  return {
    prediction: data as any,
    isLoading,
  };
}

// Hook for getting user stats
export function useUserStats(address: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.PredictionGame as `0x${string}`,
    abi: PredictionGameABI.abi,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    stats: data as any,
    isLoading,
  };
}
