const fetch = require("node-fetch");
const db = require("../db");
const config = require("../config");

const AUTH_ENDPOINT = `${config.tda.baseUrl}oauth2/token`;
const ORDERS_ENDPOINT = `${config.tda.baseUrl}orders`;
const ACCOUNT_ENDPOINT = `${config.tda.baseUrl}accounts/`;
const PRICE_HISTORY_ENDPOINT = `${config.tda.baseUrl}marketdata/{symbol}/pricehistory`;

function createPostBody(params) {
  let postBody = "";

  for (let key in params) {
    postBody += `${key}=${encodeURIComponent(params[key])}&`;
  }
  if (postBody.length) {
    return postBody.substring(0, postBody.length - 1);
  }

  return postBody;
}

async function callApi(
  url,
  method = "GET",
  token,
  refreshToken,
  refreshTokenExpiresAt
) {
  try {
    console.log(url);
    const resp = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = (await resp.json()) || {};

    // handle refresh token error
    if (json.error) {
      if (
        json.error ===
        "The access token being passed has expired or is invalid."
      ) {
        console.log("Generating refresh token");
        const expirationDate = new Date(refreshTokenExpiresAt);
        const now = new Date();
        const daysUntilExpiration =
          (expirationDate - now) / (24 * 60 * 60 * 1000);

        const params = {
          grant_type: "refresh_token",
          client_id: config.tda.consumerKey,
          refresh_token: refreshToken,
        };

        console.log("Refresh token params");
        console.log(JSON.stringify(params));

        if (daysUntilExpiration <= config.tda.daysUntilRefresh) {
          // generate a new refreshToken and authToken
          params.access_type = "offline";
        }

        const body = createPostBody(params);

        const tokenResp = await fetch(AUTH_ENDPOINT, {
          method: "POST",
          body,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const tokenRespJson = await tokenResp.json();

        console.log(JSON.stringify(tokenRespJson));

        if (tokenRespJson && tokenRespJson.error) {
          throw new Error(`Error refreshing token: ${tokenRespJson.error}`);
        }

        const { access_token, refresh_token, refresh_token_expires_in } =
          tokenRespJson;

        // update the db with new token info
        const updateParams = {
          tdaAccessToken: access_token,
          updatedAt: new Date(),
        };

        if (refresh_token && refresh_token_expires_in) {
          updateParams.tdaRefreshToken = refresh_token;
          const expiresAt = new Date(
            Date.now() + refresh_token_expires_in * 1000
          );
          updateParams.tdaRefreshTokenExpiresAt = expiresAt;
        }

        await db("account")
          .update(updateParams)
          .where({ tdaAccessToken: token, tdaRefreshToken: refreshToken });

        const retryResp = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${access_token}` },
        });

        return retryResp.json();
      } else {
        throw Error(json.error);
      }
    }
    return json;
  } catch (e) {
    console.log(e);
    return { error: e.message };
  }
}

async function fetchOrders(accountId, params, tokenInfo) {
  const { accessToken, refreshToken, refreshTokenExpiresAt } = tokenInfo;
  let urlParams = `?accountId=${accountId}`;

  if (params.maxResults) {
    urlParams += `&maxResults=${params.maxResults}`;
  }

  if (params.fromEnteredTime && params.toEnteredTime) {
    urlParams += `&fromEnteredTime=${params.fromEnteredTime}`;
    urlParams += `&toEnteredTime=${params.toEnteredTime}`;
  }

  if (params.status) {
    urlParams += `&status=${params.status}`;
  }

  const url = `${ORDERS_ENDPOINT}${urlParams}`;

  return callApi(url, "GET", accessToken, refreshToken, refreshTokenExpiresAt);
}

async function fetchAccountBalance(accountId, params, tokenInfo) {
  const { accessToken, refreshToken, refreshTokenExpiresAt } = tokenInfo;

  let urlParams = "";

  if (params.fields) {
    urlParams = `?fields=${params.fields}`;
  }

  const url = `${ACCOUNT_ENDPOINT}${accountId}${urlParams}`;

  return callApi(url, "GET", accessToken, refreshToken, refreshTokenExpiresAt);
}

function dateToEpoch(date) {
  return new Date(date).getTime();
}

async function fetchPriceHistory(symbol, params, tokenInfo) {
  const { accessToken, refreshToken, refreshTokenExpiresAt } = tokenInfo;

  let urlParams = "";

  if (params.startDate && params.endDate) {
    urlParams = `?startDate=${dateToEpoch(
      params.startDate
    )}&endDate=${dateToEpoch(params.endDate)}`;
  }

  if (params.frequencyType) {
    urlParams += `&frequencyType=${params.frequencyType}`;

    if (params.frequency) {
      urlParams += `&frequency=${params.frequency}`;
    }
  }

  if (params.needExtendedHoursData) {
    urlParams += `&needExtendedHoursData=${params.needExtendedHoursData}`;
  }

  // console.log(urlParams);

  const url = `${PRICE_HISTORY_ENDPOINT.replace(
    "{symbol}",
    symbol
  )}${urlParams}`;

  return callApi(url, "GET", accessToken, refreshToken, refreshTokenExpiresAt);
}

async function fetchToken(params = {}) {
  const tokenParams = {
    grant_type: "authorization_code" || params.grantType,
    code: params.code,
    client_id: config.tda.consumerKey,
    redirect_uri: `${config.tda.redirectUri}${
      params.accountId ? `?accountId=${params.accountId}` : ""
    }`,
    access_type: params.accessType,
  };

  console.log("tokenParams");
  console.log(JSON.stringify(tokenParams));

  const body = createPostBody(tokenParams);

  console.log("post body");
  console.log(body);

  const resp = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return resp.json();
}

module.exports = {
  fetchToken,
  fetchOrders,
  fetchAccountBalance,
  fetchPriceHistory,
};
