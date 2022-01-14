import * as XLSX from "xlsx";

export const sortSemesterByEndDate = (semesters) => {
  semesters.sort((a, b) => {
    return new Date(a.End) - new Date(b.End);
  });
  return semesters;
};

export const getSemesterObjectByID = (semesters, id) => {
  return semesters.find((semester) => semester.SemesterID === id);
};

/**
 * Function to write an excel file and download it into the user's computer
 * @param {Array} data the actual data in JSON format
 * @param {Array} workSheetColumnNames the column names of the worksheet
 * @param {*} fileName the name of the file
 * @param {String} workSheetName the name of the worksheet
 */
export const writeExcel = (
  data,
  workSheetColumnNames,
  fileName = "export.xlsx",
  workSheetName = "Sheet1"
) => {
  const workBook = XLSX.utils.book_new();

  const workSheetData = [workSheetColumnNames, ...data];

  const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);

  XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName);

  XLSX.writeFile(workBook, fileName);
};

export const readExcel = (file) => {
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
  return promise;
};

/**
 * Get the assistant object by its ID
 * @param {*} assistants available assistants
 * @param {*} id assistant's ID
 * @returns assistant object
 */
export const getAssistantById = (assistants, id) => {
  for (let i = 0; i < assistants.length; i++) {
    if (assistants[i].UserId === id) {
      return assistants[i];
    }
  }
  return null;
};

/**
 * Get the assistant object by its username (initial)
 * @param {Array} assistants available assistants
 * @param {String} username assistant's username
 * @returns assistants object
 */
export const getAssistantByUsername = (assistants, username) => {
  for (let i = 0; i < assistants.length; i++) {
    if (assistants[i].Username === username) {
      return assistants[i];
    }
  }
  return null;
};

export const summaryColumns = [
  {
    Header: "Evidence",
    accessor: "Evidence",
  },
  {
    Header: "No",
    accessor: "No",
  },
  {
    Header: "Perspective",
    accessor: "Perspective",
  },
  {
    Header: "Goals",
    accessor: "Goals",
  },
  {
    Header: "KPI",
    accessor: "KPI",
  },
  {
    Header: "Measurement",
    accessor: "Measurement",
  },
  {
    Header: "Bobot",
    accessor: "Bobot",
  },
  {
    Header: "Target",
    accessor: "Target",
  },
  {
    Header: "Score 1",
    accessor: "Score 1",
  },
  {
    Header: "Score 2",
    accessor: "Score 2",
  },
  {
    Header: "Score 3",
    accessor: "Score 3",
  },
  {
    Header: "Score 4",
    accessor: "Score 4",
  },
  {
    Header: "Score 5",
    accessor: "Score 5",
  },
  {
    Header: "Score 6",
    accessor: "Score 6",
  },
  {
    Header: "Odd Semester",
    accessor: "Odd",
  },
  {
    Header: "Even Semester",
    accessor: "Even",
  },
  {
    Header: "Short Semester",
    accessor: "Short",
  },
  {
    Header: "Final Result",
    accessor: "Final Result",
  },
  {
    Header: "Score",
    accessor: "Score",
  },
];

export const summaryData = [
  {
    Evidence: "1",
    No: "1",
    Perspective: "Capability Building and Execution",
    Goals: "14. Operational Excellence (C2) ",
    KPI: "Academic & Operation Performance Index based on personal questionnaire evaluation (filled by students)",
    Measurement:
      "Calculation based on percentage of questionnaire result of Teaching Assistant >= 3 \n\nSemester = Odd : Even : Compact \nAspect Ratio KPI Score = 2 : 2 : 1 \neq. (2*6 + 2*4 + 1*4)/5 = 4.8 \n\nMethod: Cumulative \nTarget Type:Qualitative",
    Bobot: 0.1,
    Target: "80.00-84.99",
    "Score 1": "0.00-69.00",
    "Score 2": "70.00-74.99",
    "Score 3": "75.00-79.99",
    "Score 4": "80.00-84.99",
    "Score 5": "85.00-89.99",
    "Score 6": "90.00-100.00",
    Odd: {
      message: "-",
      weight: 2 / 5,
    },
    Even: {
      message: "-",
      weight: 2 / 5,
    },
    Short: {
      message: "-",
      weight: 1 / 5,
    },
    "Final Result": 0,
    Score: 0,
  },
  {
    Evidence: "2",
    No: "2",
    Perspective: "Capability Building and Execution",
    Goals: "14. Operational Excellence (C2) ",
    KPI: "Operation Performance Index (OPI) based on Ontime Case Making (Final Exam & Bank Case)",
    Measurement:
      "Calculation based on percentage of ontime case making \n\nSemester = Odd : Even : Compact \nAspect Ratio KPI Score = 1 : 1 : 1 \neq. (6+6+4)/3 = 5.3 \n\nMethod: Cumulative \nTarget Type:Qualitative",
    Bobot: 0.15,
    Target: "100% ontime",
    "Score 1": "0.00-84.99",
    "Score 2": "85.00-89.99",
    "Score 3": "90.00-94.99",
    "Score 4": "95.00-97.49",
    "Score 5": "97.50-99.99",
    "Score 6": "100.00-100.00",
    Odd: {
      message: "-",
      weight: 1 / 3,
    },
    Even: {
      message: "-",
      weight: 1 / 3,
    },
    Short: {
      message: "-",
      weight: 1 / 3,
    },
    "Final Result": 0,
    Score: 0,
  },
  {
    Evidence: "3",
    No: "3",
    Perspective: "Capability Building and Execution",
    Goals: "14. Operational Excellence (C2) ",
    KPI: "Operation Performance Index (OPI) based on Ontime Schedule of Evaluating (Assignment, Final Term, Project) and Marking Validity",
    Measurement:
      "Calculation based on number of score update after published and marking submision \n\nSemester = Odd : Even \nAspect Ratio KPI Score = 1 : 1 \neq. (6+5)/2 = 5.5 \n\nMethod: Cumulative \nTarget Type:Qualitative",
    Bobot: 0.15,
    Target: "100% ontime AND no update after publish",
    "Score 1":
      "<85% ontime OR > 3 updates after published OR >= 1 update after the closing report finished",
    "Score 2": ">= 85% ontime OR 2-3 update after published",
    "Score 3": ">= 90% ontime OR 1 update after publish",
    "Score 4": " >= 95% ontime AND no update after publish",
    "Score 5": ">= 97.5% ontime AND no update afer publish",
    "Score 6": "100% ontime AND no update after publish",
    Odd: {
      message: "-",
      weight: 1 / 2,
    },
    Even: {
      message: "-",
      weight: 1 / 2,
    },
    Short: {
      message: "-",
      weight: 0,
    },
    "Final Result": 0,
    Score: 0,
  },
  {
    Evidence: "4",
    No: "4",
    Perspective: "Capability Building and Execution",
    Goals: "14. Operational Excellence (C2) ",
    KPI: "Operation Performance Index (OPI) based on Teaching Attendance and Teaching Absence",
    Measurement:
      "Calculation based on number of teaching attendance and teaching absence \n\nSemester = Odd : Even : Compact \nAspect Ratio KPI Score = 1 : 1 : 1 \neq. (6+6+4)/3 = 5.3 \n\nMethod: Cumulative \nTarget Type:Qualitative",
    Bobot: 0.15,
    Target: "100% attend AND No Absence",
  },
  {
    Evidence: "5",
    No: "5",
    Perspective: "Capability Building and Execution",
    Goals: "14. Operational Excellence (C2) ",
    KPI: "Academic & Operation Performance Index based on personal questionnaire evaluation (filled by students)",
    Measurement:
      "Calculation based on percentage of questionnaire result of Teaching Assistant >= 3 \n\nSemester = Odd : Even : Compact \nAspect Ratio KPI Score = 2 : 2 : 1 \neq. (2*6 + 2*4 + 1*4)/5 = 4.8 \n\nMethod: Cumulative \nTarget Type:Qualitative",
    Bobot: 0.1,
    Target: "80.00-84.99",
    "Score 1": "0.00-69.00",
    "Score 2": "70.00-74.99",
    "Score 3": "75.00-79.99",
    "Score 4": "80.00-84.99",
    "Score 5": "85.00-89.99",
    "Score 6": "90.00-100.00",
    Odd: {
      message: "-",
      weight: 2 / 5,
    },
    Even: {
      message: "-",
      weight: 2 / 5,
    },
    Short: {
      message: "-",
      weight: 1 / 5,
    },
    "Final Result": 0,
    Score: 0,
  },
  {
    Evidence: "6",
    No: "6",
    Perspective: "Capability Building and Execution",
    Goals: "14. Operational Excellence (C2) ",
    KPI: "Academic & Operation Performance Index based on personal questionnaire evaluation (filled by students)",
    Measurement:
      "Calculation based on percentage of questionnaire result of Teaching Assistant >= 3 \n\nSemester = Odd : Even : Compact \nAspect Ratio KPI Score = 2 : 2 : 1 \neq. (2*6 + 2*4 + 1*4)/5 = 4.8 \n\nMethod: Cumulative \nTarget Type:Qualitative",
    Bobot: 0.1,
    Target: "80.00-84.99",
    "Score 1": "0.00-69.00",
    "Score 2": "70.00-74.99",
    "Score 3": "75.00-79.99",
    "Score 4": "80.00-84.99",
    "Score 5": "85.00-89.99",
    "Score 6": "90.00-100.00",
    Odd: {
      message: "-",
      weight: 2 / 5,
    },
    Even: {
      message: "-",
      weight: 2 / 5,
    },
    Short: {
      message: "-",
      weight: 1 / 5,
    },
    "Final Result": 0,
    Score: 0,
  },
  {
    Evidence: "7",
    No: "7",
    Perspective: "Recognition",
    Goals: "10. Academic Satisfaction & Stakeholder Satisfaction (R4)",
    KPI: "Student Passing Grade for Practicum Course",
    Measurement:
      "Calculation based on percentage of student passing grade \n\nSemester = Odd : Even \nAspect Ratio KPI Score = 1 : 1 \neq. (6+5)/2 = 5.5 \n\nMethod: Cumulative \nTarget Type:Qualitative",
    Bobot: 0.1,
    Target: "75.00-79.99",
    "Score 1": "0.00-19.00",
    "Score 2": "20.00-39.99",
    "Score 3": "40.00-74.99",
    "Score 4": "75.00-79.99",
    "Score 5": "80.00-84.99",
    "Score 6": "85.00-100.00",
    Odd: {
      message: "-",
      weight: 1 / 2,
    },
    Even: {
      message: "-",
      weight: 1 / 2,
    },
    Short: {
      message: "-",
      weight: 0,
    },
    "Final Result": 0,
    Score: 0,
  },
];

// Get the last 10 years and store it in an array
export const getLast10Years = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 10; i++) {
    years.push(currentYear - i - 1);
  }
  return years;
};

/**
 * Function to get the given semester's ID
 */
export const getSemesterId = (semesters, semester) => {
  for (let i = 0; i < semesters.length; i++) {
    if (semesters[i].Description === semester) {
      return semesters[i].SemesterID;
    }
  }
};

export const getSemesterName = (semesters, semesterId) => {
  for (let i = 0; i < semesters.length; i++) {
    if (semesters[i].SemesterID === semesterId) {
      return semesters[i].Description;
    }
  }
};

/**
 * Function to get the previous 3 semesters from the inputted year.
 * For example, year = 2021, semesters = [Odd Semester 2020/2021, Even Semester 2020/2021, Short Semester 2021]
 * @param {Int} year
 */
export const getSemestersIds = (semesters, year) => {
  const prev = year - 1;
  const semestersName = [
    `Odd Semester ${prev}/${year}`,
    `Even Semester ${prev}/${year}`,
    `Short Semester ${year}`,
  ];
  const semesterIds = [];
  for (let i = 0; i < semestersName.length; i++) {
    semesterIds.push({
      Description: semestersName[i],
      SemesterID: getSemesterId(semesters, semestersName[i]),
    });
  }
  return semesterIds;
};

export const getSemesterCategoryById = (semesters, semesterId) => {
  if (getSemesterName(semesters, semesterId)?.includes("Odd")) {
    return "Odd";
  } else if (getSemesterName(semesters, semesterId)?.includes("Even")) {
    return "Even";
  } else if (getSemesterName(semesters, semesterId)?.includes("Short")) {
    return "Short";
  }
  return undefined;
};
