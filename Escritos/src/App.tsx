import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from './firebase';

import { Auth } from './Auth'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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
  

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, "textos"), orderBy("creadoEn", "desc"));
    const unsubscribeTextos = onSnapshot(q, (snapshot) => {
      const textosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Texto[];
      setTextos(textosData);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTextos();
    };
  }, []);

  const handleEnviarComentario = async (textoId: string, contenidoComentario: string) => {
    if (!user) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }
    
    console.log(`Comment on ${textoId}: ${contenidoComentario} by ${user.displayName}`);
  };

  

  return (
    <div className="app-container">
      <header>
        <h1>Plataforma de Textos</h1>
        <Auth user={user} />
      </header>
      {/* ... (rest of your JSX for displaying texts and forms) ... */}
    </div>
  );
}

export default App;