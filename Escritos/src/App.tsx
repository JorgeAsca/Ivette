import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from './firebase';
import { Auth } from './Auth';
import { LoginPage } from './LoginPage/LoginPage'; 
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
  autor: string;
  autorFoto: string | null;
  likes: number;
  dislikes: number;
}

const AppHeader = ({ user }: { user: User | null }) => (
  <header className="app-header">
    <h1>Entre Páginas</h1>
    {/* Solo mostramos el componente Auth si hay un usuario */}
    {user && <Auth user={user} />}
  </header>
);

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
      setTextos([]);
    }

    return () => {
      unsubscribeAuth();
      unsubscribeTextos();
    };
  }, [user]);

  const handleEnviarTexto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoTexto.trim() === "" || !user) return;
    await addDoc(collection(db, "textos"), {
      contenido: nuevoTexto,
      autor: user.displayName || 'Anónimo',
      autorId: user.uid,
      autorFoto: user.photoURL || null,
      likes: 0,
      dislikes: 0,
      creadoEn: serverTimestamp(),
    });
    setNuevoTexto("");
  };

  const handleVotar = async (id: string, tipo: 'like' | 'dislike') => {
    const textoRef = doc(db, "textos", id);
    await updateDoc(textoRef, { [tipo === 'like' ? 'likes' : 'dislikes']: increment(1) });
  };

  // 1. Muestra un mensaje de "Cargando..." mientras se verifica la sesión
  if (cargando) {
    return <div className="loading-screen"><h1>Cargando...</h1></div>;
  }

  // 2. Si no hay usuario, muestra el componente LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // 3. Si hay un usuario, muestra la aplicación principal
  return (
    <div className="app-wrapper"> 
      <AppHeader user={user} />

      <div className="main-layout">
        <main className="feed-column">
          <section className="form-container">
            <form onSubmit={handleEnviarTexto}>
              <textarea
                value={nuevoTexto}
                onChange={(e) => setNuevoTexto(e.target.value)}
                placeholder={`¿En qué estás pensando, ${user.displayName?.split(' ')[0] || 'tú'}?`}
                rows={4}
                required
              />
              <button type="submit">Enviar</button>
            </form>
          </section>

          <section className="textos-lista">
            {textos.map((texto) => (
              <article key={texto.id} className="post-item">
                <div className="post-header">
                  <img 
                    src={texto.autorFoto || 'https://i.pravatar.cc/40'} 
                    alt={`Foto de ${texto.autor}`}
                    className="post-avatar"
                  />
                  <span className="post-author">{texto.autor}</span>
                </div>
                <p className="post-content">{texto.contenido}</p>
                <div className="post-actions">
                  <button onClick={() => handleVotar(texto.id, 'like')}>
                    👍 ({texto.likes})
                  </button>
                  <button onClick={() => handleVotar(texto.id, 'dislike')}>
                    👎 ({texto.dislikes})
                  </button>
                </div>
              </article>
            ))}
          </section>
        </main>

        <aside className="sidebar-column">
          <div className="sidebar-card">
            <h3>GÉNERO DE LECTURA</h3>
            <div className="genero-lista">
              <button>Inspiración</button>
              <button>Romance</button>
              <button>Mentalidad</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;