import { AptabaseProvider } from "@aptabase/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppProvider from "./app";
import "./globals.css";

if (typeof localStorage !== "undefined" && localStorage.getItem("duckly-dark-mode") === "1") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AptabaseProvider appKey="A-US-9209452703">
      <BrowserRouter>
        <AppProvider />
      </BrowserRouter>
    </AptabaseProvider>
  </StrictMode>,
);
