import React, { useState } from "react";
import Link from "next/link";
import Popup from "reactjs-popup";
import useAuth from "../../hooks/auth";
import classNames from "classnames";

const ROUTES = {
  ACCOUNTS: "/t/accounts",
  CHANGE_PASSWORD: "/t/change-password"
};

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen(!isMenuOpen);
  }

  return (
    <Popup
      contentStyle={{ width: 120, border: "1px solid rgb(209, 213, 219)", borderRadius: 12, backgroundColor: "#ffffff" }}
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
                style={{
                  transform: isMenuOpen ? "rotate(-135deg)" : "rotate(45deg)",
                }}
                className={classNames(
                  "border-solid-white border-b-2 border-r-2 p-1 mb-1 ml-1 inline-block"
                )}
              />
            </span>
          )}
        </div>
      }
    >
      <div className="pl-2">
      <ul className="list-none p-1">
        <li className="border-b">
          {" "}
          <Link href={ROUTES.ACCOUNTS}>
            <a className="no-underline outline-none">Accounts</a>
          </Link>
        </li>
        <li className="border-b">
          {" "}
          <Link href={ROUTES.CHANGE_PASSWORD}>
            <a className="no-underline outline-none">Change Password</a>
          </Link>
        </li>
        <li>
          <a className="no-underline outline-none" href="#" onClick={logout}>
            Log out
          </a>
        </li>
      </ul>
      </div>
    </Popup>
  );
}
