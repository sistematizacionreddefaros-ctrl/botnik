import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { useAuthStore } from "./stores/authStore";
import "./index.css";

/**
 * Root wrapper that initializes auth on mount.
 * Calls authStore.initialize() to:
 * - Get the current session
 * - Subscribe to onAuthStateChange for session refresh
 */
function Root() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>,
);
