import { run } from "../../sync-trade-history";

const EMAIL = "jabari@jabariholloway.com";
const EMAIL2 = "jabarisalih@gmail.com";

const baseOverrides = {
  accountEmails: [EMAIL, EMAIL2],
  // testMode: true,
};

(async function () {
  const currentDate = new Date("2021-12-26");

  // test recurring sync
  const recurringSyncTestOverrides = {
    ...baseOverrides,
    // lastSyncedAt: new Date("2022-03-01"),
    //  currentDate
  };

  const recurringSyncResults = await run(recurringSyncTestOverrides);

  const [recurringSyncAccount] = Array.from(recurringSyncResults.values());
  console.log(JSON.stringify(recurringSyncAccount.error));
  console.log(JSON.stringify(recurringSyncAccount.trades));

  // test initial sync
  // const initialSyncTestOverrides = {
  //     ...baseOverrides,
  //     initialSync: true,
  //     currentDate,
  // };

  // console.log(JSON.stringify(initialSyncTestOverrides));

  // const initialSyncResults = await run(initialSyncTestOverrides);

  // const [initialSyncAccount] = Array.from(initialSyncResults.values());
  // console.log(JSON.stringify(initialSyncAccount.error));
  // console.log(JSON.stringify(initialSyncAccount.trades[0]));

  process.exit(0);
})();
