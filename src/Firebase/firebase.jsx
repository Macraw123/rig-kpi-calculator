// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBewwVPDpfAPJeWh_LJerZjPgYGoq2ra3A",
  authDomain: "kpi-calculator-63664.firebaseapp.com",
  projectId: "kpi-calculator-63664",
  storageBucket: "kpi-calculator-63664.appspot.com",
  messagingSenderId: "517167511383",
  appId: "1:517167511383:web:cd48c2d96d510735923012",
  measurementId: "G-MDXRDRCNGT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export { storage, ref };
