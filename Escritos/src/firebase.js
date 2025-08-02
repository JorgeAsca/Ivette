import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase que copiaste antes
const firebaseConfig = {
  apiKey: "AIzaSyCMi_n0xpPEFB58yMInw_lAU-m_fkIe30k",
  authDomain: "escritos-80cf7.firebaseapp.com",
  projectId: "escritos-80cf7",
  storageBucket: "escritos-80cf7.firebasestorage.app",
  messagingSenderId: "716677446144",
  appId: "1:716677446144:web:11da961b62816ae0f2b6e5",
  measurementId: "G-TJ1NGVT3Q3"
};

const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);