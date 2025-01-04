import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import keycloak from "./keycloak";
import './index.css'

// keycloak
//   .init({ onLoad: "login-required" })
//   .then((authenticated) => {
//     if (authenticated) {
//       ReactDOM.render(<App />, document.getElementById("root"));
//     }
//   })
//   .catch((error) => console.error("Keycloak init failed", error));

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
