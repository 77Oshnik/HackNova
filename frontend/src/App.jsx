import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
// import Home from "./pages/Home";
// import Dashboard from "./pages/Dashboard";
// import SignInPage from "./pages/SignInPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap all pages inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="dashboard" element={<Dashboard />} />
          <Route path="signin" element={<SignInPage />} /> */}
        </Route>

        <Route element={<ProtectedRoute />}>
            <Route path="dashboard"  />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
