import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Base Styles & Tailwind
import './index.css';
import './App.css';

// Modular Stylesheets
import './style1.css'; // Tokens, Variables, Typography & Base Theme
import './style2.css'; // Layouts, CSS Grid & Flexbox, Media Queries
import './style3.css'; // Components, Cards, Tables, Buttons & Hover Blue
import './style4.css'; // Animations, Skeleton Shimmer, Modals & Accessibility

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
