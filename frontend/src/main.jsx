// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for React 18+
import App from './App.jsx';
import './index.css'; // Import Tailwind CSS entry file

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <App />
  // <React.StrictMode>
);