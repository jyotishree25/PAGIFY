import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppMain from "./App.main";
import { InventoryProvider } from "./context/InventoryContext.jsx";

function App() {
  return (
    <Router>
      <InventoryProvider>
        <AppMain />
      </InventoryProvider>
    </Router>
  );
}

export default App;
