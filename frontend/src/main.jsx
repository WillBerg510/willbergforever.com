import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './stylesheets/index.css';
import App from './pages/App.jsx';
import Login from './pages/Login.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const router = createBrowserRouter([
  {path: "/", element: <App />},
  {path: "/login", element: <Login />},
  {path: "/admin", element: <AdminPanel />}
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
)
