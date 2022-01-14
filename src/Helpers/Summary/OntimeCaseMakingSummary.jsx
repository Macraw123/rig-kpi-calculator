import { useContext, useEffect, useReducer, useState } from "react";
import { getOntimeCaseMaking } from "../../Auth/Laboratory";
import AppContext from "../AppContext";
import { getAssistantById } from "../Helpers";
import * as XLSX from "xlsx";
import { getDownloadURL, ref, updateMetadata } from "firebase/storage";
import { storage } from "../../Firebase/firebase";

const OntimeCaseMakingSummary = (props) => {
  // File parameter
  const [currentSemester, setCurrentSemester] = useState(props.currentSemester);
  const [currentAssistant, setCurrentAssistant] = useState(
    props.currentAssistantId
  );
  const [currentUsername, setCurrentUsername] = useState(
    props.currentAssistantUsername
  );
  const [ontimeCasemaking, setOntimeCasemaking] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

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
        isExists: false,
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
        isExists: true,
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
    return { message: null, isError: false, isLoading: false, isExists: false };
  };

  const [errorState, dispatchError] = useReducer(errorReducer, {
    message: null,
    isError: false,
    isLoading: true,
    isExists: true,
  });

  /**
   * Set the default current semester and assistant
   */
  useEffect(() => {
    setCurrentSemester(props.currentSemester);
    setCurrentAssistant(props.currentAssistantId);
    setCurrentUsername(props.currentAssistantUsername);
    fetchDataFirebase();
  }, [props]);

  /**
   * Everytime the current semester or current assistant change, we're going to fetch new data from Firebase
   */
  useEffect(() => {
    fetchDataFirebase();
  }, [currentSemester, currentAssistant]);

  const computeKPIScore = (percentage) => {
    if (percentage < 85) return 1;
    if (percentage < 90) return 2;
    if (percentage < 95) return 3;
    if (percentage < 97.5) return 4;
    if (percentage < 100) return 5;
    if (percentage === 100) return 6;
  };

  useEffect(() => {
    let res = {
      message: "-",
      score: 0,
    };
    if (ontimeCasemaking.length > 0) {
      let deadline = 0;
      for (let i = 0; i < ontimeCasemaking.length; i++) {
        if (ontimeCasemaking[i].Deadline) deadline++;
      }
      const percentage =
        ((ontimeCasemaking.length - deadline) / ontimeCasemaking.length) * 100;

      res = {
        message: `${percentage}% Ontime Case Making`,
        score: computeKPIScore(percentage),
      };
      setResult(res);
    } else {
      setResult(res);
    }
    props.updateData(
      res,
      currentSemester,
      currentAssistant,
      "OntimeCaseMaking"
    );
  }, [ontimeCasemaking]);

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
        dispatchError({ type: "FETCHED FIREBASE" });
        // ---------------------------------------------------------------------------
        // This is the data that we can send to the summary
        // ---------------------------------------------------------------------------
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /**
   * Function to upload the file to Firebase Storage
   */
  const fetchDataFirebase = async () => {
    // Fetch current semester's data from firebase
    if (currentUsername && currentUsername && !isLoading) {
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
          // dispatchError({ type: "FETCHED FIREBASE" });
        })
        .catch((error) => {
          // ---------------------------------------------------------------------------
          // If there is no data in Firebase storage or data is unreachable
          // ---------------------------------------------------------------------------
          fetchDataMessier();
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
      if (response.data.length > 0) {
        // ---------------------------------------------------------------------------
        // This is the data that we can send to the summary
        // ---------------------------------------------------------------------------
        setOntimeCasemaking(response.data);
        dispatchError({ type: "FETCHED MESSIER" });
        setIsLoading(false);
      } else {
        console.log("no data");
        dispatchError({ type: "RESET" });
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {errorState.isLoading ? (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : errorState.isExists ? (
        <p>
          {result?.message}
          <br />
          {result?.score}{" "}
        </p>
      ) : (
        <p>-</p>
      )}
    </>
  );
};

export default OntimeCaseMakingSummary;
