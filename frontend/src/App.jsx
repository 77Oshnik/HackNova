import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";
import DashBoard from "./components/DashBoard";
import Home from "./components/Home";
import Trip from "./components/Trip";
import MapContainer from "./components/MapContainer";
import Map from "./components/Map";
import { Toaster } from "react-hot-toast";
import TravelScoreChart from "./components/TravelScoreChart";
import Chatbot from "./components/Chatbot";
import TravelForecast from "./components/TravelForecast";
import ChatAssistant from "./components/ChatAssistant";
import SafetyPathfinder from "./components/SafetyPathfinder";
import TweetFeed from "./components/TweetFeed";
import TimelineCalculator from "./components/TimeLineCalculator";
import ReportIncident from "./components/ReportIncident";


function App() {
  return (
    <>
     <Toaster position="top-right" />
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
            <Route path="map" element={<Map/>}/>
            <Route path="tweet" element={<TweetFeed/>} />
            <Route path="best" element={<TravelScoreChart />} />
            <Route path="bot" element={<Chatbot />} />
            <Route path="forecast" element={<TravelForecast />} />
            <Route path="assistant" element={<ChatAssistant />} />
            <Route path="bc" element={<SafetyPathfinder />} />
            <Route path="line" element={<TimelineCalculator />} />
            <Route path="report" element={<ReportIncident />} />
           </Route>
        </Routes>
      </Layout>
    </Router>
    </>
  );
}

export default App;