import Head from "next/head";
import AccountMenu from "./account-menu";

export default function Layout({ children }) {

  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Easy Trading Journaling &amp; Performance Insights"
        />
        <meta name="og:title" content="The Fin Tea" />
      </Head>
      <header className="h-12 bg-purple-800 flex justify-between items-center">
        <h1 className="pt-2 ml-4 text-lg text-white">The Fin Tea</h1>
        <div className="mr-4">
        <AccountMenu />
        </div>
      </header>
        <main className="bg-zinc-100 h-screen">{children}</main>
    </div>
  );
}
