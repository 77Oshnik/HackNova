import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";
import DashBoard from "./components/DashBoard";
import Home from "./components/Home";
import Trip from "./components/Trip";
import TravelScoreChart from "./components/TravelScoreChart";

function App() {
  return (
    <Router>
      <Layout> {/* Keep Layout always active */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          {/* <Route path="signin" element={<SignInPage />} /> */}

          {/* Protected Routes - Only logged-in users can access */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashBoard />} />
            <Route path="trip" element={<Trip/>}/>
            <Route path="best" element={<TravelScoreChart />} />
           </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;