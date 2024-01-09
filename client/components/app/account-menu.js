import React, { useState } from "react";
import Popup from "reactjs-popup";
import useAuth from "../../hooks/auth";
import classNames from "classnames";

import styles from "../account-menu/account-menu.module.css";

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
          className="flex items-center text-white cursor-pointer"
          onClick={toggleMenu}
        >
          {user && (
            <span>
              {user.firstName}{" "}
              <i
                style={{ transform: isMenuOpen ? "rotate(-135deg)" : "rotate(45deg)"  }}
                className={classNames(
                  "border-solid-white border-b-2 border-r-2 p-1 mb-1 ml-1 inline-block",
                )}
              />
            </span>
          )}
        </div>
      }
    >
      <ul className="list-none bg-white rounded-md p-1">
        <li>
          <a className="no-underline outline-none" href="#" onClick={logout}>
            Log out
          </a>
        </li>
      </ul>
    </Popup>
  );
}
