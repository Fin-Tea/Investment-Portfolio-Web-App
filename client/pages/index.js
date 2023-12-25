import { useEffect, useReducer } from "react";
import Layout from "../components/layout-new";
import Section from "../components/section";
import LineChart from "../components/line-chart";
import Insights from "../components/insights";
import TradeHistory from "../components/trade-history";
import ImprovementActions from "../components/improvement-actions";
import Loader from "../components/loader";
import useAuth from "../hooks/auth";
import useTrades from "../hooks/trades";
import useImprovementActions from "../hooks/improvement-actions";
import createNewImprovementAction from "../improvement-action-utils";
import useInsights from "../hooks/insights";
import TradePlanner from "../components/trade-planner";
import createNewTradePlan from "../trade-plan-utils";
import TDALoginLink from "../components/tda-login-link";
import useConfig from "../hooks/config";
import AccountSelect from "../components/account-select";

const SET_LOADING = "SET_LOADING";
const HYDRATE = "HYDRATE";
const SET_CATALYSTS = "SET_CATALYSTS";
const ADD_CATALYST = "ADD_CATALYST";
const SET_SETUPS = "SET_SETUPS";
const ADD_SETUP = "ADD_SETUP";
const SET_BALANCE_HISTORY = "SET_BALANCE_HISTORY";
const SET_TRADE_PLANS = "SET_TRADE_PLANS";
const SET_TRADE_HISTORY = "SET_TRADE_HISTORY";
const SET_IMPROVEMENT_ACTIONS = "SET_IMPROVEMENT_ACTIONS";
const SET_INSIGHTS = "SET_INSIGHTS";
const SET_SAVE_ERROR_TRADE_HISTORY = "SET_SAVE_ERROR_TRADE_HISTORY";
const SET_SAVE_ERROR_IMPROVEMENT_ACTIONS = "SET_SAVE_ERROR_IMPROVEMENT_ACTIONS";
const SET_SAVE_ERROR_TRADE_PLANS = "SET_SAVE_ERROR_TRADE_PLANS";
const SET_SAVE_ERROR_LINK_TRADE_PLAN = "SET_SAVE_ERROR_LINK_TRADE_PLAN";

const initialState = {
  config: {},
  catalysts: [],
  setups: [],
  balanceHistory: [],
  tradePlans: [],
  tradeHistory: [],
  improvementActions: [],
  insights: [],
  saveErrorTradePlans: "",
  saveErrorTradeHistory: "",
  saveErrorImprovementActions: "",
  loading: true,
  loadingError: "",
};

function dataReducer(state = {}, action) {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload.loading };
    case HYDRATE:
      return action.payload;
    case SET_CATALYSTS:
      return { ...state, catalysts: action.payload.catalysts };
    case ADD_CATALYST:
      return {
        ...state,
        catalysts: [...state.catalysts, action.payload.catalyst],
      };
    case SET_SETUPS:
      return { ...state, setups: action.payload.setups };
    case ADD_SETUP:
      return { ...state, setups: [...state.setups, action.payload.setup] };
    case SET_BALANCE_HISTORY:
      return { ...state, balanceHistory: action.payload.balanceHistory };
    case SET_TRADE_HISTORY:
      return { ...state, tradeHistory: action.payload.tradeHistory };
    case SET_IMPROVEMENT_ACTIONS:
      return {
        ...state,
        improvementActions: action.payload.improvementActions,
      };
    case SET_INSIGHTS:
      return { ...state, insights: action.payload.insights };
    case SET_SAVE_ERROR_TRADE_HISTORY:
      return { ...state, saveErrorTradeHistory: action.payload.error };
    case SET_SAVE_ERROR_IMPROVEMENT_ACTIONS:
      return { ...state, saveErrorImprovementActions: action.payload.error };
    case SET_SAVE_ERROR_TRADE_PLANS:
      return { ...state, saveErrorTradePlans: action.payload.error };
    case SET_SAVE_ERROR_LINK_TRADE_PLAN:
      return {
        ...state,
        saveErrorTradeHistory: action.payload.error,
        saveErrorTradePlans: action.payload.error,
      };
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  // TODO: Think about call api endpoints in getServerSideProps
  const { user, updateCachedUser } = useAuth();
  console.log("user", JSON.stringify(user));
  const readOnly = user?.selectedAccountId === "all";
  const { fetchConfig } = useConfig();
  const {
    fetchCatalysts,
    fetchSetups,
    fetchTradeDirections,
    fetchAccountBalanceHistory,
    fetchTradePlans,
    updateTradePlans,
    fetchTradeHistory,
    updateTradeHistory,
    createCatalyst,
    createSetup,
    linkTradePlan,
    unlinkTradePlan,
    uploadTradeHistoryCSV,
  } = useTrades();
  const { fetchImprovementActions, updateImprovementActions } =
    useImprovementActions();
  const { fetchInsights } = useInsights();

  async function loadData() {
    const data = { ...initialState };
    const configResp = await fetchConfig();
    const catalystsResp = await fetchCatalysts();
    const setupsResp = await fetchSetups();
    const tradeDirectionsResp = await fetchTradeDirections();
    const accountBalanceHistoryResp = await fetchAccountBalanceHistory();
    const tradePlansResp = await fetchTradePlans();
    const tradeHistoryResp = await fetchTradeHistory();
    const improvementActionsResp = await fetchImprovementActions();
    const insightsResp = await fetchInsights();

    data.loading = false;

    if (configResp.config) {
      data.config = configResp.config;
    }

    if (!catalystsResp.error) {
      data.catalysts = catalystsResp.catalysts.map(({ id, description }) => ({
        value: id,
        label: description,
      }));
    } else {
      data.loadingError = catalystsResp.error; // TODO: handle error for each section of data
    }

    if (!setupsResp.error) {
      data.setups = setupsResp.setups.map(({ id, description }) => ({
        value: id,
        label: description,
      }));
    } else {
      data.loadingError = setupsResp.error;
    }

    if (!tradeDirectionsResp.error) {
      data.tradeDirections = tradeDirectionsResp.tradeDirections.map(
        ({ id, description }) => ({
          value: id,
          label: description,
        })
      );
    } else {
      data.loadingError = tradeDirectionsResp.error;
    }

    if (!accountBalanceHistoryResp.error) {
      data.balanceHistory = accountBalanceHistoryResp.balanceHistory.map(
        (info) => ({
          x: new Date(info.balanceDate),
          y: parseFloat(info.balance),
        })
      );
    } else {
      data.loadingError = accountBalanceHistoryResp.error;
    }

    if (!tradeHistoryResp.error) {
      data.tradeHistory = tradeHistoryResp.tradeHistory;
    } else {
      data.loadingError = tradeHistoryResp.error;
    }

    if (!tradePlansResp.error) {
      if (tradePlansResp.tradePlans.length) {
        data.tradePlans = tradePlansResp.tradePlans;
      } else {
        // create new trade plan row
        data.tradePlans = [createNewTradePlan(1)];
      }
    } else {
      data.loadingError = improvementActionsResp.error;
    }

    if (!improvementActionsResp.error) {
      if (improvementActionsResp.improvementActions.length) {
        data.improvementActions = improvementActionsResp.improvementActions;
      } else {
        // create new improvement actions row
        data.improvementActions = [createNewImprovementAction(1)];
      }
    } else {
      data.loadingError = improvementActionsResp.error;
    }

    if (!insightsResp.error) {
      data.insights = insightsResp.insights;
    } else {
      data.loadingError = insightsResp.error;
    }

    dispatch({ type: HYDRATE, payload: data });
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateCatalyst(description) {
    const catalystResp = await createCatalyst(description);

    if (!catalystResp.error) {
      const {
        catalyst: { id, description },
      } = catalystResp;
      dispatch({
        type: ADD_CATALYST,
        payload: { catalyst: { value: id, label: description } },
      });
    }
  }

  async function handleCreateSetup(description) {
    const setupResp = await createSetup(description);

    if (!setupResp.error) {
      const {
        setup: { id, description },
      } = setupResp;
      dispatch({
        type: ADD_SETUP,
        payload: { setup: { value: id, label: description } },
      });
    }
  }

  async function handleSaveTradeHistory(updatedTrades) {
    if (updatedTrades.length) {
      // map tradeHistory to updates
      const formattedTrades = updatedTrades.map((trade) => {
        const { id, catalystId, setupId, notes, risk, reward, tradePlanId } =
          trade;
        return { id, catalystId, setupId, notes, risk, reward, tradePlanId };
      });

      const { error } = await updateTradeHistory(formattedTrades);

      if (error) {
        dispatch({
          type: SET_SAVE_ERROR_TRADE_HISTORY,
          payload: { error },
        });
      } else {
        // refetch trades
        const tradeHistoryResp = await fetchTradeHistory();

        if (!tradeHistoryResp.error) {
          const { tradeHistory } = tradeHistoryResp;
          dispatch({
            type: SET_TRADE_HISTORY,
            payload: { tradeHistory },
          });
        }
      }
    }
  }

  async function handleUploadTradeHistory(csvFileObject) {
    console.log("uploading csv");
    const resp = await uploadTradeHistoryCSV(csvFileObject);
    console.log("csvUpload response", resp);
    // if successful, refetch tradeHistory data and populate store
  }

  async function handleSaveImprovementActions(newOrUpdatedActions) {
    if (newOrUpdatedActions.length) {
      const { error } = await updateImprovementActions(newOrUpdatedActions);

      if (error) {
        dispatch({
          type: SET_SAVE_ERROR_IMPROVEMENT_ACTIONS,
          payload: { error },
        });
      } else {
        // refetch the actions after saving so the ids are populated for editing
        const improvementActionsResp = await fetchImprovementActions();

        if (!improvementActionsResp.error) {
          const { improvementActions } = improvementActionsResp;
          dispatch({
            type: SET_IMPROVEMENT_ACTIONS,
            payload: { improvementActions },
          });
        }
      }
    }
  }

  async function handleSaveTradePlans(newOrUpdatedPlans) {
    console.log("newOrUpdatedPlans", newOrUpdatedPlans);
    if (newOrUpdatedPlans.length) {
      const { error } = await updateTradePlans(newOrUpdatedPlans);

      if (error) {
        dispatch({
          type: SET_SAVE_ERROR_TRADE_PLANS,
          payload: { error },
        });
      } else {
        // refetch the actions after saving so the ids are populated for editing
        const tradePlansResp = await fetchTradePlans();

        if (!tradePlansResp.error) {
          const { tradePlans } = tradePlansResp;
          dispatch({
            type: SET_TRADE_PLANS,
            payload: { tradePlans },
          });
        }
      }
    }
  }

  async function handleTradePlanLinkToggle({ tradeId, tradePlanId }) {
    let resp;

    if (tradePlanId) {
      resp = await linkTradePlan({ tradeId, tradePlanId });
    } else {
      resp = await unlinkTradePlan({ tradeId });
    }
    const { error } = resp;

    if (error) {
      dispatch({
        type: SET_SAVE_ERROR_LINK_TRADE_PLAN,
        payload: { error },
      });
    }
  }

  function handleAccountChange({ value }) {
    dispatch({ type: SET_LOADING, payload: { loading: true } });
    updateCachedUser({ selectedAccountId: value });
    loadData();
  }

  return (
    <Layout>
      {state.loading || state.loadingError ? (
        <Loader />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              marginBottom: 7,
            }}
          >
            <AccountSelect onChange={handleAccountChange} />
            <TDALoginLink
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
              redirectUri={state.config.redirectUri}
              consumerKey={state.config.consumerKey}
            />
          </div>
          <Section>
            <LineChart title="Account Balance" data={state.balanceHistory} />
          </Section>

          {!readOnly && (
            <Section>
              <TradePlanner
                catalysts={state.catalysts}
                onCreateCatalyst={handleCreateCatalyst}
                tradeDirections={state.tradeDirections}
                plans={state.tradePlans}
                onSave={handleSaveTradePlans}
                saveError={state.saveErrorTradePlans}
              />
            </Section>
          )}

          {!readOnly && (
            <Section>
              <TradeHistory
                catalysts={state.catalysts}
                setups={state.setups}
                trades={state.tradeHistory}
                onCreateCatalyst={handleCreateCatalyst}
                onCreateSetup={handleCreateSetup}
                onSave={handleSaveTradeHistory}
                saveError={state.saveErrorTradeHistory}
                tradePlans={state.tradePlans}
                onTradePlanLinkToggle={handleTradePlanLinkToggle}
                onUpload={handleUploadTradeHistory}
              />
            </Section>
          )}

          {!readOnly && (
            <Section>
              <ImprovementActions
                actions={state.improvementActions}
                onSave={handleSaveImprovementActions}
                saveError={state.saveErrorImprovementActions}
              />
            </Section>
          )}

          <Section>
            <Insights insightsData={state.insights} />
          </Section>
        </>
      )}
    </Layout>
  );
}
