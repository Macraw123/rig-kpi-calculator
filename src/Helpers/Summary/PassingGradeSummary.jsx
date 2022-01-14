import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import Table from "../../Components/Table";
import { PASSING_GRADE_TEMPLATE } from "../../Helpers/StaticLinks";
import * as XLSX from "xlsx";
import { useContext, useEffect, useReducer, useState } from "react";
import { storage, ref } from "../../Firebase/firebase";
import { getDownloadURL, uploadBytes } from "firebase/storage";

import AppContext from "../../Helpers/AppContext";

const PassingGradeSummary = (props) => {
  // Uploaded file
  const [data, setData] = useState([]);
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(props.currentSemester);
  const [currentAssistant, setCurrentAssistant] = useState(
    props.currentAssistant
  );

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

  useEffect(() => {
    let res = {
      message: "-",
      score: 0,
    };
    console.log(data);
    if (data.length > 0) {
      console.log(data);
    }
  }, [data]);

  /**
   * Function to read an excel file and display it as a table
   */
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
        const keys = Object.keys(data[0]);
        let cols = [];
        keys.forEach((key) => {
          cols.push({
            Header: key,
            accessor: key,
          });
        });
        console.log("set data");
        setData(data);
        dispatchError({ type: "FETCHED" });
      })
      .catch((error) => {
        console.log(error);
        dispatchError({ type: "SET", message: "Something went wrong!" });
      });
  };

  /**
   * Function to download the excel file from the given ref
   */
  const fetchDataFirebase = () => {
    // Fetch current semester's data from firebase
    console.log(currentAssistant);
    console.log(currentSemester);
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
    <>
      {errorState.isLoading ? (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : !errorState.isError ? (
        <p>
          {/* {result?.message}
          <br />
          {result?.score}{" "} */}
        </p>
      ) : (
        <p>-</p>
      )}
    </>
  );
};

export default PassingGradeSummary;
