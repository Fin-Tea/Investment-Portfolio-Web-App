import useData from "./data";

const CONFIG_ENDPOINT = "config";

export default function useConfig() {
  const { fetchUserData } = useData();

  function fetchConfig() {
    return fetchUserData(CONFIG_ENDPOINT);
  }

  return {
    fetchConfig,
  };
}
