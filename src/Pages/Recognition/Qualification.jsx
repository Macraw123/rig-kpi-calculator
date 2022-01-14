import { Col, Container, Row } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../Helpers/AppContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAssistantQualification } from "../../Auth/Academic";
import Table from "../../Components/Table";
import { Link } from "react-router-dom";

const Qualification = () => {
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const appContext = useContext(AppContext);

  /**
   * Function to change the current semester from the dropdown menu
   */
  const changeSemester = (e) => {
    setCurrentSemester(e.target.value);
  };
  /**
   * Function to change the current assistant from the dropdown menu
   */
  const changeAssistant = (e) => {
    setCurrentAssistant(e.target.value);
  };

  /**
   * Set the default current semester and assistant
   */
  useEffect(() => {
    if (appContext.semesters.length > 0 && appContext.assistants.length > 0) {
      setCurrentSemester(appContext.semesters[0]?.SemesterID);
      setCurrentAssistant(appContext.assistants[0]?.Username);
    }
  }, [appContext.semesters, appContext.assistants]);

  useEffect(() => {
    fetchSetProjects();
  }, [currentSemester, currentAssistant]);

  const fetchSetProjects = async () => {
    if (!currentSemester || !currentAssistant) return;
    setIsLoading(true);
    const response = await getAssistantQualification(
      currentSemester,
      currentAssistant
    );
    console.log(response);
    if (response.data.length !== 0) {
      setIsLoading(false);
      setQualifications(response.data?.payloads);
    }
  };

  const column = [
    {
      Header: "Course Code",
      accessor: "course_code",
    },
    {
      Header: "Course Name",
      accessor: "course_name",
    },
    {
      Header: "Status",
      accessor: "status",
    },
  ];
  
  const qualificationDatas = qualifications?.qualification?.detail;
  const percentage = qualifications?.qualification?.percentage;

  return (
    <Container className="py-5">
      <Row>
        <Col sm={9}>
          <h3>Assistant's Qualification</h3>
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
              <option key={assistant.UserId} value={assistant.Username}>
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
          Showing {currentAssistant} on {currentSemester}{" "}
          {percentage ? `With Average of ${percentage}` : ""}
        </h4>
      </Row>
      <Row>
        <Col>
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : qualificationDatas && qualificationDatas.length > 0 ? (
            <Table data={qualificationDatas} columns={column} />
          ) : (
            <h3>Nothing to see here :D !</h3>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Qualification;
