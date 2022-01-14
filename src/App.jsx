import "./App.css";
import Login from "./Pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccessToken, getUserProfile, logout } from "./Auth/Laboratory";
import NavigationBar from "./Components/NavigationBar";
import Home from "./Pages/Home";
import PassingGrade from "./Pages/Recognition/PassingGrade";
import NotFound from "./Pages/NotFound";
import AdditionalClass from "./Pages/Enabler/AdditionalClass";
import Involvement from "./Pages/Enabler/Involvement";
import Questionnaire from "./Pages/Capability/Questionnaire";
import OntimeCaseMaking from "./Pages/Capability/OntimeCaseMaking";
import TPA from "./Pages/Recognition/TPA";
import Qualification from "./Pages/Recognition/Qualification";
import OntimeMarking from "./Pages/Capability/OntimeMarking";
import TeachingAttendance from "./Pages/Capability/TeachingAttendance";
import OntimeEvaluating from "./Pages/Capability/OntimeEvaluating";

function App() {
  const [token, setToken] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  /**
   * Fetch the current user profile and set that data to the useState variable
   */
  const fetchProfile = async () => {
    const profileFetch = await getUserProfile();
    setProfile(profileFetch.data);
  };

  /**
   * Fetch the current user's access token and set that data to the useState variable
   */
  const fetchAccessToken = async () => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      setToken(accessToken);
    }
  };

  useEffect(() => {
    fetchAccessToken();
    fetchProfile();
  }, []);

  /**
   * Handle logic for logging in the user
   * @return {void}
   */
  const handleLogin = (username, password) => {
    setIsLoading(true);
    const fetchAccessToken = async () => {
      const accessToken = await getAccessToken(username, password);
      console.log(accessToken);
      if (accessToken) {
        // console.log("accessToken", accessToken);
        setIsError(false);
        setToken(accessToken);
      } else {
        // console.log("Invalid username or password");
        setIsError(true);
        setToken(null);
      }
      setIsLoading(false);
    };
    fetchAccessToken();
    fetchProfile();
  };

  /**
   * Handle logic for logging out the user
   * @return {void}
   */
  const handleLogout = () => {
    logout();
    setToken(null);
  };

  const getSummaryData = (data) => {
    console.log("get data summary");
    console.log(data);
  };

  return (
    <Router>
      <div className="root">
        {!token ? (
          <Login
            setToken={setToken}
            login={handleLogin}
            isError={isError}
            closeError={() => setIsError(false)}
            isLoading={isLoading}
          />
        ) : (
          <div>
            <NavigationBar profile={profile} handleLogout={handleLogout} />
            <Routes>
              <Route
                path="/"
                exact
                element={<Home token={token} handleLogout={handleLogout} />}
              />
              <Route path="/passing-grade" exact element={<PassingGrade />} />
              <Route
                path="/additional-class"
                exact
                element={<AdditionalClass />}
              />
              <Route path="/questionnaire" exact element={<Questionnaire />} />
              <Route
                path="/ontime-casemaking"
                exact
                element={<OntimeCaseMaking getSummaryData={getSummaryData} />}
              />
              <Route path="/ontime-marking" exact element={<OntimeMarking />} />
              <Route
                path="/teaching-attendance-absence"
                exact
                element={<TeachingAttendance />}
              />
              <Route
                path="/ontime-evaluating"
                exact
                element={<OntimeEvaluating />}
              />
              <Route path="/tpa" exact element={<TPA />} />
              <Route path="/qualification" exact element={<Qualification />} />
              <Route path="/passing-grade" exact element={<PassingGrade />} />
              <Route path="/involvement" exact element={<Involvement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
