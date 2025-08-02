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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // You need to define handleEnviarTexto and handleVotar functions here
  const handleEnviarTexto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoTexto.trim() === "") return;
    await addDoc(collection(db, "textos"), {
      contenido: nuevoTexto,
      likes: 0,
      dislikes: 0,
      creadoEn: new Date()
    });
    setNuevoTexto("");
  };

  const handleVotar = async (id: string, tipo: 'like' | 'dislike') => {
    const textoRef = doc(db, "textos", id);
    await updateDoc(textoRef, {
      [tipo === 'like' ? 'likes' : 'dislikes']: increment(1)
    });
  };

  return (
    <div className="app-container">
      <header>
        <h1>Plataforma de Textos Anónimos</h1>
        <p>Escribe un poema, un pensamiento o una historia corta.</p>
      </header>

      <form onSubmit={handleEnviarTexto} className="form-container">
        <textarea
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          placeholder="Escribe algo aquí..."
          rows={4}
        />
        <button type="submit">Enviar</button>
      </form>

      <div className="textos-lista">
        {textos.map(texto => (
          <div key={texto.id} className="texto-item">
            <p className="texto-contenido">{texto.contenido}</p>
            <div className="acciones">
              <button onClick={() => handleVotar(texto.id, 'like')}>
                👍 Me gusta ({texto.likes})
              </button>
              <button onClick={() => handleVotar(texto.id, 'dislike')}>
                👎 No me gusta ({texto.dislikes})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
}

export default App;