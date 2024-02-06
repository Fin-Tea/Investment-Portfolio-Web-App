import useData from "./data";

const PLATFORM_ACCOUNT_ENDPOINT = "platformAccount";
const PLATFORM_ACCOUNTS_ENDPOINT = "platformAccounts";
const PLATFORMS_ENDPOINT = "platforms";

export default function usePlatformAccounts() {
  const { fetchUserData, fetchLookupData } = useData();

  function fetchPlatforms() {
    return fetchLookupData(PLATFORMS_ENDPOINT);
  }

  function fetchPlatformAccounts() {
    return fetchUserData(PLATFORM_ACCOUNTS_ENDPOINT);
  }

  function createPlatformAccount(platformAccount) {
    return fetchUserData(`${PLATFORM_ACCOUNT_ENDPOINT}`, "POST", platformAccount);
  }

  function deletePlatformAccount(id) {
    return fetchUserData(`${PLATFORM_ACCOUNT_ENDPOINT}/${id}`, "DELETE");
  }

  return {
    fetchPlatforms,
    fetchPlatformAccounts,
    createPlatformAccount,
    deletePlatformAccount
  };
}
