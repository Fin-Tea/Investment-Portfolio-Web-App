import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "../hooks/auth";

export default function RouteGuard({ children }) {
  const router = useRouter();
  const { getCachedUser } = useAuth();

  useEffect(() => {
    if (router.pathname !== "/login" && !getCachedUser()) {
      router.push("/login");
    }
  }, []);

  return <div>{children}</div>;
}
