import React from "react";
import { createRoot } from "react-dom/client";
import { PrintEditor } from "./PrintEditor.jsx";
import "./styles.css";
import "./print.css";

createRoot(document.getElementById("root")).render(<React.StrictMode><PrintEditor /></React.StrictMode>);
