import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { INVOLVEMENT_TEMPLATE } from "../../Helpers/StaticLinks";
import * as XLSX from "xlsx";
import { useContext, useEffect, useReducer, useState } from "react";
import AppContext from "../../Helpers/AppContext";
import Table from "../../Components/Table";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../Firebase/firebase";

const Involvement = (props) => {
  // Uploaded file
  const [categoriesData, setCategoriesData] = useState([]);
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

        const data = XLSX.utils.sheet_to_html(worksheet);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise
      .then((data) => {
        var html = document.createElement("html");
        html.innerHTML = data;
        var body = html.getElementsByTagName("body")[0];
        var parentTable = body.querySelector("table");
        var tbody = parentTable.querySelector("tbody");
        var trs = tbody.querySelectorAll("tr");
        var categories = [];

        for (var i = 0; i < trs.length; i++) {
          if (trs[i].firstChild.getAttribute("data-v") === "Category") {
            // new category
            var category = {
              category: trs[i].children[1].innerHTML,
              source: trs[i + 1].children[1].innerHTML,
              data: [],
              tableHeaders: [],
            };
            i++;

            // Get the table header
            var j = i + 1;
            var tableHeaders = [];
            var ths = trs[j].querySelectorAll("td");

            for (var header = 0; header < ths.length; header++) {
              if (
                ths[header].innerHTML !== "" &&
                ths[header].innerHTML !== " " &&
                ths[header].innerHTML !== undefined
              ) {
                tableHeaders.push({
                  Header: ths[header].innerHTML,
                  accessor: ths[header].innerHTML,
                });
              }
            }
            category.tableHeaders = tableHeaders;
            // Get the table content
            j++;
            // Loop through all the table rows
            while (
              trs[j] &&
              trs[j].firstChild.getAttribute("data-v") !== "Category" &&
              trs[j].firstChild.hasAttribute("data-v")
            ) {
              var tds = trs[j].querySelectorAll("td");
              var row = {};
              for (var k = 0; k < tableHeaders.length; k++) {
                row[tableHeaders[k].Header] = tds[k].innerHTML;
              }
              category.data.push(row);
              j++;
            }
            categories.push(category);
          }
        }
        dispatchError({ type: "FETCHED" });
        setCategoriesData(categories);
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
      `/data/${currentAssistant}/${currentSemester}/Involvement.xlsx`
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
      `/data/${currentAssistant}/${currentSemester}/Involvement.xlsx`
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
          <h3>Involvement</h3>
        </Col>
        <Col sm={3} className="d-flex justify-content-end">
          <Button variant="secondary" href={INVOLVEMENT_TEMPLATE}>
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
            Upload Involvement Excel
          </label>
          <input
            className="form-control"
            type="file"
            id="upload"
            onChange={(e) => {
              const file = e.target.files[0];
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
      {categoriesData.map((category, idx) => (
        <Row key={idx}>
          <h4>{category.category}</h4>
          <h5>Data Source from {category.source}</h5>
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
              <Table data={category.data} columns={category.tableHeaders} />
            )}
          </Col>
        </Row>
      ))}
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

export default Involvement;
