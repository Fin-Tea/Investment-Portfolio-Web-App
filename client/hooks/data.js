import useAuth, { ERROR_NOT_LOGGED_IN } from "./auth";
import useApi from "./api";
import { appendQueryParam } from "../data-utils";

export default function useData(port) {
  const { getCachedUser } = useAuth();
  const { makeApiCall } = useApi(port);

  function fetchUserData(endpoint, type, data, options) {
    const user = getCachedUser();
    if (user) {
      let accountId = user.selectedAccountId;
      let decoratedEndpoint = endpoint;

      if (user.selectedAccountId === "all") {
        accountId = user.id;
        if (type === "POST") {
          data?.allAccounts = true;
        } else {
          decoratedEndpoint = appendQueryParam(endpoint, "allAccounts", "true");
        }
      }

      return makeApiCall(
        `account/${accountId}/${decoratedEndpoint}`,
        type,
        data,
        options
      );
    }
    return Promise.resolve({ error: ERROR_NOT_LOGGED_IN });
  }

  function fetchLookupData(endpoint, type, data) {
    const user = getCachedUser();
    if (user) {
      return makeApiCall(endpoint, type, data);
    }
    return Promise.resolve({ error: ERROR_NOT_LOGGED_IN });
  }

  return {
    fetchUserData,
    fetchLookupData,
  };
}
