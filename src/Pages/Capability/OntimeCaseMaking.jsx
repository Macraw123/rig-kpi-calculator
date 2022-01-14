import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { useContext, useEffect, useReducer, useState } from "react";
import AppContext from "../../Helpers/AppContext";
import { getOntimeCaseMaking } from "../../Auth/Laboratory";
import InteractiveTable from "../../Components/InteractiveTable";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../Firebase/firebase";
import * as XLSX from "xlsx";
import { getAssistantById, writeExcel } from "../../Helpers/Helpers";

const OntimeCaseMaking = () => {
  // File parameter
  const [currentSemester, setCurrentSemester] = useState("");
  const [currentAssistant, setCurrentAssistant] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [ontimeCasemaking, setOntimeCasemaking] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Reducer for handling the state of the table in relation with Firebase Storage
   * Firebase ==> web app
   */
  const errorReducer = (state, action) => {
    if (action.type === "SET") {
      return {
        message: action.message,
        isError: true,
        isLoading: false,
        isExists: state.isExists,
      };
    }
    if (action.type === "FETCHING") {
      return {
        message: null,
        isError: false,
        isLoading: true,
        isExists: false,
      };
    }
    if (action.type === "FETCHED FIREBASE") {
      return {
        message: null,
        isError: false,
        isLoading: false,
        isExists: true,
      };
    }
    if (action.type === "FETCHED MESSIER") {
      return {
        message: null,
        isError: false,
        isLoading: false,
        isExists: false,
      };
    }
    if (action.type === "RESET") {
      return {
        message: null,
        isError: false,
        isLoading: false,
        isExists: false,
      };
    }
    if (action.type === "UPLOADED") {
      return {
        message: null,
        isError: false,
        isLoading: false,
        isExists: true,
      };
    }
    return { message: null, isError: false, isLoading: false, isExists: false };
  };

  const [errorState, dispatchError] = useReducer(errorReducer, {
    message: null,
    isError: false,
    isLoading: true,
    isExists: false,
  });

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

  // currentSemester = "81fbcf76-7fe7-424c-9f53-990e2051f137";
  // App context for global states
  const appContext = useContext(AppContext);

  /**
   * Function to change the current assistant from the dropdown menu
   */
  const changeAssistant = (e) => {
    console.log(e.target.value);
    setCurrentAssistant(e.target.value);
    setCurrentUsername(
      getAssistantById(appContext.assistants, e.target.value).Username
    );
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
      setCurrentSemester(appContext.semesters[0].SemesterID);
      setCurrentAssistant(appContext.assistants[0].UserId);
      setCurrentUsername(
        getAssistantById(appContext.assistants, appContext.assistants[0].UserId)
          .Username
      );
      fetchDataFirebase();
    }
  }, [appContext]);

  /**
   * Everytime the current semester or current assistant change, we're going to fetch new data from Firebase
   */
  useEffect(() => {
    fetchDataFirebase();
  }, [currentSemester, currentAssistant]);

  const getSummaryData = async (semesterId, assistantId) => {
    setCurrentSemester(semesterId);
    setCurrentAssistant(assistantId);
    setCurrentUsername(getAssistantById(appContext.assistants, assistantId));
    const result = await fetchDataFirebase();
    console.log(result);
    return result;
  };

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
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
        console.log(data);
        setOntimeCasemaking(data);
        // ---------------------------------------------------------------------------
        // This is the data that we can send to the summary
        // ---------------------------------------------------------------------------
      })
      .catch((error) => {
        console.log(error);
        dispatchError({ type: "SET", message: "Something went wrong!" });
        dispatchFile({ type: "ERROR" });
      });
  };

  /**
   * Function to upload the file to Firebase Storage
   */
  const fetchDataFirebase = async () => {
    // Fetch current semester's data from firebase
    if (currentSemester && currentAssistant && currentUsername && !isLoading) {
      dispatchError({ type: "FETCHING" });
      const fileRef = ref(
        storage,
        `/data/${currentUsername}/${currentSemester}/OntimeCaseMaking.xlsx`
      );
      getDownloadURL(fileRef)
        .then((url) => {
          // ---------------------------------------------------------------------------
          // File exists in Firebase Storage so we're going to use that data
          // ---------------------------------------------------------------------------
          const xhr = new XMLHttpRequest();
          xhr.responseType = "blob";
          xhr.onload = (event) => {
            const blob = xhr.response;
            readExcel(blob);
          };
          xhr.open("GET", url);
          xhr.send();
          dispatchError({ type: "FETCHED FIREBASE" });
        })
        .catch((error) => {
          console.log("There is no data in Firebase Storage");
          // ---------------------------------------------------------------------------
          // If there is no data in Firebase storage or data is unreachable
          // ---------------------------------------------------------------------------
          fetchDataMessier();
        });
    }
  };

  /**
   * Function to upload the excel file to firebase storage
   */
  const uploadFirebase = () => {
    console.log("upload firebase");
    // Set the file to the current data
    readExcel(fileState.file);
    dispatchFile({ type: "UPLOAD", isLoading: true });
    dispatchError({ type: "UPLOADED" });
    if (currentAssistant !== undefined && currentUsername && currentSemester) {
      const fileRef = ref(
        storage,
        `/data/${currentUsername}/${currentSemester}/OntimeCaseMaking.xlsx`
      );
      uploadBytes(fileRef, fileState.file).then((snapshot) => {
        dispatchFile({ type: "RESET" });
        alert("File Uploaded!");
      });
    }
  };

  /**
   * Function to fetch data from Messier
   */
  const fetchDataMessier = async () => {
    if (!isLoading) {
      setIsLoading(true);
      const response = await getOntimeCaseMaking(
        currentAssistant,
        currentSemester
      );
      console.log(response.data.length);
      if (response.data.length > 0) {
        console.log(response.data);
        // ---------------------------------------------------------------------------
        // This is the data that we can send to the summary
        // ---------------------------------------------------------------------------
        setOntimeCasemaking(response.data);
        dispatchError({ type: "FETCHED MESSIER" });
        setIsLoading(false);
      } else {
        console.log("no data");
        dispatchError({ type: "SET", message: "There is not data" });
        dispatchFile({ type: "ERROR" });
        setIsLoading(false);
      }
    }
  };

  const removeFirebase = () => {
    const fileRef = ref(
      storage,
      `/data/${currentUsername}/${currentSemester}/OntimeCaseMaking.xlsx`
    );
    deleteObject(fileRef)
      .then(() => {
        console.log("File deleted");
        dispatchError({ type: "RESET" });
        fetchDataFirebase();
      })
      .catch(() => {
        console.log("File not deleted");
      });
  };

  /**
   * Function to download the excel file
   */
  const downloadTable = () => {
    const data = ontimeCasemaking.map((row) => {
      return Object.values(row);
    });

    writeExcel(data, Object.keys(ontimeCasemaking[0]), "OntimeCaseMaking.xlsx");
  };

  /**
   * Function to update the Editable cell
   */
  const updateMyData = (rowIndex, columnId, value) => {
    ontimeCasemaking[rowIndex][columnId] = value;
  };

  const columns = [
    {
      Header: "Subject",
      accessor: "CourseName",
    },
    {
      Header: "Variation",
      accessor: "Variation",
    },
    {
      Header: "Type",
      accessor: "Type",
    },
    {
      Header: "Case Maker",
      accessor: "CaseMaker",
    },
    {
      Header: "Start Date",
      accessor: "StartDate",
    },
    {
      Header: "Deadline",
      accessor: "EndDate",
    },
    {
      Header: "Last Submit",
      accessor: "LastSubmitDate",
    },
    {
      Header: "Approve Date",
      accessor: "FinishDate",
    },
    {
      Header: "Status",
      accessor: "Status",
    },
    {
      Header: "Overdue",
      accessor: "Deadline",
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
          <h3>Ontime Case Making</h3>
        </Col>
        <Col sm={3} className="d-flex justify-content-end">
          <Button
            variant="primary"
            onClick={removeFirebase}
            disabled={!errorState.isExists}
          >
            Remove Current Data
          </Button>
        </Col>
      </Row>
      <Row className="my-4">
        <Col sm={6}>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={changeAssistant}
            value={currentAssistant}
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
      <Row className="my-2">
        <Col className="mb-3" sm={6}>
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
              dispatchFile({ type: "READ", file });
            }}
          />
        </Col>
        <Col className="mb-3" sm={6}>
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
      <Row>
        <h4>
          Showing {currentAssistant} on {currentSemester}
        </h4>
      </Row>
      <Row>
        <Col sm={12}>
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
            <>
              <InteractiveTable
                columns={columns}
                data={ontimeCasemaking}
                updateMyData={updateMyData}
              />
              <Button variant="primary" onClick={downloadTable}>
                Download This Table
              </Button>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default OntimeCaseMaking;
