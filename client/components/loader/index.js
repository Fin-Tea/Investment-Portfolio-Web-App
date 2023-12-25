import { Audio } from "react-loader-spinner";
import styles from "./loader.module.css";

export default function Loader() {
  return (
    <div className={styles.loaderContainer}>
      <Audio heigth="100" width="100" color="grey" arialLabel="loading" />
    </div>
  );
}
