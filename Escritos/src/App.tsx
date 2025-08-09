import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { LoginPage } from './LoginPage/LoginPage';
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


interface Texto {
  id: string;
  contenido: string;
  likes: number;
  dislikes: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [cargando, setCargando] = useState(true);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCargando(false);
    });

    let unsubscribeTextos = () => {};
    // Si hay un usuario, nos conectamos a firestore para leer los textos.
    if (user) {
      const q = query(collection(db, "textos"), orderBy("creadoEn", "desc"));
      unsubscribeTextos = onSnapshot(q, (snapshot) => {
        const textosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Texto[];
        setTextos(textosData);
      });
    } else {
      // Si el usuario cierra sesión, limpiamos la lista de textos.
      setTextos([]);
    }

    // La función de limpieza que se ejecuta al final.
    return () => {
      unsubscribeAuth();
      unsubscribeTextos();
    };
  }, [user]); // Se ejecuta cada vez que el estado 'user' cambia.

  // Función para enviar un nuevo texto a Firestore
  const handleEnviarTexto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoTexto.trim() === "" || !user) return;

    await addDoc(collection(db, "textos"), {
      contenido: nuevoTexto,
      autor: user.displayName || 'Anónimo',
      autorId: user.uid,
      likes: 0,
      dislikes: 0,
      creadoEn: serverTimestamp(),
    });

    setNuevoTexto("");
  };

  // Función para votar (like o dislike)
  const handleVotar = async (id: string, tipo: 'like' | 'dislike') => {
    const textoRef = doc(db, "textos", id);
    const fieldToUpdate = tipo === 'like' ? 'likes' : 'dislikes';
    await updateDoc(textoRef, {
      [fieldToUpdate]: increment(1)
    });
  };

  // Condición de carga inicial
  if (cargando) {
      return <div className="app-container"><h1>Cargando...</h1></div>
  }

  // --- LÓGICA DE RENDERIZADO CORREGIDA ---
  // Si NO hay usuario, muestra la pantalla de Login.
  if (!user) {
    return <LoginPage />;
  }

  // Si SÍ hay un usuario, muestra la aplicación principal.
  return (
    <div className="app-container">
      <header>
        <h1>Plataforma de Textos</h1>
        {/* Usamos el componente Auth para mostrar el nombre y el botón de salir */}
        <Auth user={user} />
      </header>

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
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;