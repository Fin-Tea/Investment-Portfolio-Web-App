import RouteGuard from "../components/route-guard";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

function MyApp({ Component, pageProps }) {
  return (
    <RouteGuard>
      <Component {...pageProps} />
    </RouteGuard>
  );
}

export default MyApp;
