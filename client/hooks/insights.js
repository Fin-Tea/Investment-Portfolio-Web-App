import useData from "./data";

const INSIGHTS_ENDPOINT = "tradeInsights";

export default function useInsights() {
  const { fetchUserData } = useData();

  function fetchInsights() {
    // TODO: Accept input for time ranges
    return fetchUserData(INSIGHTS_ENDPOINT);
  }

  return {
    fetchInsights,
  };
}
