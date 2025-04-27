// Configuración de tu proyecto de Firebase (sacala desde Firebase Console)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "inasistapp.firebaseapp.com",
  projectId: "inasistapp",
  storageBucket: "inasistapp.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Inicializa Firebase si aún no está inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporta Firestore para usar en cualquier script
const db = firebase.firestore();
window.db = db;
