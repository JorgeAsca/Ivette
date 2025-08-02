// src/App.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, increment, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase'; 
import './App.css'; 

function App() {
  const [textos, setTextos] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState("");

  // useEffect para cargar los textos al iniciar y escuchar cambios
  useEffect(() => {
    const q = query(collection(db, "textos"), orderBy("creadoEn", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const textosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTextos(textosData);
    });

    return () => unsubscribe(); // Limpiar la suscripción al desmontar
  }, []);

  // Función para añadir un nuevo texto
  const handleEnviarTexto = async (e) => {
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

  // Función para votar
  const handleVotar = async (id, tipo) => {
    const textoRef = doc(db, "textos", id);
    if (tipo === 'like') {
      await updateDoc(textoRef, {
        likes: increment(1)
      });
    } else {
      await updateDoc(textoRef, {
        dislikes: increment(1)
      });
    }
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
          rows="4"
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

export default App;