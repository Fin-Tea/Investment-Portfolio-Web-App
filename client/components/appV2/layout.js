import { useRouter } from "next/router";
import Head from "next/head";
import AccountMenu from "./account-menu";
import LayoutLink from "./layout-link";

const ROUTES = {
  EVENTS: "/p/events", // social learning (make it fun!)
  PORTFOLIO: "/p/investing-portfolio", // easy portfolio allocation & management
  INSIGHTS: "/p/performance-insights", // how is your portfolio doing relative to bench marks, risk management, and allocation decisions
  REWARDS: "/p/rewards", // incentives for good investing habits (reward points(?), products + services)
  MAGICAL_MOMENTS: "/p/magical-moments", // memorable experiences with family, friends, awesome communities, etc. that happened based on your Fin Tea rewards/earnings. Photos of moments that make investing worth it 
};

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Fin Tea</title>
        <link rel="icon" href="/favicon.ico?v=3" />
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
        <LayoutLink href={ROUTES.EVENTS}>
            Nexus Events
        </LayoutLink>
        <LayoutLink href={ROUTES.PORTFOLIO}>
            Investing Portfolio
        </LayoutLink>
        <LayoutLink href={ROUTES.INSIGHTS}>
        Portfolio Insights
        </LayoutLink>
        <LayoutLink href={ROUTES.REWARDS}>
          Rewards
        </LayoutLink>
        <LayoutLink href={ROUTES.MAGICAL_MOMENTS}>
          Magical Moments
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
