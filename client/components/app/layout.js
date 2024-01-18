import { useRouter } from "next/router";
import Head from "next/head";
import AccountMenu from "./account-menu";
import LayoutLink from "./layout-link";

const ROUTES = {
  JOURNAL: "/app/trading-journal",
  TRADES: "/app/trades",
  INSIGHTS: "/app/performance-insights",
};

export default function Layout({ children }) {
  const router = useRouter();

  const route = router.pathname;

  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Easy Trading Journaling &amp; Performance Insights"
        />
        <meta name="og:title" content="Fin.Tea" />
      </Head>
      <header className="h-12 bg-purple-800 flex justify-between items-center">
        <h1 className="pt-2 ml-4 text-lg text-white">Fin Tea</h1>
        <LayoutLink href={ROUTES.JOURNAL}>
            Trading Journal
        </LayoutLink>
        <LayoutLink href={ROUTES.TRADES}>
            Trades
        </LayoutLink>
        <LayoutLink href={ROUTES.INSIGHTS}>
        Performance Insights
        </LayoutLink>
        <div className="mr-4">
          <AccountMenu />
        </div>
      </header>
      <main className="bg-zinc-100 h-screen">{children}</main>
    </div>
  );
}
