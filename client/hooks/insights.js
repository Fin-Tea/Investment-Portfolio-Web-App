import useData from "./data";
import { appendQueryParam } from "../data-utils";

const INSIGHTS_ENDPOINT = "tradeInsights";
const PLATFORM_INSIGHTS_ENDPOINT = "platformAccountInsights";

export default function useInsights() {
  const { fetchUserData } = useData();

  function fetchInsights() {
    // TODO: Accept input for time ranges
    return fetchUserData(INSIGHTS_ENDPOINT);
  }

  function fetchPlatformInsights(queryParams) {
    let url = PLATFORM_INSIGHTS_ENDPOINT;

    Object.entries(queryParams).forEach(([k, v]) => {
      url = appendQueryParam(url, k, v);
    });
    return fetchUserData(url);
  }

  return {
    fetchInsights,
    fetchPlatformInsights
  };
}
