import React, { useEffect, useState } from "react";
import { getAllAssistant, getAllSemesters } from "../Auth/Laboratory";

const AppContext = React.createContext({
  assistants: [],
  semesters: [],
  scores: [],
});

export const AppContextProvider = (props) => {
  const [assistants, setAssistants] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchAllSemesters();
    fetchAllAssistants();
  }, []);

  /**
   * Fetch all semesters data and set that data to the useState variable
   */
  const fetchAllSemesters = async () => {
    const fetchSemesters = await getAllSemesters();
    const semester_arr = Object.values(fetchSemesters.data);
    setSemesters(semester_arr.reverse());
  };

  /**
   * Fetch all assistants data and set that data to the useState variable
   */
  const fetchAllAssistants = async () => {
    // TODO fetch all assistants with real data
    const response = await getAllAssistant();
    setAssistants(response.data.active);
  };

  /**
   * Fetch Lecturer Class Attendance
   */

  // const fetchClassAttendance = async (currentSemester, currentAssistant) => {
  //   const response = await getLecturerClassAttendanceSummary(currentSemester);

  //   response.filter((classAttendance) => {
  //     return classAttendance.Assistant === currentAssistant;
  //   });

  //   setClassAttendance(response.data);
  // };

  /**
   * Fetch Lecturer Class Attendance
   */

  // const fetchExamAttendance = async (currentSemester, currentAssistant) => {
  //   const response = await getLecturerExamAttendanceSummary(currentSemester);
  //   setExamAttendance(response.data);
  // };

  return (
    <AppContext.Provider value={{ assistants, semesters }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContext;
