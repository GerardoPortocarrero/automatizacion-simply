import axios from 'axios';

// La URL base de la API de SimpliRoute
// He asumido 'https://api.simpliroute.com' como URL base. Por favor, verifica en la documentación si es diferente.
const BASE_URL = 'https://api.simpliroute.com'; 

// El token de la API (obtenido de datos.txt)
const API_KEY = 'd2b82e15b3671a6038ccbf76e582c3f755355684'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Token ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export default api;
