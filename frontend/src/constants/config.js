export const BACKEND = import.meta.env.VITE_BACKEND_PORT
  ? `http://${window.location.hostname}:${import.meta.env.VITE_BACKEND_PORT}`
  : `https://${import.meta.env.VITE_BRANCH && import.meta.env.VITE_BRANCH != "main" ? "branch" : ""}server.willbergforever.com`;