import { useContext, useEffect, useReducer, useState } from "react";
import { Button, Col, Row, Spinner, Container } from "react-bootstrap";
import AppContext from "../Helpers/AppContext";
import Table from "../Components/Table";
import * as XLSX from "xlsx";
import {
  getAssistantByUsername,
  summaryData,
  summaryColumns,
  writeExcel,
  getLast10Years,
  getSemestersIds,
  getSemesterCategoryById,
} from "../Helpers/Helpers";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../Firebase/firebase";
import OntimeCaseMakingSummary from "../Helpers/Summary/OntimeCaseMakingSummary";
import PassingGradeSummary from "../Helpers/Summary/PassingGradeSummary";

const Home = (props) => {
  const [currentYear, setCurrentYear] = useState(null);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [columns, setColumns] = useState(summaryColumns);
  const [data, setData] = useState(summaryData);

  const [ontimeCasemaking, setOntimeCasemaking] = useState();

  /**
   * Reducer to handle loading logic from multiple sources
   * FETCHING : Currently fetching new data from source (waiting)
   * FETCHED : The data has been fetched
   * ERROR : An error occured, proceed to the next step
   */
  const fileLoadingReducer = (state, action) => {
    if (action.type === "FETCHING") {
      return {
        isLoading: true,
        isError: false,
        errorMessage: null,
        message: action.message,
      };
    }
    if (action.type === "FETCHED") {
      return {
        isLoading: false,
        isError: false,
        errorMessage: null,
        message: "All Data Fetched",
      };
    }
    if (action.type === "ERROR") {
      return { isLoading: false, isError: true, errorMessage: action.message };
    }
    return {
      isLoading: false,
      isError: false,
      errorMessage: null,
      message: state.message,
    };
  };

  const [fileLoadingState, dispatchFileLoading] = useReducer(
    fileLoadingReducer,
    {
      isLoading: false,
      isError: false,
      errorMessage: null,
      message: "",
    }
  );

  // App context for global states
  const appContext = useContext(AppContext);

  useEffect(() => {
    setCurrentYear(getLast10Years()[0]);
    setSemesters(getSemestersIds(appContext.semesters, getLast10Years()[0]));
    setCurrentAssistant(appContext.assistants[0]);
  }, [appContext.assistants, appContext.semesters]);

  /**
   * Function to change the current semester from the dropdown menu
   */
  const changeYear = (e) => {
    setCurrentYear(e.target.value);
    setSemesters(getSemestersIds(appContext.semesters, e.target.value));
  };

  /**
   * Function to change the current assistant from the dropdown menu
   */
  const changeAssistant = (e) => {
    const username = getAssistantByUsername(
      appContext.assistants,
      e.target.value
    );
    setCurrentAssistant(username);
  };

  const downloadTable = () => {
    const parseData = data.map((row) => {
      return Object.values(row);
    });

    writeExcel(parseData, Object.keys(data[0]), "Summary.xlsx");
  };

  const updateData = (result, semesterId, assistantId, key) => {
    const semesterCategory = getSemesterCategoryById(
      appContext.semesters,
      semesterId
    );
    let index;
    if (key === "Questionnaire") {
      index = 0;
    } else if (key === "OntimeCaseMaking") {
      index = 1;
    }

    data[index][semesterCategory] = {
      ...data[index][semesterCategory],
      result,
    };
  };

  const computeFinalScore = (row) => {
    console.log(row);
    let total = 0;
    total =
      row["Odd"].score * row["Odd"].weight +
      row["Even"].score * row["Even"].weight +
      row["Short"].score * row["Short"].weight;
    return total;
  };

  return (
    <Container className="py-5">
      <Row>
        <Col sm={9}>
          <h3>KPI Summary</h3>
        </Col>
        <Col sm={3} className="d-flex justify-content-end">
          <Button variant="primary" href={"#"}>
            Download KPI Summary
          </Button>
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
              <option key={assistant.Username} value={assistant.Username}>
                {assistant.Username} - {assistant.Name}
              </option>
            ))}
          </select>
        </Col>
        <Col sm={6}>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={changeYear}
          >
            {getLast10Years().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Col>
      </Row>
      <Row>
        <h6>
          Showing {currentYear} - {currentAssistant?.Username}
        </h6>
      </Row>
      {currentAssistant && semesters && semesters.length > 0 ? (
        <>
          <Row>
            <table>
              <tr>
                {columns.map((column) => (
                  <th>{column.Header}</th>
                ))}
              </tr>
              <tr>
                {Object.keys(data[0]).map((key, idx) => {
                  if (key === "Odd" || key === "Even" || key === "Short") {
                    return <td>-</td>;
                  } else return <td>{data[0][key]}</td>;
                })}
              </tr>
              <tr>
                {Object.keys(data[1]).map((key, idx) => {
                  if (key === "Odd" || key === "Even" || key === "Short") {
                    return (
                      <td>
                        <OntimeCaseMakingSummary
                          updateData={updateData}
                          currentSemester={
                            key === "Odd"
                              ? semesters[0].SemesterID
                              : key === "Even"
                              ? semesters[1].SemesterID
                              : semesters[2].SemesterID
                          }
                          key={idx}
                          currentAssistantId={currentAssistant.UserId}
                          currentAssistantUsername={currentAssistant.Username}
                        />
                      </td>
                    );
                  } else if (key === "Final Result") {
                    return <td>{data[1]["Final Result"]}</td>;
                  } else if (key === "Bobot") {
                    return <td>{data[1][key] * 100}%</td>;
                  } else {
                    return <td>{data[1][key]}</td>;
                  }
                })}
              </tr>
              <tr>
                {Object.keys(data[6]).map((key, idx) => {
                  if (key === "Odd" || key === "Even" || key === "Short") {
                    return (
                      <td>
                        <PassingGradeSummary
                          updateData={updateData}
                          currentSemester={
                            key === "Odd"
                              ? semesters[0].SemesterID
                              : key === "Even"
                              ? semesters[1].SemesterID
                              : semesters[2].SemesterID
                          }
                          key={idx}
                          currentAssistantId={currentAssistant.UserId}
                          currentAssistantUsername={currentAssistant.Username}
                        />
                      </td>
                    );
                  } else if (key === "Final Result") {
                    return <td>{data[6]["Final Result"]}</td>;
                  } else if (key === "Bobot") {
                    return <td>{data[6][key] * 100}%</td>;
                  } else {
                    return <td>{data[6][key]}</td>;
                  }
                })}
              </tr>
            </table>
          </Row>
          <Row>
            <Button variant="primary" onClick={downloadTable}>
              Download This Table
            </Button>
          </Row>
        </>
      ) : (
        <h2>Loading</h2>
      )}
    </Container>
  );
};

export default Home;
