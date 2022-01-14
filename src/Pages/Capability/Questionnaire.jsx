import { Col, Container, Row } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../Helpers/AppContext";
import { getQuestionnaireResults } from "../../Auth/Laboratory";
import { getDetailQuestionnaire } from "../../Auth/Laboratory";
import Table from "../../Components/Table";
import "bootstrap/dist/css/bootstrap.min.css";

const Questionnaire = () => {
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [questionnaireDetail, setQuestionnaireDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // currentSemester = "81fbcf76-7fe7-424c-9f53-990e2051f137";
  // App context for global states
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
      let assistantFormat = `${appContext.assistants[0]?.UserId}#${appContext.assistants[0]?.Username}#${appContext.assistants[0]?.Name}`;
      setCurrentSemester(appContext.semesters[0]?.SemesterID);
      setCurrentAssistant(assistantFormat);
    }
  }, [appContext.semesters, appContext.assistants]);

  useEffect(() => {
    fetchQuestionnaires();
    fetchQuestionnaireDetail(currentAssistant, currentSemester);
  }, [currentAssistant, currentSemester]);

  const fetchQuestionnaires = async () => {
    if (currentAssistant === null) return;
    setIsLoading(true);
    const response = await getQuestionnaireResults(
      currentAssistant.split("#")[0],
      currentSemester
    );
    setIsLoading(false);
    if (response.data.length !== 0) {
      console.log(response.data);
      const fetch = response.data.map((questionnaire) => {
        return {
          ...questionnaire,
          AverageQuestionnaire: questionnaire.AverageQuestionnaire.toFixed(2),
        };
      });
      setQuestionnaires(fetch);
    }
  };

  /**
   *
   * @returns Current Assistant null, jadi lgsg keluar di awal
   */
  const fetchQuestionnaireDetail = async (assistantF, semester) => {
    console.log(assistantF === null);
    setIsLoadingDetail(true);
    if (assistantF === null) {
      return;
    }

    const response = await getDetailQuestionnaire(currentSemester);
    let valueArray = assistantF.split("#");
    let assistant = `${valueArray[1]}-${valueArray[2].toUpperCase()}`;

    const details = response.data.filter((v) => {
      return v.Assistant === assistant;
    });

    setIsLoadingDetail(false);
    if (details !== 0) {
      setQuestionnaireDetail(details);
    }
  };

  //columns and data
  const colums = [
    "Course Outline",
    "Class",
    "Assistant",
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "Q5",
    "Q6",
    "Q7",
    "Q8",
    "Q9",
    "Q10",
    "Average",
    "Percentage",
  ];

  //columns detail
  const detailColumns = [
    {
      Header: "BinusianID",
      accessor: "BinusianID",
    },
    {
      Header: "Subject",
      accessor: "Subject",
    },
    {
      Header: "Class",
      accessor: "Class",
    },
    {
      Header: "Assistant",
      accessor: "Assistant",
    },
    {
      Header: "Date",
      accessor: "Date",
    },
    {
      Header: "Q1",
      accessor: "Q1",
    },
    {
      Header: "Q2",
      accessor: "Q2",
    },
    {
      Header: "Q3",
      accessor: "Q3",
    },
    {
      Header: "Q4",
      accessor: "Q4",
    },
    {
      Header: "Q5",
      accessor: "Q5",
    },
    {
      Header: "Q6",
      accessor: "Q6",
    },
    {
      Header: "Q7",
      accessor: "Q7",
    },
    {
      Header: "Q8",
      accessor: "Q8",
    },
    {
      Header: "Q9",
      accessor: "Q9",
    },
    {
      Header: "Q10",
      accessor: "Q10",
    },
    {
      Header: "Q11",
      accessor: "Q11",
    },
  ];

  const renderTableHeader = () => {
    return colums.map((col) => {
      return <th key={col}>{col}</th>;
    });
  };

  const renderTableRows = () => {
    return questionnaires.map((quest, idx) => {
      return (
        <tr key={idx}>
          <td>{quest.CourseOutline}</td>
          <td>{quest.ClassName}</td>
          <td>{quest.UserName}</td>
          {quest.Detail.map((det, detIdx) => (
            <td key={detIdx}>{det.Average === 0 ? "N/A" : det.Average}</td>
          ))}
          <td>{quest.AverageQuestionnaire}</td>
          <td>{`${quest.TotalFill} / ${quest.TotalStudent} (${quest.PercentageFill})%`}</td>
        </tr>
      );
    });
  };

  return (
    <Container className="py-5">
      <Row>
        <Col sm={9}>
          <h3>Questionnaire Evaluation</h3>
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
                key={`${assistant.UserId}#${assistant.Username}#${assistant.Name}`}
                value={`${assistant.UserId}#${assistant.Username}#${assistant.Name}`}
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
        <Col>
          {isLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : questionnaires.length < 500 && questionnaires.length > 0 ? (
            <div className="responsive-table">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>{renderTableHeader()}</tr>
                </thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-danger" role="alert">
              No Data!
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <h3>Questionnaire Detail</h3>
        <Col>
          {isLoadingDetail ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : questionnaireDetail.length <= 0 ? (
            <Col>
              <div className="alert alert-danger" role="alert">
                No Questionnaire Detail!
              </div>
            </Col>
          ) : (
            <Table columns={detailColumns} data={questionnaireDetail} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Questionnaire;
