<script setup lang="ts">
import type { Simulation } from '../utils/api';

const props = defineProps<{
  simulations: Simulation[];
  exchangeRates: Record<string, number>;
  selectedCurrency: string;
}>();

const formatPrice = (valueEur: number) => {
  const rate = props.exchangeRates[props.selectedCurrency] || 1.0;
  const converted = valueEur * rate;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: props.selectedCurrency,
    currencyDisplay: 'symbol'
  }).format(converted);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="history-section">
    <h3 style="color: var(--text-main); font-family: 'Outfit'; font-size: 1.25rem;">
      Historial de Simulaciones ({{ simulations.length }})
    </h3>
    
    <div v-if="simulations.length === 0" class="empty-state" style="padding: 2.5rem 1rem;">
      <div class="empty-state-icon">📊</div>
      <p>No se han registrado simulaciones para este cliente.</p>
    </div>

    <div v-else class="history-grid">
      <div 
        v-for="sim in simulations" 
        :key="sim.id" 
        class="history-card"
      >
        <div class="history-date">{{ formatDate(sim.createdAt) }}</div>
        
        <div style="font-size: 1.25rem; font-family: 'Outfit'; font-weight: 700; color: var(--secondary); margin-bottom: 0.5rem;">
          {{ formatPrice(sim.calculatedCostEur) }}
        </div>
        
        <div class="card-detail">
          <span>Usuarios: <strong>{{ sim.activeUsers }}</strong></span>
        </div>
        
        <div class="card-detail">
          <span>Almacenamiento: <strong>{{ sim.storageGb }} GB</strong></span>
        </div>
        
        <div class="card-detail">
          <span>Llamadas API: <strong>{{ sim.apiCalls.toLocaleString() }}</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>
