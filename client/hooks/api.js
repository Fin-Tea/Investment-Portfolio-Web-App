import { useRouter } from "next/router";

export const STORAGE_KEY = "FinTea";

function getHost(port = 8080) {
  return `${process.env.NEXT_PUBLIC_API_HOST}:${port}/api/`;
}

export default function useApi(port) {
  const router = useRouter();

  async function makeApiCall(endpoint, method = "GET", data, options = {}) {
    const url = ` ${getHost(port)}${endpoint}`;
    const headers =
      (method === "POST" || method === "PUT" || method === "DELETE") && options.contentType !== "multipart/form-data"
        ? { "Content-Type": options.contentType || "application/json" }
        : undefined;
    let body = data;

    if (
      data &&
      !(options.contentType && options.contentType === "multipart/form-data")
    ) {
      body = JSON.stringify(data);
    }

    console.log("method", method);
    console.log("headers", headers);

    try {
      const resp = await fetch(url, {
        method,
        credentials: "include",
        headers,
        body,
      });

      if (!resp.ok) {
        if (resp.status === 401 || resp.status === 403) {
          // redirect to /login
          localStorage.removeItem(STORAGE_KEY);
          router.push("/login");
          return {
            error: "Unauthorized",
            code: resp.status,
          };
        } else {
          // return error as json
          return {
            error: resp.statusText,
            code: resp.status,
          };
        }
      }
      return resp.json();
    } catch (e) {
      // return error as json
      return {
        error: e.message || e,
      };
    }
  }

  return {
    makeApiCall,
  };
}
