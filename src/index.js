import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';

// 1. Importar estilos de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// 2. Importar estilos de PrimeReact (tema, core y íconos)
import "primereact/resources/themes/lara-light-indigo/theme.css"; // Elige tu tema favorito
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}> {/* Envuelve tu App con el Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
