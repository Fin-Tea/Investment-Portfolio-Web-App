import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useApi, { STORAGE_KEY } from "./api";

export const ERROR_NOT_LOGGED_IN = "Not logged in";

export default function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { makeApiCall } = useApi();

  async function login({ email, password }) {
    // TODO: maybe refactor this. wanted to make props make sense but it's not DRY
    setLoading(true);

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
      setLoading(false);
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

  async function requestMagicLink({ email }) {
    setLoading(true);

    const resp = await makeApiCall("account/magicLink", "POST", {
      email,
    });

    const {
      error: apiError,
      emailSent
    } = resp;

    if (apiError) {
      console.log(apiError);
      setError(apiError);
     
    } else {
      setMagicLinkSent(emailSent);
    }
    setLoading(false);
  }
  
    async function magicLogin(token) {
      setLoading(true);
      const resp = await makeApiCall("account/magicLogin", "POST", {
        token
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
        setLoading(false);
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
    setLoading(true);
    // TODO: keep a log of logins and logouts
    await makeApiCall("account/logout", "POST");
    setCachedUser(null);
    setLoading(false);
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
    if (router.isReady && !router.query.token) {
      setLoading(false);
    }
  }, [router.isReady]);

  // need to set accountInfo in-memory at app/layout level so i have the id for api calls
  return {
    loading,
    error,
    login,
    requestMagicLink,
    magicLinkSent,
    magicLogin,
    logout,
    user,
    getCachedUser,
    updateCachedUser,
  };
}
