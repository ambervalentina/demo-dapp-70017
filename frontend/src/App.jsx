// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import QuerySection from "./components/QuerySection";
import TransferSection from "./components/TransferSection";
import "./index.css";
// import "./App.css";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="app-container">
        <div style={{ textAlign: "right" }}> * click the menu button to switch between query and transfer section</div>
        <Navbar />
        <Routes>
          <Route path="/" element={<QuerySection />} />
          <Route path="/transfer" element={<TransferSection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
