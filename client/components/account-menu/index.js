import React, { useState } from "react";
import Popup from "reactjs-popup";
import useAuth from "../../hooks/auth";
import classNames from "classnames";

import styles from "./account-menu.module.css";

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!isMenuOpen);
  }

  return (
    <Popup
      contentStyle={{ width: 130 }}
      open={isMenuOpen}
      trigger={
        <div
          className={classNames(styles.container, styles.name)}
          onClick={toggleMenu}
        >
          {user && (
            <span>
              {user.firstName}{" "}
              <i
                className={classNames(
                  styles.arrow,
                  isMenuOpen ? styles.up : styles.down
                )}
              />
            </span>
          )}
        </div>
      }
    >
      <ul className={styles.menu}>
        <li>
          <a className={styles.menuItem} href="#" onClick={logout}>
            Log out
          </a>
        </li>
      </ul>
    </Popup>
  );
}
