import db from "../../../db";
import { fetchPriceHistory } from "../../../integrations/tdameritrade";

const EMAIL = "jabari@jabariholloway.com";

(async function () {
  const account = await db
    .select(
      "tdaAccountId",
      "tdaAccessToken",
      "tdaRefreshToken",
      "tdaRefreshTokenExpiresAt",
      "lastTdaSyncedAt"
    )
    .from("account")
    .where({ email: EMAIL })
    .first();

  console.log(`accountId: ${account.tdaAccountId}`);
  const {
    tdaAccessToken: accessToken,
    tdaRefreshToken: refreshToken,
    tdaRefreshTokenExpiresAt: refreshTokenExpiresAt,
  } = account;

  const tokenInfo = {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
  };

  const priceHistory = await fetchPriceHistory(
    "SPY",
    {
      startDate: "2022-02-22T14:54:03.000Z", // 1645834800000, // "2022-01-01",
      endDate: "2022-02-24T20:41:29.000Z", // 1645836480000, // "2022-01-05",
      // frequencyType: "daily",
      //   frequency: 1,
      // needExtendedHoursData: "false",
    },
    tokenInfo
  );

  console.log(JSON.stringify(priceHistory));
  console.log(priceHistory.candles.length);

  process.exit(0);
})();
