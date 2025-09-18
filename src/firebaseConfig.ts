import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Votre configuration Firebase personnelle
const firebaseConfig = {
    apiKey: "AIzaSyDnUpo-mrracQlWUJ_hw8OK8puilzYw96Y",
    authDomain: "syndic-46fsm.firebaseapp.com",
    projectId: "syndic-46fsm",
    storageBucket: "syndic-46fsm.appspot.com",
    messagingSenderId: "594650112863",
    appId: "1:594650112863:web:93a4d832c56a76ef638cea"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Exporte l'instance d'authentification pour être utilisée dans d'autres fichiers
export const auth = getAuth(app);