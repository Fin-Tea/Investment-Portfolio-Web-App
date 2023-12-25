import { run } from "../../sync-account-balance";

const EMAIL = "jabari@jabariholloway.com";
const EMAIL2 = "jabarisalih@gmail.com";

const baseOverrides = {
  accountEmails: [EMAIL, EMAIL2],
  // testMode: true,
  // currentDate: new Date('2021-12-26')
};

(async function () {
  // test sync
  const results = await run(baseOverrides);

  const balanceInfos = Array.from(results.values());
  // console.log(balanceInfo.error);
  console.log(JSON.stringify(balanceInfos));

  process.exit(0);
})();
