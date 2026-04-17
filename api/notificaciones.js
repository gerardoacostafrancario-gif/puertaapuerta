const VAPID_KEY = 'BKQtBvAeYGRxaL9_UQKOBDtIuJex4ajlKyYM8w9GZZKOcbThtfWsIIAU2I57LilhrH_DFgxlkXh0BAeg_EsFCwA';

const firebaseConfig = {
  apiKey: "AIzaSyAdRnQQ-ZlZnZLEqbH0rNc5CExwWxMkVdE",
  authDomain: "puerta-a-puerta-dc67c.firebaseapp.com",
  projectId: "puerta-a-puerta-dc67c",
  storageBucket: "puerta-a-puerta-dc67c.firebasestorage.app",
  messagingSenderId: "685654039640",
  appId: "1:685654039640:web:28f9f623c7642a4ef87e2d"
};

async function inicializarNotificaciones(userId, rol) {
  try {
    // Registrar service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registrado');

    // Importar Firebase
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js');

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const messaging = getMessaging(app);

    // Pedir permiso
    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return null;
    }

    // Obtener token FCM
    const token = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    console.log('Token FCM:', token);

    // Guardar en Supabase
    const { data, error } = await supabase
      .from('fcm_tokens')
      .upsert({ user_id: userId, token, rol }, { onConflict: 'user_id' });

    if (error) console.error('Error guardando token:', error);
    else console.log('Token guardado en Supabase');

    return token;
  } catch (error) {
    console.error('Error inicializando notificaciones:', error);
  }
}
