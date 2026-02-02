const BACKEND_VALUE = (globalThis.Netlify) ? "https://willbergforever-com-server.onrender.com" : "http://localhost:5050"
console.log(BACKEND_VALUE);
export const BACKEND = BACKEND_VALUE;