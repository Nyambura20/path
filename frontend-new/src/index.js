import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

const themeKey = 'brightpath_theme';
const storedTheme = (() => {
  try {
    return localStorage.getItem(themeKey);
  } catch (error) {
    return null;
  }
})();

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : (prefersDark ? 'dark' : 'light');

document.documentElement.classList.toggle('dark', initialTheme === 'dark');
document.documentElement.setAttribute('data-theme', initialTheme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
