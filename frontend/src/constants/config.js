export const BACKEND = import.meta.env.VITE_BACKEND_PORT
  ? `http://${window.location.hostname}:${import.meta.env.VITE_BACKEND_PORT}`
  : "https://server.willbergforever.com";