const API_BASE_URL = 'http://localhost:4000';

export interface Customer {
  id: number;
  name: string;
  fiscalId: string;
  email: string;
  country: string;
  plan: string;
  createdAt: string;
}

export interface Simulation {
  id: number;
  customerId: number;
  activeUsers: number;
  storageGb: number;
  apiCalls: number;
  calculatedCostEur: number;
  createdAt: string;
}

export interface CustomerWithHistory extends Customer {
  simulations: Simulation[];
}

export interface NewCustomerInput {
  name: string;
  fiscalId: string;
  email: string;
  country: string;
  plan: string;
}

export interface NewSimulationInput {
  customerId: number;
  activeUsers: number;
  storageGb: number;
  apiCalls: number;
}

/**
 * Obtiene el listado de clientes filtrados por búsqueda.
 */
export async function fetchCustomers(search = ''): Promise<Customer[]> {
  const url = new URL(`${API_BASE_URL}/customers`);
  if (search) {
    url.searchParams.append('search', search);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener los clientes.');
  }
  return response.json();
}

/**
 * Obtiene el detalle de un cliente con su historial de simulaciones.
 */
export async function fetchCustomerDetails(id: number): Promise<CustomerWithHistory> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener el detalle del cliente.');
  }
  return response.json();
}

/**
 * Registra un nuevo cliente.
 */
export async function createCustomer(input: NewCustomerInput): Promise<Customer> {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear el cliente.');
  }

  return response.json();
}

/**
 * Guarda una nueva simulación de costes.
 */
export async function saveSimulation(input: NewSimulationInput): Promise<Simulation> {
  const response = await fetch(`${API_BASE_URL}/simulations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al guardar la simulación.');
  }

  return response.json();
}
