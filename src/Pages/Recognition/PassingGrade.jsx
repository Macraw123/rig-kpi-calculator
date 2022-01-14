import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import Table from "../../Components/Table";
import { PASSING_GRADE_TEMPLATE } from "../../Helpers/StaticLinks";
import * as XLSX from "xlsx";
import { useContext, useEffect, useReducer, useState } from "react";
import { storage, ref } from "../../Firebase/firebase";
import { getDownloadURL, uploadBytes } from "firebase/storage";

import AppContext from "../../Helpers/AppContext";

const PassingGrade = (props) => {
  // Uploaded file
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(null);
  const [currentAssistant, setCurrentAssistant] = useState(null);

  /**
   * Reducer for handling the state of the table in relation with Firebase Storage
   */
  const errorReducer = (state, action) => {
    if (action.type === "SET") {
      return { message: action.message, isError: true, isLoading: false };
    }
    if (action.type === "CLEAR") {
      return { message: null, isError: false, isLoading: false };
    }
    if (action.type === "FETCHING") {
      return { message: null, isError: false, isLoading: true };
    }
    if (action.type === "FETCHED") {
      return { message: null, isError: false, isLoading: false };
    }
    return { message: null, isError: false, isLoading: false };
  };

  const [errorState, dispatchError] = useReducer(errorReducer, {
    message: null,
    isError: false,
    isLoading: false,
  });

  /**
   * Reducer for handling the state of the file upload
   */

  const fileReducer = (state, action) => {
    if (action.type === "READ") {
      return {
        file: action.file,
        isUpload: state.isUpload,
        isError: false,
        isLoading: false,
      };
    }
    if (action.type === "UPLOAD") {
      return {
        file: state.file,
        isUpload: true,
        isError: false,
        isLoading: action.isLoading,
      };
    }
    if (action.type === "ERROR") {
      return {
        file: null,
        isUpload: false,
        isError: true,
        isLoading: false,
      };
    }
    if (action.type === "RESET") {
      return {
        file: null,
        isUpload: false,
        isError: false,
        isLoading: false,
      };
    }
  };

  const [fileState, dispatchFile] = useReducer(fileReducer, {
    file: null,
    isUpload: false,
    isError: false,
    isLoading: false,
  });

  // App context for global states
  const appContext = useContext(AppContext);

  /**
   * Set the default current semester and assistant
   */
  useEffect(() => {
    setCurrentSemester(appContext.semesters[0]?.SemesterID);
    setCurrentAssistant(appContext.assistants[0]?.Username);
  }, [appContext.semesters, appContext.assistants]);

  /**
   * Function to read an excel file and display it as a table
   */
  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      dispatchFile({ type: "READ", file });
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const workbook = XLSX.read(bufferArray, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const data = XLSX.utils.sheet_to_json(worksheet);
        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise
      .then((data) => {
        const keys = Object.keys(data[0]);
        let cols = [];
        keys.forEach((key) => {
          cols.push({
            Header: key,
            accessor: key,
          });
        });
        setColumns(cols);
        setData(data);
        dispatchError({ type: "FETCHED" });
      })
      .catch((error) => {
        console.log(error);
        dispatchError({ type: "SET", message: "Something went wrong!" });
        dispatchFile({ type: "ERROR" });
      });
  };

  /**
   * Function to upload the excel file to firebase storage
   */
  const uploadFirebase = () => {
    dispatchFile({ type: "UPLOAD", isLoading: true });
    const fileRef = ref(
      storage,
      `/data/${currentAssistant}/${currentSemester}/PassingGrade.xlsx`
    );
    if (fileState.file == null) return;
    uploadBytes(fileRef, fileState.file).then((snapshot) => {
      dispatchFile({ type: "RESET" });
      alert("File Uploaded!");
    });
  };

  /**
   * Function to change the current semester from the dropdown menu
   */
  const changeSemester = (e) => {
    dispatchError({ type: "CLEAR" });
    setCurrentSemester(e.target.value);
  };

  /**
   * Function to change the current assistant from the dropdown menu
   */
  const changeAssistant = (e) => {
    dispatchError({ type: "CLEAR" });
    setCurrentAssistant(e.target.value);
  };

  /**
   * Function to download the excel file from the given ref
   */
  const fetchDataFirebase = () => {
    // Fetch current semester's data from firebase
    dispatchError({ type: "FETCHING" });
    const fileRef = ref(
      storage,
      `/data/${currentAssistant}/${currentSemester}/PassingGrade.xlsx`
    );
    getDownloadURL(fileRef)
      .then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.onload = (event) => {
          const blob = xhr.response;
          readExcel(blob);
        };
        xhr.open("GET", url);
        xhr.send();
      })
      .catch((error) => {
        console.log(error);
        dispatchError({ type: "SET", message: error.toString() });
        dispatchFile({ type: "ERROR" });
      });
  };

  /**
   * Function to automatically fetch the excel data from firebase everytime there is a change in the current semester or assistant
   */
  useEffect(() => {
    if (currentAssistant && currentSemester) {
      fetchDataFirebase();
    }
  }, [currentAssistant, currentSemester]);

  return (
    <Container className="py-5">
      <Row>
        <Col sm={9}>
          <h3>Student Passing Grade</h3>
        </Col>
        <Col sm={3} className="d-flex justify-content-end">
          <Button variant="secondary" href={PASSING_GRADE_TEMPLATE}>
            Download Template
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
      <Row className="my-2">
        <div className="mb-3">
          <label htmlFor="formFile" className="form-label">
            Upload Student Passing Grade Excel
          </label>
          <input
            className="form-control"
            type="file"
            id="upload"
            onChange={(e) => {
              const file = e.target.files[0];
              dispatchFile({ type: "UPLOAD", isLoading: false });
              readExcel(file);
            }}
          />
        </div>
      </Row>
      <Row>
        <h6>
          Showing {currentSemester} for {currentAssistant}
        </h6>
      </Row>
      <Row>
        <Col>
          {errorState.isLoading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : errorState.isError ? (
            <div className="alert alert-danger" role="alert">
              {errorState.message}
            </div>
          ) : (
            <Table data={data} columns={columns} />
          )}
        </Col>
      </Row>
      <Row className="my-2">
        <Col sm={12} className="d-flex justify-content-start">
          {fileState.isLoading ? (
            <Button variant="primary" disabled>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={uploadFirebase}
              disabled={!fileState.isUpload}
            >
              Upload Excel
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PassingGrade;
