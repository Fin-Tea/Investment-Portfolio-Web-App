import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAuth from "../hooks/auth";
import Loader from "./loader";

export default function RouteGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(router.pathname === "/login");
  const { getCachedUser } = useAuth();

  useEffect(() => {
    const isAuthorized = !!getCachedUser() || router.pathname === "/login";
    if (!isAuthorized) {
      router.push("/login");
    } else {
    setAuthorized(isAuthorized);
    }
  }, [router.pathname]);

  return <div>{ authorized ? children : <Loader />}</div>;
}
