import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAuth from "../hooks/auth";
import Loader from "./loader";

const AUTHORIZED_ROUTES = ["/login", "/magicLogin"];

export default function RouteGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(AUTHORIZED_ROUTES.includes(router.pathname));
  const { getCachedUser } = useAuth();

  useEffect(() => {
    const isAuthorized = !!getCachedUser() || AUTHORIZED_ROUTES.includes(router.pathname);
    if (!isAuthorized) {
      router.push("/login");
    } else {
    setAuthorized(isAuthorized);
    }
  }, [router.pathname]);

  return <div>{ authorized ? children : <Loader />}</div>;
}
