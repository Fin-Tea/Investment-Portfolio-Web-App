import { findNearestCandle } from "../../trade-utils";
import priceHistoryFixture from "../fixtures/price-history-fixture.json";

(async function () {
  const { candles } = priceHistoryFixture;

  const tradeDate1 = "2022-02-22T08:30:00-0600"; // market open edge case
  const tradeDate2 = "2022-02-22T11:11:33-0600"; // market day
  const tradeDate3 = "2022-02-22T14:59:00-0600"; // market close
  const tradeDate4 = "2022-02-25T15:00:00-0600"; // out of range date

  console.log(JSON.stringify(findNearestCandle(candles, tradeDate1)));
  console.log(JSON.stringify(findNearestCandle(candles, tradeDate2)));
  console.log(JSON.stringify(findNearestCandle(candles, tradeDate3)));
  console.log(JSON.stringify(findNearestCandle(candles, tradeDate4)));

  process.exit(0);
})();
