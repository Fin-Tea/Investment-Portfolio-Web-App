import RouteGuard from "../components/route-guard";
import { ChakraProvider } from '@chakra-ui/react'
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
//import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";


function MyApp({ Component, pageProps }) {
  return (
    <RouteGuard>
      <ChakraProvider>
      <Component {...pageProps} />
      </ChakraProvider>
    </RouteGuard>
  );
}

export default MyApp;
