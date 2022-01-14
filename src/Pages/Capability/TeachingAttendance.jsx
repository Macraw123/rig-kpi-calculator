import { Col, Container, Row } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../Helpers/AppContext";
import Table from "../../Components/Table";
import {
  getLecturerClassAttendanceSummary,
  getLecturerExamAttendanceSummary,
} from "../../Auth/Laboratory";

const TeachingAttendance = () => {
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // currentSemester = "81fbcf76-7fe7-424c-9f53-990e2051f137";
  // App context for global states
  const appContext = useContext(AppContext);

  /**
   * Function to change the current assistant from the dropdown menu
   */
  const changeAssistant = (e) => {
    setCurrentAssistant(e.target.value);
  };

  /**
   * Function to change the current assistant from the dropdown menu
   */
  const changeSemester = (e) => {
    setCurrentSemester(e.target.value);
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentSemester, currentAssistant]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchAttendance = async (assistant, semester) => {
    setIsLoading(true);
    const classAttendanceResponse = await getLecturerClassAttendanceSummary(
      semester
    );
    const classAttendance = classAttendanceResponse.data.filter((v) => {
      return v.Assistant === currentAssistant;
    });

    const examAttendanceResponse = await getLecturerExamAttendanceSummary(
      semester
    );
    const examAttendance = examAttendanceResponse.data.filter((v) => {
      return v.Assistant === currentAssistant;
    });

    const attendance = classAttendance.concat(examAttendance);

    setIsLoading(false);

    attendance.forEach((a) => {
      var myMonth = new Date(a.Month);
      a.Month = myMonth.getDate() + "-" + monthNames[myMonth.getMonth()];
    });
    if (attendance.length !== 0) {
      setAttendance(attendance);

      console.log(attendance);
    }
  };

  /**
   * Set the default current semester and assistant
   */
  useEffect(() => {
    if (appContext.semesters.length > 0 && appContext.assistants.length > 0) {
      setCurrentSemester(appContext.semesters[0]?.SemesterID);
      setCurrentAssistant(
        `${appContext.assistants[0]?.Username} - ${appContext.assistants[0]?.Name}`
      );
    }
  }, [appContext.semesters, appContext.assistants]);

  /**
   * Set Column Header
   */

  const column = [
    {
      Header: "Assistant",
      accessor: "Assistant",
    },
    {
      Header: "Month",
      accessor: "Month",
    },
    {
      Header: "Absent",
      accessor: "Absent",
    },
    {
      Header: "Late",
      accessor: "Late",
    },
    {
      Header: "Present",
      accessor: "Present",
    },
    {
      Header: "Permission",
      accessor: "Permission",
    },
    {
      Header: "Substituted",
      accessor: "Substituted",
    },
    {
      Header: "Substitute",
      accessor: "Substitute",
    },
  ];

  return (
    <Container className="py-5">
      <Row>
        <Col sm={9}>
          <h3>Teaching Attendance and Absence</h3>
        </Col>
      </Row>
      <Row className="my-4">
        <Col sm={6}>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={changeAssistant}
          >
            {appContext.assistants.map((assistant) => (
              <option
                key={`${assistant.Username} - ${assistant.Name}`}
                value={`${assistant.Username} - ${assistant.Name}`}
              >
                {assistant.Username} - {assistant.Name}
              </option>
            ))}
          </select>
        </Col>
        <Col sm={6}>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={changeSemester}
          >
            {appContext.semesters.map((semester) => (
              <option key={semester.SemesterID} value={semester.SemesterID}>
                {semester.Description}
              </option>
            ))}
          </select>
        </Col>
      </Row>
      <Row>
        <h4>
          Showing {currentAssistant} on {currentSemester}
        </h4>
      </Row>
      <Row>
        {isLoading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : attendance.length <= 0 ? (
          <Col>
            <div className="alert alert-danger" role="alert">
              No Data!
            </div>
          </Col>
        ) : (
          <Table columns={column} data={attendance} />
        )}
      </Row>
    </Container>
  );
};

export default TeachingAttendance;
