const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const https = require("https");
const fs = require("fs");
const authMiddleware = require("./middleware").default;
const accountService = require("./services/account");
const tdAmeritrade = require("./integrations/tdameritrade");
const tradingService = require("./services/trades");
const improvementActionsService = require("./services/improvementActions");
const insightsService = require("./services/insights");
const config = require("./config");

export const PORT = 8080;

const key = fs.readFileSync("./security/key.pem");
const cert = fs.readFileSync("./security/cert.pem");

const app = express();

//app.use(cors());
app.use(
  fileUpload()
  /*{
    createParentPath: true,
  }*/
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", config.clientBaseUrl);

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE", "OPTIONS");

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Content-Disposition"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

const server = https.createServer({ key, cert }, app);

app.options("/*", (req, res) => {
  res.send(200);
});

app.get("/api/account/:accountId/tda", (req, res) => {
  // needs the accountId
  console.log("Query Params");
  console.log(JSON.stringify(req.query));

  console.log("\n");
  console.log("decoded token");
  console.log(decodeURIComponent(req.query.code));

  res.status(200).send("OK");
});

app.get("/", async (req, res) => {
  const { accountId, code } = req.query;

  // needs the accountId
  console.log("Query Params");
  console.log(JSON.stringify(req.query));

  console.log("\n");
  console.log("decoded auth codes");
  const decodedAuthCode = decodeURIComponent(req.query.code);
  console.log(decodeURIComponent(decodedAuthCode));

  if (code && accountId) {
    const tokenResp = await tdAmeritrade.fetchToken({
      grantType: "authorization_code",
      accessType: "offline",
      code,
      accountId,
    });

    console.log("tokenResp");
    console.log(JSON.stringify(tokenResp));

    let redirectUrl = config.clientBaseUrl;

    if (tokenResp && !tokenResp.error) {
      await accountService.updateTDATokens(accountId, tokenResp);
    } else {
      redirectUrl += `?error=${encodeURIComponent(tokenResp.error)}`;
    }

    return res.redirect(redirectUrl);
  }
  // TODO: add db flag so that "Log in to TD Ameritrade" link only shows when/if refresh token has expired

  return res.status(200).send("OK");
});

app.get("/api/account/:accountId/config", authMiddleware, async (req, res) => {
  const {
    tda: { consumerKey, redirectUri },
  } = config;

  const { accountId } = req.params;

  const formattedRedirectUri = `${redirectUri}?accountId=${accountId}`;

  console.log(`formattedRedirectUri: ${formattedRedirectUri}`);

  res.json({
    config: {
      consumerKey,
      redirectUri: formattedRedirectUri,
    },
  });
});

app.get("/api/catalysts", authMiddleware, async (req, res) => {
  const catalysts = await tradingService.getCatalysts();

  res.json({ catalysts });
});

app.post("/api/catalyst", authMiddleware, async (req, res) => {
  const { description } = req.body;

  try {
    const catalyst = await tradingService.createCatalyst(description);
    res.json({ catalyst });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.post("/api/setup", authMiddleware, async (req, res) => {
  const { description } = req.body;

  try {
    const setup = await tradingService.createSetup(description);
    res.json({ setup });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.get("/api/setups", authMiddleware, async (req, res) => {
  const setups = await tradingService.getSetups();

  res.json({ setups });
});

app.get("/api/tradeDirections", authMiddleware, async (req, res) => {
  const tradeDirections = await tradingService.getTradeDirections();

  res.json({ tradeDirections });
});

app.get(
  "/api/account/:accountId/balanceHistory",
  authMiddleware,
  async (req, res) => {
    // TODO: Add data validators
    const { accountId } = req.params;
    const { rowsPerPage, numPages, page, fromDate, toDate, allAccounts } =
      req.query;

    const options = {
      fromDate,
      toDate,
      allAccounts,
    };

    if (rowsPerPage && numPages) {
      // TODO: rowsPerPage && numPage must be >= 1
      const rowsPerPageNum = parseInt(rowsPerPage);

      if (page) {
        options.limit = rowsPerPageNum;
        options.offset = rowsPerPageNum * (parseInt(page) - 1);
      } else {
        options.limit = parseInt(rowsPerPage) * parseInt(numPages);
      }
    }

    let balanceHistory = [];

    if (allAccounts) {
      const account = await accountService.getAccount({ id: accountId });
      const accountIds = account.accountLinks.map(
        ({ linkedAccountId }) => linkedAccountId
      );
      accountIds.push(account.id);
      console.log(JSON.stringify(accountIds));
      balanceHistory = await tradingService.getAllAccountsBalanceHistory(
        accountIds,
        options
      );
      console.log(
        `all accounts balance history: ${JSON.stringify(balanceHistory)}`
      );
    } else {
      balanceHistory = await tradingService.getAccountBalanceHistory(
        accountId,
        options
      );
    }

    res.json({ balanceHistory });
  }
);

app.get(
  "/api/account/:accountId/tradeHistory",
  authMiddleware,
  async (req, res) => {
    const { accountId } = req.params;
    const {
      rowsPerPage,
      numPages,
      page,
      fromDate,
      toDate,
      profitsOnly,
      lossesOnly,
      timeRangeType,
      tradeDirectionType,
      securityType,
      securitySymbol,
      securityName,
      milestonesOnly,
      allAccounts,
    } = req.query;

    const options = {
      fromDate,
      toDate,
      allAccounts,
    };

    if (rowsPerPage && numPages) {
      // TODO: rowsPerPage && numPage must be >= 1
      const rowsPerPageNum = parseInt(rowsPerPage);

      if (page) {
        options.limit = rowsPerPageNum;
        options.offset = rowsPerPageNum * (parseInt(page) - 1);
      } else {
        options.limit = parseInt(rowsPerPage) * parseInt(numPages);
      }
    }

    if (profitsOnly && profitsOnly.toLowerCase() === "true") {
      options.isProfit = true;
    }

    if (lossesOnly && lossesOnly.toLowerCase() === "true") {
      options.isLoss = true; // TODO: add validation for profits OR losses, not both
    }

    if (timeRangeType) {
      options.timeRangeType = timeRangeType;
    }

    if (tradeDirectionType) {
      options.tradeDirectionType = tradeDirectionType;
    }

    if (securityType) {
      options.securityType = securityType;
    }

    if (securitySymbol) {
      options.securitySymbol = securitySymbol;
    }

    if (securityName) {
      options.securityName = securityName;
    }

    if (milestonesOnly && milestonesOnly.toLowerCase() === "true") {
      options.isMilestone = true;
    }

    const tradeHistory = await tradingService.getTradeHistory(
      accountId,
      options
    );
    // console.log(JSON.stringify(tradeHistory[0]));

    res.json({ tradeHistory });
  }
);

app.get(
  "/api/account/:accountId/improvementActions",
  authMiddleware,
  async (req, res) => {
    const { accountId } = req.params;
    const { rowsPerPage, numPages, page, fromDate, toDate, allAccounts } =
      req.query;

    const options = {
      fromDate,
      toDate,
      allAccounts,
    };

    if (rowsPerPage && numPages) {
      // TODO: rowsPerPage && numPage must be >= 1
      const rowsPerPageNum = parseInt(rowsPerPage);

      if (page) {
        options.limit = rowsPerPageNum;
        options.offset = rowsPerPageNum * (parseInt(page) - 1);
      } else {
        options.limit = parseInt(rowsPerPage) * parseInt(numPages);
      }
    }

    const improvementActions =
      await improvementActionsService.getImprovementActions(accountId, options);

    res.json({ improvementActions });
  }
);

app.get(
  "/api/account/:accountId/tradePlans",
  authMiddleware,
  async (req, res) => {
    const { accountId } = req.params;
    const { rowsPerPage, numPages, page, fromDate, toDate, allAccounts } =
      req.query;

    const options = {
      fromDate,
      toDate,
      allAccounts,
    };

    if (rowsPerPage && numPages) {
      // TODO: rowsPerPage && numPage must be >= 1
      const rowsPerPageNum = parseInt(rowsPerPage);

      if (page) {
        options.limit = rowsPerPageNum;
        options.offset = rowsPerPageNum * (parseInt(page) - 1);
      } else {
        options.limit = parseInt(rowsPerPage) * parseInt(numPages);
      }
    }

    const tradePlans = await tradingService.getTradePlans(accountId, options);

    res.json({ tradePlans });
  }
);

app.get(
  "/api/account/:accountId/tradeInsights",
  authMiddleware,
  async (req, res) => {
    const { accountId } = req.params;
    const { fromDate, toDate, allAccounts } = req.query;

    const options = {
      fromDate,
      toDate,
      allAccounts,
    };

    const accountIds = [accountId];

    if (allAccounts) {
      const account = await accountService.getAccount({ id: accountId });
      accountIds.concat(
        account.accountLinks.map(({ linkedAccountId }) => linkedAccountId)
      );
    }

    const insights = await insightsService.getInsights([accountId], options);

    res.json({ insights });
  }
);

// make the posts (data updates) accept JSON
app.post("/api/account/login", async (req, res) => {
  // authenticate
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Missing email or password");
    }

    const account = await accountService.authenticate(email, password);

    // sign jwt
    const accessToken = accountService.generateAccessToken({ id: account.id });

    // set jwt on cookie
    res.cookie("jwt", accessToken, {
      httpOnly: true, // http only, prevents JavaScript cookie access
      secure: true, // cookie must be sent over https / ssl
      sameSite: "none",
    });

    res.json({ ...account, accessToken });
  } catch (e) {
    // send login error
    res.json({ error: e.message });
  }
});

app.post("/api/account/logout", async (req, res) => {
  // clear jwt on cookie
  res.clearCookie("jwt");

  res.json({ loggedOut: true });
});

app.post(
  "/api/account/:accountId/tradeHistory",
  authMiddleware,
  async (req, res) => {
    const tradeUpdates = req.body;

    try {
      const results = await tradingService.updateTradeHistoryBulk(tradeUpdates);
      console.log("updates complete");
      console.log(JSON.stringify(results));
      res.json({ success: true });
    } catch (e) {
      res.json({ error: e });
    }
  }
);

app.post(
  "/api/account/:accountId/tradePlanLink",
  authMiddleware,
  async (req, res) => {
    const { tradeId, tradePlanId } = req.body;

    try {
      await tradingService.updateTradeHistoryBulk([
        { id: tradeId, tradePlanId },
      ]);
      await tradingService.updateTradePlansBulk([
        { id: tradePlanId, isTraded: true },
      ]);

      res.json({ success: true });
    } catch (e) {
      res.json({ error: e });
    }
  }
);

app.delete(
  "/api/account/:accountId/tradePlanLink/:tradeId",
  authMiddleware,
  async (req, res) => {
    const { accountId, tradeId } = req.params;

    try {
      const trade = await tradingService.getTradeHistory(accountId, {
        tradeId,
      });

      if (trade) {
        const { tradePlanId } = trade;
        await tradingService.updateTradePlansBulk([
          { id: tradePlanId, isTraded: false },
        ]);
        await tradingService.updateTradeHistoryBulk([
          { id: tradeId, tradePlanId: null },
        ]);
      } else {
        res.json({ error: "Trade not found" });
      }

      res.json({ success: true });
    } catch (e) {
      res.json({ error: e });
    }
  }
);

app.post(
  "/api/account/:accountId/improvementActions",
  authMiddleware,
  async (req, res) => {
    const { accountId } = req.params;

    // need to create or update
    const improvementActionCreatesOrUpdates = req.body;

    try {
      // partition payload into creates and updates
      const improvementActionsInfo = improvementActionCreatesOrUpdates.reduce(
        (acc, createOrUpdate) => {
          if (createOrUpdate.id) {
            acc.updates.push(createOrUpdate);
          } else {
            acc.creates.push(createOrUpdate);
          }

          return acc;
        },
        { creates: [], updates: [] }
      );

      if (improvementActionsInfo.creates.length) {
        await improvementActionsService.createImprovementActionsBulk(
          accountId,
          improvementActionsInfo.creates
        );
      }

      if (improvementActionsInfo.updates.length) {
        await improvementActionsService.updateImprovementActionsBulk(
          improvementActionsInfo.updates
        );
      }

      res.json({ success: true });
    } catch (e) {
      res.json({ error: e.message });
    }
  }
);

app.post(
  "/api/account/:accountId/tradePlans",
  authMiddleware,
  async (req, res) => {
    const { accountId } = req.params;

    // need to create or update
    const tradePlanCreatesOrUpdates = req.body;

    console.log("tradePlanCreatesOrUpdates");
    console.log(JSON.stringify(tradePlanCreatesOrUpdates));

    try {
      // partition payload into creates and updates
      const tradePlansInfo = tradePlanCreatesOrUpdates.reduce(
        (acc, createOrUpdate) => {
          if (createOrUpdate.securitySymbol) {
            createOrUpdate.securitySymbol =
              createOrUpdate.securitySymbol.toUpperCase();
          }
          if (createOrUpdate.id) {
            acc.updates.push(createOrUpdate);
          } else {
            acc.creates.push(createOrUpdate);
          }

          return acc;
        },
        { creates: [], updates: [] }
      );

      console.log("tradePlansInfo");
      console.log(JSON.stringify(tradePlansInfo));

      if (tradePlansInfo.creates.length) {
        await tradingService.createTradePlansBulk(
          accountId,
          tradePlansInfo.creates
        );
      }

      if (tradePlansInfo.updates.length) {
        await tradingService.updateTradePlansBulk(tradePlansInfo.updates);
      }

      res.json({ success: true });
    } catch (e) {
      res.json({ error: e.message });
    }
  }
);

app.post("/api/account/:accountId/uploadTradeHistory", async (req, res) => {
  const { accountId } = req.params;
  try {
    if (!req.files) {
      return res.send({
        success: false,
        message: "No file uploaded",
      });
    } else {
      let respData = {
        success: true,
      };
      if (req.files.csv) {
        console.log("file name");
        console.log(req.files.csv.name);
        // console.log(req.files.csv.data.toString("utf8"));
        const orders = tradingService.parseTDAOrdersFromCSV(req.files.csv);
        console.log(JSON.stringify(orders));
        const tradeInfo =
          tradingService.mapUploadedTradeHistoryToTradeInfo(orders);

        console.log(JSON.stringify(tradeInfo));
        const results = await tradingService.processUploadedTrades(
          accountId,
          tradeInfo
        );
        respData = { ...respData, ...results };
      }
      return res.json(respData);
    }
  } catch (e) {
    return res.json({ error: e.message });
  }
});

export default server;
