import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { initKeycloak } from "./keycloak";
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));

initKeycloak(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
