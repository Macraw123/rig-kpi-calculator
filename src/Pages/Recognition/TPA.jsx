import { Col, Container, Row } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../Helpers/AppContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAssistantProjects } from "../../Auth/Academic";

const TPA = () => {
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setCurrentType] = useState("tpa");

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
  }, [currentSemester, currentAssistant, type]);

  const fetchSetProjects = async () => {
    if (!currentSemester || !currentAssistant) return;
    setIsLoading(true);
    const response = await getAssistantProjects(
      currentSemester,
      currentAssistant,
      type
    );
    console.log(response);
    setIsLoading(false);

    const payloads = response.data?.payloads;
    let project = payloads && payloads[type];
    if (type === "tpa") {
      project = project?.lists || [];
    } else {
      project = project ? [project] : [];
    }
    setProjects(project);
  };

  //columns and data
  const colums = [
    "Initial",
    "First Revision",
    "Second Revision",
    "Subject",
    "Title",
  ];

  const RIGcolums = ["Topic", "Description", "Score"];

  const renderTableHeader = () => {
    return (type === "tpa" ? colums : RIGcolums).map((col) => {
      return <th key={col}>{col}</th>;
    });
  };

  const renderTableRows = () => {
    return projects.map((tpa) => {
      if (!tpa.title) return;
      return (
        <tr key={tpa.title}>
          <td>{tpa.scores?.Initial?.score}</td>
          <td>{tpa.scores["First Revision"].score}</td>
          <td>{tpa.scores["Second Revision"].score}</td>
          <td>{tpa.subject}</td>
          <td>{tpa.title}</td>
        </tr>
      );
    });
  };

  const renderTableRigRows = () => {
    return projects.map((rig) => {
      if (!rig.topic) return;
      return (
        <tr key={rig.topic}>
          <td>{rig.topic}</td>
          <td>{rig.description}</td>
          <td>{rig.score}</td>
        </tr>
      );
    });
  };

  console.log(projects);
  return (
    <Container className="py-5">
      <Row>
        <Col sm={9}>
          <h3>TPA / RIG</h3>
        </Col>
      </Row>
      <Row className="my-4">
        <Col sm={4}>
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
        <Col sm={4}>
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
        <Col sm={4}>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={(e) => setCurrentType(e.target.value)}
          >
            <option value={"tpa"}>TPA</option>
            <option value={"rig"}>RIG</option>
          </select>
        </Col>
      </Row>
      <Row>
        <h4>
          Showing {currentAssistant} on {currentSemester}
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
          ) : projects && projects.length > 0 ? (
            <div className="responsive-table">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>{renderTableHeader()}</tr>
                </thead>
                <tbody>
                  {(type === "tpa" ? renderTableRows : renderTableRigRows)()}
                </tbody>
              </table>
            </div>
          ) : (
            <h3>Nothing to see here :D !</h3>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TPA;
