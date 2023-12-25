import useData from "./data";

const IMPROVEMENT_ACTIONS_ENDPOINT = "improvementActions";

export default function useImprovementActions() {
  const { fetchUserData } = useData();

  function fetchImprovementActions() {
    // TODO: Accept input for time ranges
    return fetchUserData(IMPROVEMENT_ACTIONS_ENDPOINT);
  }

  function updateImprovementActions(updatedTrades) {
    return fetchUserData(IMPROVEMENT_ACTIONS_ENDPOINT, "POST", updatedTrades);
  }

  return {
    fetchImprovementActions,
    updateImprovementActions,
  };
}
