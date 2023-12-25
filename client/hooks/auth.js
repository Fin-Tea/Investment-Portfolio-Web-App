import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useApi, { STORAGE_KEY } from "./api";

export const ERROR_NOT_LOGGED_IN = "Not logged in";

export default function useAuth() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { makeApiCall } = useApi();

  async function login({ email, password }) {
    // TODO: maybe refactor this. wanted to make props make sense but it's not DRY

    const resp = await makeApiCall("account/login", "POST", {
      email,
      password,
    });

    const {
      error: apiError,
      id,
      firstName,
      lastName,
      accountName,
      accountLinks,
    } = resp;

    if (apiError) {
      console.log(apiError);
      setError(apiError);
    } else {
      setCachedUser({
        id,
        firstName,
        lastName,
        accountName,
        accountLinks,
        selectedAccountId: id,
      });
      router.push("/");
    }
  }

  async function logout() {
    // TODO: keep a log of logins and logouts
    await makeApiCall("account/logout", "POST");
    setCachedUser(null);
    router.push("/login");
  }

  function getCachedUser() {
    // keep code lightweight with localstorage
    const userStr = window.localStorage.getItem(STORAGE_KEY);

    if (userStr) {
      return JSON.parse(userStr);
    }

    return null;
  }

  function setCachedUser(userInfo) {
    // TODO: clear userInfo on logout
    console.log("userInfo", userInfo);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
  }

  function updateCachedUser(userInfo) {
    const cachedUser = getCachedUser();

    if (cachedUser) {
      const updatedUser = { ...cachedUser, ...userInfo };
      setCachedUser(updatedUser);
    }
  }

  useEffect(() => {
    setUser(getCachedUser());
  }, []);

  // need to set accountInfo in-memory at app/layout level so i have the id for api calls
  return {
    error,
    login,
    logout,
    user,
    getCachedUser,
    updateCachedUser,
  };
}
