/// <reference types="vite/client" />

interface Window {
  recaptchaVerifier: import('firebase/auth').RecaptchaVerifier;
}
