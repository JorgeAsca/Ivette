import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from './firebase';
import { Auth } from './Auth';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import './App.css';

// Define la estructura de un texto
interface Texto {
  id: string;
  contenido: string;
  likes: number;
  dislikes: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState(""); // Estado para el formulario

  // Efecto para cargar datos y manejar autenticación
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, "textos"), orderBy("creadoEn", "desc"));
    const unsubscribeTextos = onSnapshot(q, (snapshot) => {
      const textosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Texto[];
      setTextos(textosData);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTextos();
    };
  }, []);

  // Función para enviar un nuevo texto a Firestore
  const handleEnviarTexto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoTexto.trim() === "") return;

    await addDoc(collection(db, "textos"), {
      contenido: nuevoTexto,
      likes: 0,
      dislikes: 0,
      creadoEn: serverTimestamp(), // Usa la hora del servidor
    });

    setNuevoTexto(""); // Limpia el campo de texto
  };

  // Función para votar (like o dislike)
  const handleVotar = async (id: string, tipo: 'like' | 'dislike') => {
    const textoRef = doc(db, "textos", id);
    const fieldToUpdate = tipo === 'like' ? 'likes' : 'dislikes';
    await updateDoc(textoRef, {
      [fieldToUpdate]: increment(1)
    });
  };

  // Función para enviar un comentario
  const handleEnviarComentario = async (textoId: string, contenidoComentario: string) => {
    if (!user) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }
    // Aquí iría la lógica para guardar el comentario en Firestore
    console.log(`Comentario en ${textoId}: ${contenidoComentario} por ${user.displayName}`);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Plataforma de Textos</h1>
        <Auth user={user} />
      </header>

      {/* Formulario para enviar nuevos textos */}
      <form onSubmit={handleEnviarTexto} className="form-container">
        <textarea
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          placeholder="Escribe algo aquí..."
          rows={4}
          required
        />
        <button type="submit">Enviar</button>
      </form>

      {/* Lista de textos publicados */}
      <div className="textos-lista">
        {textos.map((texto) => (
          <div key={texto.id} className="texto-item">
            <p className="texto-contenido">{texto.contenido}</p>
            
            <div className="acciones">
              <button onClick={() => handleVotar(texto.id, 'like')}>
                👍 ({texto.likes})
              </button>
              <button onClick={() => handleVotar(texto.id, 'dislike')}>
                👎 ({texto.dislikes})
              </button>
            </div>

            <div className="comentarios-seccion">
              <h4>Comentarios</h4>
              {user ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('comentario') as HTMLInputElement;
                  handleEnviarComentario(texto.id, input.value);
                  form.reset();
                }}>
                  <input name="comentario" type="text" placeholder="Añade un comentario..." required />
                  <button type="submit">Enviar</button>
                </form>
              ) : (
                <p>Inicia sesión para poder comentar.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;