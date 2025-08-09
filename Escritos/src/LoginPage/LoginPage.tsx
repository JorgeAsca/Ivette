import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './LoginPage.css';

const SignUpModal = ({ onClose }: { onClose: () => void }) => {
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [username, setUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [modalError, setModalError] = useState('');

  // Función de registro actualizada
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    // --- PASO 1: Validaciones del formulario ---
    if ([nombre, apellido, username, newEmail, newPassword, confirmPassword].some(field => field === '')) {
      setModalError('Todos los campos son obligatorios.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      // Crear el usuario en Firebase Authentication ---
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      const user = userCredential.user;
      console.log('Usuario creado en Auth:', user.uid);

      // Actualizar el perfil de Auth con el nombre completo ---
      await updateProfile(user, {
        displayName: `${nombre} ${apellido}`
      });

      // guardando la información extra en FIREBASE
      // Usamos el UID del usuario como ID del documento en la colección 'users'
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        nombre,
        apellido,
        username,
        email: newEmail.toLowerCase(),
        autorFoto: user.photoURL || null, // Se guarda el email en minúsculas para facilitar búsquedas
        creadoEn: serverTimestamp()
      });

      console.log('Datos del usuario guardados en Firestore.');
      // El registro fue exitoso, cerramos el modal y App.tsx se encargará de redirigir
      onClose();

    } catch (err: any) {
      console.error("Error en el registro:", err);
      if (err.code === 'auth/email-already-in-use') {
        setModalError('Este correo electrónico ya está en uso.');
      } else {
        setModalError('Ocurrió un error al crear la cuenta.');
      }
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2>Crear una cuenta nueva</h2>
        <p>Es rápido y fácil.</p>
        <form onSubmit={handleSignUp} className="login-form">
          <div style={{display: 'flex', gap: '1rem'}}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          </div>
          <input type="text" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Correo electrónico" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña nueva" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          
          {modalError && <p className="error-message">{modalError}</p>}
          <button type="submit" className="btn-create" style={{width: '100%', marginTop: '1rem'}}>
            Registrarte
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Componente Principal de la Página de Login (Sin cambios) ---
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const provider = new GoogleAuthProvider();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err: any) { setError('El correo o la contraseña son incorrectos.'); }
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider).catch((err) => console.error(err));
  };

  return (
    <>
      <div className="login-page-container">
        <div className="login-promo"><h1>Escritos</h1><p>Comparte tus ideas, pensamientos e historias con el mundo de forma anónima y segura.</p></div>
        <div className="login-card">
          <form onSubmit={handleSignIn} className="login-form">
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn-login">Iniciar sesión</button>
          </form>
          <hr />
          <button onClick={() => setIsModalOpen(true)} className="btn-create">Crear cuenta nueva</button>
          <p style={{margin: "1rem 0"}}>o</p>
          <button onClick={handleGoogleSignIn} className="btn-google">Continuar con Google</button>
        </div>
      </div>
      {isModalOpen && <SignUpModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}