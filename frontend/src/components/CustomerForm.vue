<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { NewCustomerInput } from '../utils/api';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: NewCustomerInput): void;
}>();

const form = reactive<NewCustomerInput>({
  name: '',
  fiscalId: '',
  email: '',
  country: 'España',
  plan: 'Standard'
});

const errors = reactive({
  name: '',
  fiscalId: '',
  email: '',
});

// Validador básico de email
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validador de DNI/NIF/CIF español (lado del cliente)
const validateSpanishFiscalId = (id: string) => {
  const clean = id.trim().replace(/[-\s]/g, '').toUpperCase();
  if (clean.length !== 9) return false;

  const firstChar = clean.charAt(0);
  const lastChar = clean.charAt(8);

  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
  const cifRegex = /^[ABCDEFGHJNPQRSTUVW][0-9]{7}[0-9A-J]$/;

  if (dniRegex.test(clean)) {
    const number = parseInt(clean.substring(0, 8), 10);
    const expectedLetter = 'TRWAGMYFPDXBNJZSQVHLCKE'.charAt(number % 23);
    return lastChar === expectedLetter;
  }
  
  if (nieRegex.test(clean)) {
    let prefix = '0';
    if (firstChar === 'Y') prefix = '1';
    else if (firstChar === 'Z') prefix = '2';
    const number = parseInt(prefix + clean.substring(1, 8), 10);
    const expectedLetter = 'TRWAGMYFPDXBNJZSQVHLCKE'.charAt(number % 23);
    return lastChar === expectedLetter;
  }

  if (cifRegex.test(clean)) {
    const digits = clean.substring(1, 8);
    let evenSum = 0;
    let oddSum = 0;

    for (let i = 0; i < 7; i++) {
      const val = parseInt(digits.charAt(i), 10);
      if (isNaN(val)) return false;
      if ((i + 1) % 2 === 0) {
        evenSum += val;
      } else {
        const double = val * 2;
        oddSum += Math.floor(double / 10) + (double % 10);
      }
    }

    const total = evenSum + oddSum;
    const controlDigit = (10 - (total % 10)) % 10;
    const controlLetter = 'JABCDEFGHI'.charAt(controlDigit);

    const requiresLetter = 'KPQRSW'.includes(firstChar);
    const requiresNumber = 'ABEH'.includes(firstChar);

    if (requiresLetter) {
      return lastChar === controlLetter;
    } else if (requiresNumber) {
      return lastChar === controlDigit.toString();
    } else {
      return lastChar === controlLetter || lastChar === controlDigit.toString();
    }
  }

  return false;
};

const validateForm = () => {
  let isValid = true;
  errors.name = '';
  errors.fiscalId = '';
  errors.email = '';

  if (!form.name.trim()) {
    errors.name = 'El nombre de empresa es obligatorio.';
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = 'El email es obligatorio.';
    isValid = false;
  } else if (!validateEmail(form.email)) {
    errors.email = 'El formato del email no es válido.';
    isValid = false;
  }

  if (!form.fiscalId.trim()) {
    errors.fiscalId = 'El identificador fiscal es obligatorio.';
    isValid = false;
  } else {
    const countryUpper = form.country.toUpperCase();
    if (countryUpper === 'ESPAÑA' || countryUpper === 'SPAIN') {
      if (!validateSpanishFiscalId(form.fiscalId)) {
        errors.fiscalId = 'Identificador Fiscal (DNI/NIF/CIF) español no válido.';
        isValid = false;
      }
    }
  }

  return isValid;
};

const submitForm = () => {
  if (validateForm()) {
    emit('submit', { ...form });
    // Resetear formulario
    form.name = '';
    form.fiscalId = '';
    form.email = '';
    form.country = 'España';
    form.plan = 'Standard';
  }
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    errors.name = '';
    errors.fiscalId = '';
    errors.email = '';
  }
});
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2 style="margin-bottom: 1.5rem; font-family: 'Outfit';">Registrar Cliente Corporativo</h2>
      
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label class="form-label" for="company-name">Nombre de Empresa</label>
          <input 
            id="company-name"
            v-model="form.name" 
            type="text" 
            class="form-input" 
            placeholder="Ej. Acme España S.L." 
          />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="fiscal-id">Identificador Fiscal</label>
          <input 
            id="fiscal-id"
            v-model="form.fiscalId" 
            type="text" 
            class="form-input" 
            placeholder="Ej. B12345678" 
          />
          <span v-if="errors.fiscalId" class="form-error">{{ errors.fiscalId }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="contact-email">Email de Contacto</label>
          <input 
            id="contact-email"
            v-model="form.email" 
            type="email" 
            class="form-input" 
            placeholder="Ej. facturas@empresa.com" 
          />
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="company-country">País</label>
          <select id="company-country" v-model="form.country" class="form-select">
            <option value="España">España (21% IVA)</option>
            <option value="Francia">Francia (20% IVA)</option>
            <option value="Alemania">Alemania (19% IVA)</option>
            <option value="Italia">Italia (22% IVA)</option>
            <option value="Reino Unido">Reino Unido (20% IVA)</option>
            <option value="Portugal">Portugal (23% IVA)</option>
            <option value="EE.UU.">Estados Unidos (0%)</option>
            <option value="Otro">Otro (20% Fallback UE o 0%)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="subscription-plan">Plan Elegido</label>
          <select id="subscription-plan" v-model="form.plan" class="form-select">
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Registrar Cliente</button>
        </div>
      </form>
    </div>
  </div>
</template>
