// src/App.tsx

// 1. Ya no necesitas importar React en los nuevos archivos de React.
// import React, { useState, useEffect } from 'react'; (Elimina 'React')
import { useState, useEffect } from 'react';

// 2. 'getDocs' no se estaba usando, lo eliminamos. El resto sí.
import { collection, addDoc, doc, updateDoc, increment, onSnapshot, query, orderBy } from 'firebase/firestore';

// 3. Asegúrate de que la importación ahora apunta a 'firebase.ts' (aunque no necesitas escribir la extensión).
import { db } from './firebase'; 
import './App.css'; 

// 4. (MUY IMPORTANTE) Define la estructura de tus datos.
interface Texto {
  id: string;
  contenido: string;
  likes: number;
  dislikes: number;
  // Puedes añadir más campos si los tienes, como 'creadoEn'.
}

function App() {
  // 5. Usa la interfaz 'Texto' para decirle a useState qué tipo de array va a manejar.
  const [textos, setTextos] = useState<Texto[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState("");

  useEffect(() => {
    const q = query(collection(db, "textos"), orderBy("creadoEn", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const textosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      // 6. Haz una aserción de tipo para que TypeScript confíe en que los datos de Firestore
      //    coinciden con tu interfaz 'Texto'.
      })) as Texto[];
      setTextos(textosData);
    });

    return () => unsubscribe();
  }, []);

  // El resto de tu código de funciones (handleEnviarTexto, handleVotar)
  // y el JSX de 'return' pueden permanecer igual.
  
  // ... (resto de tu código)
}

export default App;