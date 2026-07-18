<script setup lang="ts">
import type { CustomerWithHistory } from '../utils/api';
import SimulationForm from './SimulationForm.vue';
import SimulationHistory from './SimulationHistory.vue';

const props = defineProps<{
  customer: CustomerWithHistory | null;
  exchangeRates: Record<string, number>;
  selectedCurrency: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'save-simulation', data: {
    customerId: number;
    activeUsers: number;
    storageGb: number;
    apiCalls: number;
  }): void;
}>();
</script>

<template>
  <div v-if="loading" class="empty-state">
    <div class="empty-state-icon" style="animation: spin 1s linear infinite;">⏳</div>
    <p>Cargando información del cliente...</p>
  </div>

  <div v-else-if="!customer" class="empty-state">
    <div class="empty-state-icon">🏢</div>
    <h3>No hay cliente seleccionado</h3>
    <p style="margin-top: 0.5rem;">Selecciona un cliente del listado de la izquierda o registra uno nuevo para comenzar a simular costes.</p>
  </div>

  <div v-else class="workspace-container">
    <!-- Ficha del Cliente -->
    <div class="glass-panel">
      <div class="customer-detail-header">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <h2 style="font-size: 1.6rem; color: var(--text-main); font-family: 'Outfit';">{{ customer.name }}</h2>
          <span 
            class="badge" 
            :class="{
              'badge-enterprise': customer.plan.toLowerCase().includes('enterprise'),
              'badge-premium': customer.plan.toLowerCase().includes('premium'),
              'badge-standard': customer.plan.toLowerCase().includes('standard')
            }"
            style="font-size: 0.85rem; padding: 0.3rem 0.8rem;"
          >
            Plan {{ customer.plan }}
          </span>
        </div>
      </div>

      <div class="customer-info-grid">
        <div class="info-item">
          <div class="info-label">Identificador Fiscal</div>
          <div class="info-value">{{ customer.fiscalId }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">País de Facturación</div>
          <div class="info-value">{{ customer.country }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email de Contacto</div>
          <div class="info-value" style="font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ customer.email }}
          </div>
        </div>
      </div>
    </div>

    <!-- Simulador Interactivo -->
    <SimulationForm 
      :customer="customer" 
      :exchange-rates="exchangeRates" 
      :selected-currency="selectedCurrency"
      @save-simulation="(data) => emit('save-simulation', data)"
    />

    <!-- Historial de Simulaciones -->
    <SimulationHistory 
      :simulations="customer.simulations" 
      :exchange-rates="exchangeRates" 
      :selected-currency="selectedCurrency"
    />
  </div>
</template>

<style>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
