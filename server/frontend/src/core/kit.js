import { createContext, useContext, useEffect, useState } from "react";
import { getUsername, logout } from "./api";

// The kit is what the theme hands to the shared pages: its Layout (nav, footer) and its Home.
export const KitContext = createContext(null);
export const useKit = () => useContext(KitContext);

export const useSession = () => {
  const [username] = useState(getUsername);
  const [logoutState, setLogoutState] = useState("idle");
  const doLogout = async () => {
    if (logoutState === "pending") return;
    setLogoutState("pending");
    if (await logout()) window.location.href = window.location.origin;
    else setLogoutState("error");
  };
  return { username, logoutState, logout: doLogout };
};

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | Dealerships` : "Dealerships | Dealer reviews, scored by what owners wrote";
  }, [title]);
};
