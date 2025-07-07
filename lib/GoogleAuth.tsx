import { useEffect, useState } from "react";

const CLIENT_ID = "322726300328-f19221mrnhnpv0800ihstchp7kkf0vhj.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

declare global {
  interface Window {
    gapi: any;
  }
}

export default function GoogleAuth({ onLogin }: { onLogin: () => void }) {
  const [gapiReady, setGapiReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => window.gapi.load("client:auth2", initClient);
    document.body.appendChild(script);
  }, []);

  function initClient() {
    window.gapi.client
      .init({
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      })
      .then(() => {
        setGapiReady(true);
        const auth = window.gapi.auth2.getAuthInstance();
        setSignedIn(auth.isSignedIn.get());
        auth.isSignedIn.listen(setSignedIn);
      });
  }

  const signIn = () => {
    window.gapi.auth2.getAuthInstance().signIn();
  };

  const signOut = () => {
    window.gapi.auth2.getAuthInstance().signOut();
  };

  useEffect(() => {
    if (signedIn && onLogin) {
      onLogin(); // lance ton code de Drive ici
    }
  }, [signedIn]);

  if (!gapiReady) return <p>⏳ Chargement de Google...</p>;

  return signedIn ? (
    <button onClick={signOut}>🔓 Déconnexion</button>
  ) : (
    <button onClick={signIn}>🔐 Connexion Google</button>
  );
}
