// Configuración de la API
export const API_BASE_URL = 'http://localhost:3002';
export const API_ENDPOINTS = {
  cheques: `${API_BASE_URL}/api/cheques`,
  cuentas: `${API_BASE_URL}/api/cuentas`,
  chequeras: `${API_BASE_URL}/api/chequeras`,
  beneficiarios: `${API_BASE_URL}/api/beneficiarios`,
  transacciones: `${API_BASE_URL}/api/transacciones`,
  depositos: `${API_BASE_URL}/api/depositos`,
  setupTables: `${API_BASE_URL}/api/setup-tables`
};