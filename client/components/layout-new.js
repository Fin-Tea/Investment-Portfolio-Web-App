import Head from "next/head";
import useAuth from "../hooks/auth";
import AccountMenu from "./account-menu";
import styles from "./layout-new.module.css";

export default function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div>
      <Head>
        <title>Fin Tea</title>
        <link rel="icon" href="/favicon.ico?v=3" />
        <meta
          name="description"
          content="Easy Trading Journaling &amp; Performance Insights"
        />
        <meta name="og:title" content="Fin Tea" />
      </Head>
      <header className={styles.layoutHeader}>
        <div className="flex justify-center items-center pt-2 mr-4">
      <img style={{filter: "invert(100%)"}} src="/images/tea.svg" width={32}  />
        <h1 className="text-white ml-1">Fin Tea</h1>
        </div>
        <AccountMenu />
      </header>
      <div className={styles.container}>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
