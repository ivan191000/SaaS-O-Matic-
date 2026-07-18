<script setup lang="ts">
import { computed } from 'vue';
import type { Customer } from '../utils/api';

const props = defineProps<{
  customer: Customer;
  active: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', customer: Customer): void;
}>();

const planClass = computed(() => {
  const plan = props.customer.plan.toLowerCase();
  if (plan.includes('enterprise')) return 'badge-enterprise';
  if (plan.includes('premium')) return 'badge-premium';
  return 'badge-standard';
});
</script>

<template>
  <div 
    class="customer-card" 
    :class="{ active: active }"
    @click="emit('select', customer)"
  >
    <div class="card-header-info">
      <h3 class="card-title">{{ customer.name }}</h3>
      <span class="badge" :class="planClass">{{ customer.plan }}</span>
    </div>
    <div class="card-detail">
      <span>Fiscal ID: <strong>{{ customer.fiscalId }}</strong></span>
      <span>{{ customer.country }}</span>
    </div>
  </div>
</template>
