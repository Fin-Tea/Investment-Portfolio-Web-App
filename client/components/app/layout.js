import { useRouter } from "next/router";
import Head from "next/head";
import AccountMenu from "./account-menu";
import LayoutLink from "./layout-link";

const ROUTES = {
  JOURNAL: "/t/trading-journal",
  TRADES: "/t/trades",
  INSIGHTS: "/t/performance-insights",
};

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Fin Tea</title>
        <link rel="icon" href="/favicon.ico?v=2" />
        <meta
          name="description"
          content="Easy Trading Journaling &amp; Performance Insights"
        />
        <meta name="og:title" content="Fin.Tea" />
      </Head>
      <header className="h-12 bg-purple-800 flex justify-between items-center">
        <div className="flex items-center ml-4">
        <img style={{filter: "invert(100%)"}} src="/images/tea.svg" width={32}  />
        <h1 className="pt-2 ml-2 text-lg text-white">Fin Tea</h1>
        </div>
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
      <footer className="bg-purple-800 text-white p-2 px-3 pt-3">
      <p className="text-sm font-bold">Plan your trades. Trade your plans. Evolve.</p>
      <p className="text-sm">Disclaimer: The information provided on this platform/website/application is for informational purposes only and should not be considered as financial advice</p>
        <p className="text-sm text-center">Copyright © 2024 Fin Tea Financial Services</p>
      </footer>
    </div>
  );
}
