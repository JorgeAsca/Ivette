// src/Auth.tsx
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// Use a type-only import for 'User'
import type { User } from 'firebase/auth';
import { auth } from './firebase';

interface AuthProps {
  user: User | null;
}

const provider = new GoogleAuthProvider();

// Add the 'export' keyword here
export function Auth({ user }: AuthProps) {
  const handleSignIn = () => {
    signInWithPopup(auth, provider).catch((error) => console.error(error));
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error(error));
  };

  return (
    <div className="auth-container">
      {user ? (
        <>
          <span>Hola, {user.displayName}</span>
          <button onClick={handleSignOut}>Cerrar Sesión</button>
        </>
      ) : (
        <button onClick={handleSignIn}>Iniciar sesión con Google para comentar</button>
      )}
    </div>
  );
}