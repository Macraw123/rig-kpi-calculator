import axios from "axios";

export const WEB_URL = "http://localhost:3000";

const LOCAL_STORAGE_KEYS = {
  accessToken: "laboratory-access-token",
  refreshToken: "laboratory-refresh-token",
  expiresIn: "laboratory-expires-in",
  timestamp: "laboratory-timestamp",
};

const LOCAL_STORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCAL_STORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCAL_STORAGE_KEYS.refreshToken),
  expiresIn: window.localStorage.getItem(LOCAL_STORAGE_KEYS.expiresIn),
  timestamp: window.localStorage.getItem(LOCAL_STORAGE_KEYS.timestamp),
};

let accessToken;

/**
 * Change the axios default config for the request header
 * @return {void}
 */
const updateAxiosDefaultConfigurations = () => {
  if (accessToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

/**
 * Validate whether the current access token has expired or not
 * @return {boolean} whether the token has expired or not
 */

const hasTokenExpired = () => {
  const { accessToken, timestamp, expiresIn } = LOCAL_STORAGE_VALUES;

  if (!accessToken || !timestamp || !expiresIn) {
    return false;
  }

  const elapsed = Date.now() - Number(timestamp);
  return elapsed / 1000 > Number(expiresIn);
};

/**
 * Clearing the local storage
 * @return {void}
 */

export const logout = () => {
  for (const property in LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(LOCAL_STORAGE_KEYS[property]);
  }

  // Redirect back to the login page
  window.location = WEB_URL;
};

/**
 * Refresh the access token
 * @return {void}
 */

const refreshAccessToken = async () => {
  // TODO - Implement refresh access token
};

/**
 * Handles logic for retrieving the access token (login)
 * @return {string} the access token
 */

export const getAccessToken = async (username = null, password = null) => {
  // Logging in for the first time by supplying the username and password
  if (username && password) {
    console.log("username and password");
    return axios
      .post("/Account/LogOn", {
        username: username,
        password: password,
      })
      .then((response) => {
        console.log("response", response);
        if (response.data.access_token) {
          window.localStorage.setItem(
            LOCAL_STORAGE_KEYS.accessToken,
            response.data.access_token
          );
          window.localStorage.setItem(
            LOCAL_STORAGE_KEYS.refreshToken,
            response.data.refresh_token
          );
          window.localStorage.setItem(
            LOCAL_STORAGE_KEYS.expiresIn,
            response.data.expires_in
          );
          window.localStorage.setItem(LOCAL_STORAGE_KEYS.timestamp, Date.now());

          accessToken = response.data.access_token;
          updateAxiosDefaultConfigurations();
          return response.data.access_token;
        } else {
          // console.log("error", response.data.error);
          updateAxiosDefaultConfigurations();
          return false;
        }
      })
      .catch((error) => {
        // console.log("error", error);
        updateAxiosDefaultConfigurations();
        return undefined;
      });
  }
  // If there's an access token in local storage, return it
  else if (
    LOCAL_STORAGE_VALUES.accessToken &&
    LOCAL_STORAGE_VALUES.accessToken !== "undefined" &&
    !hasTokenExpired()
  ) {
    // console.log("local storage");
    accessToken = LOCAL_STORAGE_VALUES.accessToken;
    updateAxiosDefaultConfigurations();
    return LOCAL_STORAGE_VALUES.accessToken;
  }
  // There's no access token in local storage and there's no username and password, return false
  else {
    console.log("no access token");
    updateAxiosDefaultConfigurations();
    return false;
  }
};

/**
 * Axios global config
 */

axios.defaults.baseURL = "https://laboratory.binus.ac.id/lapi/api";
axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "*/*";

/**
 * Get current user's profile
 * @return {Promise} the user's profile
 */
export const getUserProfile = async () => axios.get("/Account/Me");

/**
 * Get all semesters with active date
 * @return {Promise} the semesters
 */
export const getAllSemesters = async () =>
  axios.get("Semester/GetSemestersWithActiveDate");

/**
 * Get questionnaire results
 * @return {Promise} the questionnaire results
 */

export const getQuestionnaireResults = async (userId, semesterId) =>
  axios.get(
    `Questionnaire/GetQuestionnaireRecapitulation?userId=${userId}&semesterId=${semesterId}`
  );

/**
 * Get all assistant
 * @return {promise} the assistant data
 */

export const getAllAssistant = async () => axios.get("Assistant/All");

/**
 * Get Ontime Case Making data
 */

export const getOntimeCaseMaking = async (userId, semesterId) =>
  axios.get(
    `Schedule/GetClientCaseMakingSchedules?type=All&semesterId=${semesterId}&userId=${userId}`
  );

/**
 * Get Ontime Evaluating and Marking
 *
 */

export const getOntimeMarking = async (userId, semesterId) =>
  axios.get(
    `Student/GetLecturerScoreEntries?type=All&semesterId=${semesterId}&userId=${userId}`
  );
/**
 * Get Lecturer Class Attendance Summary
 *
 */

export const getLecturerClassAttendanceSummary = async (semesterId) =>
  axios.get(
    `Attendance/GetLecturerClassAttendanceSummary?semesterId=${semesterId}`
  );

/**
 * Get Lecturer Exam Attendance Summary
 *
 */

export const getLecturerExamAttendanceSummary = async (semesterId) =>
  axios.get(
    `Attendance/GetLecturerExamAttendanceSummary?semesterId=${semesterId}&isFinal=true`
  );

/**
 * Get Questionnaire Detail
 *
 */

export const getDetailQuestionnaire = async (semesterId) =>
  axios.get(
    `Questionnaire/GetQuestionnaireAssistantDetail?userId=F8BAD7D4-58DD-EA11-90F0-D8D385FCE79E&semesterId=${semesterId}`
  );
//Questionnaire/GetQuestionnaireAssistantDetail?userId=F8BAD7D4-58DD-EA11-90F0-D8D385FCE79E&semesterId=81FBCF76-7FE7-424C-9F53-990E2051F137
