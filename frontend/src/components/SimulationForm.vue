<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Customer } from '../utils/api';

const props = defineProps<{
  customer: Customer;
  exchangeRates: Record<string, number>;
  selectedCurrency: string;
}>();

const emit = defineEmits<{
  (e: 'save-simulation', data: {
    customerId: number;
    activeUsers: number;
    storageGb: number;
    apiCalls: number;
  }): void;
}>();

// Estado del formulario de simulación
const activeUsers = ref(15);
const storageGb = ref(100);
const apiCalls = ref(50000);
const isSaving = ref(false);

// Tasas de IVA según país (replicamos la lógica del backend para reactividad instantánea)
const getClientVatRate = (country: string) => {
  const normalized = country.trim().toUpperCase();
  const rates: Record<string, number> = {
    'ESPAÑA': 0.21, 'SPAIN': 0.21,
    'FRANCIA': 0.20, 'FRANCE': 0.20,
    'ALEMANIA': 0.19, 'GERMANY': 0.19,
    'ITALIA': 0.22, 'ITALY': 0.22,
    'REINO UNIDO': 0.20, 'UNITED KINGDOM': 0.20, 'UK': 0.20,
    'PORTUGAL': 0.23
  };
  if (normalized in rates) return rates[normalized];
  
  const europe = ['AUSTRIA', 'BELGIUM', 'BULGARIA', 'CYPRUS', 'CROATIA', 'DENMARK', 'SLOVAKIA', 
                  'SLOVENIA', 'ESTONIA', 'FINLAND', 'GREECE', 'HUNGARY', 'IRELAND', 'LATVIA', 
                  'LITHUANIA', 'LUXEMBOURG', 'MALTA', 'NETHERLANDS', 'POLAND', 'ROMANIA', 'SWEDEN'];
  if (europe.includes(normalized)) return 0.20;
  return 0.0;
};

const vatRate = computed(() => getClientVatRate(props.customer.country));

// Cálculo de tramos acumulativos en Frontend (Tiered Pricing)
const baseCost = computed(() => {
  const u = activeUsers.value;
  if (u <= 0) return 0;
  if (u <= 10) return u * 10;
  if (u <= 50) return 100 + (u - 10) * 8;
  return 420 + (u - 50) * 5;
});

// Desglose del cálculo de usuarios por tramos para mostrarlo visualmente
const tier1Users = computed(() => Math.min(activeUsers.value, 10));
const tier2Users = computed(() => Math.max(0, Math.min(activeUsers.value - 10, 40)));
const tier3Users = computed(() => Math.max(0, activeUsers.value - 50));

const vatAmount = computed(() => parseFloat((baseCost.value * vatRate.value).toFixed(2)));
const totalCostEur = computed(() => parseFloat((baseCost.value + vatAmount.value).toFixed(2)));

const formatPrice = (valueEur: number) => {
  const rate = props.exchangeRates[props.selectedCurrency] || 1.0;
  const converted = valueEur * rate;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: props.selectedCurrency,
    currencyDisplay: 'symbol'
  }).format(converted);
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    await emit('save-simulation', {
      customerId: props.customer.id,
      activeUsers: activeUsers.value,
      storageGb: storageGb.value,
      apiCalls: apiCalls.value
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="simulator-section">
    <div class="glass-panel" style="background: rgba(30, 41, 59, 0.2);">
      <h3 style="margin-bottom: 1.5rem; color: var(--text-main); font-family: 'Outfit'; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
        Parámetros de Consumo
      </h3>
      
      <!-- Usuarios activos (Slider) -->
      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="users-slider">Usuarios Activos</label>
          <span class="control-value">{{ activeUsers }} usuarios</span>
        </div>
        <input 
          id="users-slider"
          type="range" 
          v-model.number="activeUsers" 
          min="1" 
          max="200" 
          class="range-slider" 
        />
        
        <!-- Detalle de Tramos en Vivo -->
        <div class="tier-list">
          <div class="tier-item" :class="{ active: tier1Users > 0 }">
            <span>Tramo 1 (0-10 usuarios a 10€):</span>
            <strong>{{ tier1Users }} × 10 € = {{ tier1Users * 10 }} €</strong>
          </div>
          <div class="tier-item" :class="{ active: tier2Users > 0 }">
            <span>Tramo 2 (11-50 usuarios a 8€):</span>
            <strong>{{ tier2Users }} × 8 € = {{ tier2Users * 8 }} €</strong>
          </div>
          <div class="tier-item" :class="{ active: tier3Users > 0 }">
            <span>Tramo 3 (50+ usuarios a 5€):</span>
            <strong>{{ tier3Users }} × 5 € = {{ tier3Users * 5 }} €</strong>
          </div>
        </div>
      </div>

      <!-- Almacenamiento (GB) -->
      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="storage-input">Almacenamiento (GB)</label>
          <span class="control-value" style="color: var(--primary);">{{ storageGb }} GB</span>
        </div>
        <input 
          id="storage-input"
          type="number" 
          v-model.number="storageGb" 
          min="1" 
          class="form-input" 
          style="background: var(--bg-deep);"
        />
      </div>

      <!-- Llamadas a API -->
      <div class="control-group" style="margin-bottom: 2rem;">
        <div class="control-header">
          <label class="control-label" for="api-calls-input">Llamadas a API Estimadas</label>
          <span class="control-value" style="color: var(--primary);">{{ apiCalls.toLocaleString() }} llamadas</span>
        </div>
        <input 
          id="api-calls-input"
          type="number" 
          v-model.number="apiCalls" 
          min="0" 
          step="5000" 
          class="form-input"
          style="background: var(--bg-deep);"
        />
      </div>

      <button 
        class="btn btn-primary" 
        style="width: 100%; justify-content: center;"
        @click="handleSave"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Guardando...' : 'Guardar Simulación en Historial' }}
      </button>
    </div>

    <!-- Desglose de Precios y Divisas -->
    <div>
      <div class="price-breakdown-card">
        <div>
          <h3 style="margin-bottom: 1.25rem; font-family: 'Outfit';">Facturación Proyectada</h3>
          
          <div class="breakdown-row">
            <span>Coste Base (Usuarios):</span>
            <span style="font-weight: 600;">{{ formatPrice(baseCost) }}</span>
          </div>
          
          <div class="breakdown-row">
            <span>Tasa de Impuesto ({{ customer.country }}):</span>
            <span style="font-weight: 600;">{{ (vatRate * 100).toFixed(0) }}%</span>
          </div>

          <div class="breakdown-row">
            <span>Monto del Impuesto (IVA):</span>
            <span style="font-weight: 600;">{{ formatPrice(vatAmount) }}</span>
          </div>

          <div style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--text-dark); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
            <span>Valores calculados en EUR y convertidos a <strong>{{ selectedCurrency }}</strong> usando tasas de cambio dinámicas en tiempo real.</span>
          </div>
        </div>

        <div class="breakdown-row total">
          <span>Total Proyectado:</span>
          <span class="price-val">{{ formatPrice(totalCostEur) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
