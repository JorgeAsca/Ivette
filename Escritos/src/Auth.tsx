// src/App.tsx
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth'; // Importa User
import { auth } from './firebase'; // Importa auth
import { Auth } from './Auth'; // Importa el nuevo componente

// ... (resto de tus importaciones e interfaz Texto)

function App() {
  const [user, setUser] = useState<User | null>(null); // Estado para el usuario
  const [textos, setTextos] = useState<Texto[]>([]);
  // ... (otros estados)

  // useEffect para escuchar los cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Guarda el usuario actual o null
    });
    return () => unsubscribe(); // Limpia la suscripción
  }, []);

  // ... (tu useEffect para cargar textos y tus funciones de handle)
  
  // Función para manejar el envío de un comentario (ejemplo)
  const handleEnviarComentario = async (textoId: string, contenidoComentario: string) => {
    if (!user) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }
    // Lógica para añadir el comentario a Firestore,
    // incluyendo user.uid y user.displayName
  };

  return (
    <div className="app-container">
      <header>
        <h1>Plataforma de Textos Anónimos</h1>
        {/* Añade el componente de autenticación en la cabecera */}
        <Auth user={user} />
      </header>

      {/* ... (tu formulario para crear textos) ... */}

      <div className="textos-lista">
        {textos.map((texto) => (
          <div key={texto.id} className="texto-item">
            {/* ... (contenido del texto y botones de me gusta) ... */}

            <div className="comentarios-seccion">
              <h4>Comentarios</h4>
              {/* Si el usuario ha iniciado sesión, muestra el formulario para comentar */}
              {user ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  // Llama a la función que guarda el comentario
                }}>
                  <input type="text" placeholder="Añade un comentario..." />
                  <button type="submit">Enviar</button>
                </form>
              ) : (
                <p>Inicia sesión para dejar un comentario.</p>
              )}
              {/* Aquí mostrarías la lista de comentarios */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;