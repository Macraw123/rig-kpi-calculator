import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { useContext, useEffect, useReducer, useState } from "react";
import AppContext from "../../Helpers/AppContext";
import { getOntimeMarking } from "../../Auth/Laboratory";
import Table from "../../Components/Table";

const OntimeEvaluating = () => {
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [ontimeMarking, setOntimeMarking] = useState([]);
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

  /**
   * Set the default current semester and assistant
   */
  useEffect(() => {
    if (appContext.semesters.length > 0 && appContext.assistants.length > 0) {
      setCurrentSemester(appContext.semesters[0]?.SemesterID);
      setCurrentAssistant(appContext.assistants[0]?.UserId);
    }
  }, [appContext.semesters, appContext.assistants]);
  /**
   * Fetch Ontime Marking from API
   */
  useEffect(() => {
    fetchOntimeMarking();
  }, [currentSemester, currentAssistant]);

  const fetchOntimeMarking = async () => {
    console.log("fetch ontime marking");
    setIsLoading(true);
    const response = await getOntimeMarking(currentAssistant, currentSemester);

    let data = response.data;

    data.forEach((d) => {
      var startDateFormat = new Date(d.StartDate).toDateString();
      d.StartDate = startDateFormat;
      var deadlineFormat = new Date(d.EndDate).toDateString();
      d.EndDate = deadlineFormat;

      var approveDateFormat = new Date(d.FinishDate).toDateString();
      d.FinishDate = approveDateFormat;

      if (d.RoomName == null) {
        d.RoomName = "-";
      }
      if (d.BundleDeadline === null) {
        d.BundleDeadline = "No";
      }
      if (d.FinishDate === null) {
        d.FinishDate = "-";
      }
      if (d.ExtendedDate === null) {
        d.ExtendedDate = "-";
      }
      if (d.ExtensionReason === null) {
        d.ExtensionReason = "-";
      }
    });
    if (data.length !== 0) {
      setOntimeMarking(data);
      setIsLoading(false);
      console.log(data);
    }
  };

  /**
   * Set Column Header
   */

  const column = [
    {
      Header: "Subject",
      accessor: "CourseName",
    },
    {
      Header: "Class",
      accessor: "ClassName",
    },
    {
      Header: "Room",
      accessor: "RoomName",
    },
    {
      Header: "Type",
      accessor: "Type",
    },
    {
      Header: "Corrector",
      accessor: "Corrector",
    },
    {
      Header: "Number",
      accessor: "Number",
    },
    {
      Header: "Start Date",
      accessor: "StartDate",
    },
    {
      Header: "Correction Deadline",
      accessor: "EndDate",
    },
    {
      Header: "Approve Date",
      accessor: "FinishDate",
    },
    {
      Header: "Student Count",
      accessor: "StudentCount",
    },
    {
      Header: "Overdue",
      accessor: "BundleDeadline",
    },
    {
      Header: "Extended Date",
      accessor: "ExtendedDate",
    },
    {
      Header: "Extension Reason",
      accessor: "ExtensionReason",
    },
  ];
  return (
    <Container className="py-5">
      <Row>
        <Col sm={9}>
          <h3>Ontime Evaluating</h3>
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
              <option key={assistant.UserId} value={assistant.UserId}>
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
      {isLoading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : ontimeMarking.length > 700 ? (
        <h2>No data!</h2>
      ) : (
        <Table columns={column} data={ontimeMarking} />
      )}
    </Container>
  );
};

export default OntimeEvaluating;
