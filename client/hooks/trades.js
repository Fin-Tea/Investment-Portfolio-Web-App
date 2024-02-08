import useData from "./data";
import { appendQueryParam } from "../data-utils";

const ACCOUNT_BALANCE_HISTORY_ENDPOINT = "balanceHistory";
const TRADE_HISTORY_ENDPOINT = "tradeHistory";
const CATALYSTS_ENDPOINT = "catalysts";
const CREATE_CATALYST_ENDPOINT = "catalyst";
const SETUPS_ENDPOINT = "setups";
const CREATE_SETUP_ENDPOINT = "setup";
const TRADE_DIRECTIONS_ENDPOINT = "tradeDirections";
const TRADE_PLANS_ENDPOINT = "tradePlans";
const TRADE_LINK_ENDPOINT = "tradePlanLink";
const UPLOAD_TRADE_HISTORY_ENDPOINT = "uploadTradeHistory";
const IMPORT_LOGS_ENDPOINT = "importLogs";

export default function useTrades() {
  const { fetchUserData, fetchLookupData } = useData();

  function fetchAccountBalanceHistory() {
    // TODO: Accept input for time ranges – default to past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return fetchUserData(
      `${ACCOUNT_BALANCE_HISTORY_ENDPOINT}?fromDate=${thirtyDaysAgo.toISOString()}`
    );
  }

  function fetchTradeHistory(queryParams) {
    let url = TRADE_HISTORY_ENDPOINT;

    Object.entries(queryParams).forEach(([k, v]) => {
      url = appendQueryParam(url, k, v);
    });

    return fetchUserData(TRADE_HISTORY_ENDPOINT);
  }

  function updateTradeHistory(updatedTrades) {
    return fetchUserData(TRADE_HISTORY_ENDPOINT, "POST", updatedTrades);
  }

  function fetchCatalysts() {
    return fetchLookupData(CATALYSTS_ENDPOINT);
  }

  function createCatalyst(description) {
    return fetchLookupData(CREATE_CATALYST_ENDPOINT, "POST", { description });
  }

  function fetchSetups() {
    return fetchLookupData(SETUPS_ENDPOINT);
  }

  function createSetup(description) {
    return fetchLookupData(CREATE_SETUP_ENDPOINT, "POST", { description });
  }

  function fetchSetups() {
    return fetchLookupData(SETUPS_ENDPOINT);
  }

  function fetchTradeDirections() {
    return fetchLookupData(TRADE_DIRECTIONS_ENDPOINT);
  }

  function fetchTradePlans() {
    // TODO: Accept input for time ranges
    return fetchUserData(TRADE_PLANS_ENDPOINT);
  }

  function updateTradePlans(updatedTradePlans) {
    return fetchUserData(TRADE_PLANS_ENDPOINT, "POST", updatedTradePlans);
  }

  function linkTradePlan(linkInfo) {
    return fetchUserData(TRADE_LINK_ENDPOINT, "POST", linkInfo);
  }

  function unlinkTradePlan(linkInfo) {
    return fetchUserData(
      `${TRADE_LINK_ENDPOINT}/${linkInfo.tradeId}`,
      "DELETE"
    );
  }

  function uploadTradeHistoryCSV(formData) {
    return fetchUserData(UPLOAD_TRADE_HISTORY_ENDPOINT, "POST", formData, {
      contentType: "multipart/form-data",
    });
  }

  function fetchImportLogs() {
    return fetchUserData(IMPORT_LOGS_ENDPOINT);
  }

  return {
    fetchCatalysts,
    fetchSetups,
    fetchTradeDirections,
    fetchAccountBalanceHistory,
    fetchTradeHistory,
    updateTradeHistory,
    fetchTradePlans,
    updateTradePlans,
    createCatalyst,
    createSetup,
    linkTradePlan,
    unlinkTradePlan,
    uploadTradeHistoryCSV,
    fetchImportLogs
  };
}
