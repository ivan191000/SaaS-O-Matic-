<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { 
  fetchCustomers, 
  fetchCustomerDetails, 
  createCustomer, 
  saveSimulation, 
  type Customer, 
  type CustomerWithHistory,
  type NewCustomerInput
} from './utils/api';
import { getExchangeRates, type ExchangeRates } from './utils/exchange';

import CustomerCard from './components/CustomerCard.vue';
import CustomerDetails from './components/CustomerDetails.vue';
import CustomerForm from './components/CustomerForm.vue';

// Lista de clientes y búsqueda
const customers = ref<Customer[]>([]);
const search = ref('');
const loadingCustomers = ref(false);

// Cliente seleccionado y cargando detalle
const selectedCustomer = ref<CustomerWithHistory | null>(null);
const selectedCustomerId = ref<number | null>(null);
const loadingDetails = ref(false);

// Monedas
const exchangeRates = ref<ExchangeRates>({ EUR: 1, USD: 1.09, GBP: 0.85, JPY: 162.5, CAD: 1.48 });
const selectedCurrency = ref('EUR');

// Modales y notificaciones
const showRegisterModal = ref(false);
const globalError = ref('');
const successToast = ref('');

// Carga inicial
const loadInitialData = async () => {
  loadingCustomers.value = true;
  try {
    // 1. Cargar tipos de cambio
    const rates = await getExchangeRates();
    exchangeRates.value = rates;

    // 2. Cargar clientes
    const data = await fetchCustomers();
    customers.value = data;
    
    // Seleccionar por defecto el primer cliente si existe
    if (data.length > 0) {
      await selectCustomer(data[0]);
    }
  } catch (error: any) {
    globalError.value = error.message || 'Error al iniciar la aplicación.';
  } finally {
    loadingCustomers.value = false;
  }
};

// Selecciona un cliente y carga sus simulaciones
const selectCustomer = async (customer: Customer) => {
  selectedCustomerId.value = customer.id;
  loadingDetails.value = true;
  globalError.value = '';
  try {
    const details = await fetchCustomerDetails(customer.id);
    selectedCustomer.value = details;
  } catch (error: any) {
    globalError.value = error.message || 'Error al cargar detalles del cliente.';
  } finally {
    loadingDetails.value = false;
  }
};

// Filtrado/Búsqueda de clientes
watch(search, async (newSearch) => {
  try {
    const data = await fetchCustomers(newSearch);
    customers.value = data;
  } catch (error: any) {
    console.error('Error al buscar clientes:', error);
  }
});

// Registrar nuevo cliente corporativo
const handleRegisterCustomer = async (input: NewCustomerInput) => {
  globalError.value = '';
  try {
    const newCustomer = await createCustomer(input);
    showRegisterModal.value = false;
    triggerToast('Cliente registrado con éxito.');
    
    // Recargar listado y seleccionar el cliente nuevo
    const data = await fetchCustomers(search.value);
    customers.value = data;
    await selectCustomer(newCustomer);
  } catch (error: any) {
    alert(error.message || 'Error al registrar el cliente.');
  }
};

// Guardar simulación de consumo
const handleSaveSimulation = async (data: {
  customerId: number;
  activeUsers: number;
  storageGb: number;
  apiCalls: number;
}) => {
  globalError.value = '';
  try {
    await saveSimulation(data);
    triggerToast('Simulación guardada con éxito.');

    // Volver a cargar los detalles para actualizar el historial
    if (selectedCustomerId.value) {
      const details = await fetchCustomerDetails(selectedCustomerId.value);
      selectedCustomer.value = details;
    }
  } catch (error: any) {
    globalError.value = error.message || 'Error al guardar la simulación.';
  }
};

const triggerToast = (msg: string) => {
  successToast.value = msg;
  setTimeout(() => {
    successToast.value = '';
  }, 3000);
};

onMounted(() => {
  loadInitialData();
});
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="brand">
        <div class="brand-icon">S</div>
        <div>
          <h1>SaaS-O-Matic</h1>
          <p style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.1rem;">
            Dynamic Billing & Subscription Optimizer
          </p>
        </div>
      </div>
      
      <div class="header-actions">
        <!-- Selector de Moneda -->
        <label for="currency-select" class="info-label" style="margin-bottom: 0; text-transform: none; font-size: 0.8rem; color: var(--text-muted);">
          Visualizar en:
        </label>
        <select id="currency-select" v-model="selectedCurrency" class="currency-selector">
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="CAD">CAD (C$)</option>
        </select>
        
        <button class="btn btn-primary" @click="showRegisterModal = true">
          <span>+ Nuevo Cliente</span>
        </button>
      </div>
    </header>

    <!-- Error Global -->
    <div v-if="globalError" class="glass-panel" style="border-color: var(--accent-danger); background: rgba(239, 68, 68, 0.08); margin-bottom: 1.5rem; padding: 1rem 1.5rem;">
      <span style="color: #fca5a5; font-weight: 600;">⚠️ Error:</span>
      <span style="margin-left: 0.5rem; color: var(--text-main);">{{ globalError }}</span>
    </div>

    <!-- Toast Notificación -->
    <Transition name="toast">
      <div v-if="successToast" class="toast-notification">
        <span>✨ {{ successToast }}</span>
      </div>
    </Transition>

    <!-- Dashboard Layout Grid -->
    <main class="dashboard-grid">
      
      <!-- Lateral: Buscador y Listado de Clientes -->
      <aside class="glass-panel">
        <div class="sidebar-header">
          <h3 style="font-size: 1.15rem; font-family: 'Outfit';">Clientes Corporativos</h3>
        </div>
        
        <input 
          type="text" 
          v-model="search" 
          placeholder="Buscar por nombre o CIF..." 
          class="search-input"
          aria-label="Buscar clientes por nombre o identificador fiscal"
        />

        <div v-if="loadingCustomers" class="empty-state" style="padding: 3rem 1rem;">
          <p>Cargando listado...</p>
        </div>

        <div v-else-if="customers.length === 0" class="empty-state" style="padding: 3rem 1rem;">
          <p>No se encontraron clientes.</p>
        </div>

        <div v-else class="customer-list">
          <CustomerCard 
            v-for="c in customers" 
            :key="c.id" 
            :customer="c" 
            :active="selectedCustomerId === c.id"
            @select="selectCustomer"
          />
        </div>
      </aside>

      <!-- Principal: Workspace / Detalle de Cliente -->
      <section>
        <CustomerDetails 
          :customer="selectedCustomer" 
          :exchange-rates="exchangeRates" 
          :selected-currency="selectedCurrency"
          :loading="loadingDetails"
          @save-simulation="handleSaveSimulation"
        />
      </section>
      
    </main>

    <!-- Formulario Modal de Registro de Cliente -->
    <CustomerForm 
      :show="showRegisterModal" 
      @close="showRegisterModal = false" 
      @submit="handleRegisterCustomer"
    />
  </div>
</template>

<style>
/* Animación de entrada y salida del Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, var(--accent-green) 0%, #059669 100%);
  color: #fff;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius-md);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  font-weight: 600;
  z-index: 2000;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  transform: translateY(50px) scale(0.9);
  opacity: 0;
}
.toast-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
