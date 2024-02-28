import Script from "next/script";
import RouteGuard from "../components/route-guard";
import { ChakraProvider } from "@chakra-ui/react";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
//import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      {process.env.NODE_ENV === "production" && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM}');</script>
<!-- End Google Tag Manager -->
      `}
        </Script>
      )}
      <RouteGuard>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </RouteGuard>
    </div>
  );
}

export default MyApp;
