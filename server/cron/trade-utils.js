function isEqualEpochs(epoch1, epoch2, errorToleranceMinutes) {
  if (epoch1 === epoch2) {
    return true;
  }

  if (errorToleranceMinutes) {
    const deltaMilliseconds = Math.abs(epoch1 - epoch2);
    return deltaMilliseconds / (1000 * 60) < errorToleranceMinutes;
  }

  return false;
}

// NOTE: The tradeDatetime must be in the correct timezone to return the correct candlestick
export function findNearestCandle(
  candles,
  tradeDatetime,
  errorToleranceMinutes = 1
) {
  if (!candles.length) {
    return null;
  }

  console.log(`tradeDatetime: ${tradeDatetime}`);

  let i = 0;
  let j = candles.length;

  const tradeEpoch = new Date(tradeDatetime).getTime();

  while (i < j) {
    const mid = Math.floor((i + j) / 2);
    const candle = candles[mid];
    const { datetime: candleEpoch } = candle;

    if (isEqualEpochs(tradeEpoch, candleEpoch, errorToleranceMinutes)) {
      return candle;
    } else if (tradeEpoch < candleEpoch) {
      j = mid - 1;
    } else {
      i = mid + 1;
    }
  }

  return null;
}

export function calcAverageCandlePrice(candle) {
  if (!candle) {
    return null;
  }

  const { open, close } = candle;

  return (open + close) / 2;
}
