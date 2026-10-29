<script setup>
import { ref } from 'vue'

// Props: estado de guardado
defineProps({
  cargando: { type: Boolean, default: false }
})

// Emit: envía los datos de la reserva al padre
const emit = defineEmits(['confirmar'])

// Datos reactivos del formulario
const form = ref({
  nombreCliente: '',
  documento: '',
  telefono: '',
  correo: '',
  fechaReserva: '',
  observaciones: ''
})

// Envía la información y limpia los campos
function enviar() {
  emit('confirmar', { ...form.value })
  form.value = { nombreCliente: '', documento: '', telefono: '', correo: '', fechaReserva: '', observaciones: '' }
}
</script>

<template>
  <form class="tarjeta" @submit.prevent="enviar">
    <h3>👤 Datos del Solicitante</h3>

    <label>Nombre completo *<input v-model="form.nombreCliente" required placeholder="Carlos Gómez" /></label>

    <div class="fila">
      <label>Documento *<input v-model="form.documento" required placeholder="1098765432" /></label>
      <label>Celular *<input v-model="form.telefono" required placeholder="3001234567" /></label>
    </div>

    <div class="fila">
      <label>Correo *<input v-model="form.correo" type="email" required placeholder="carlos@correo.com" /></label>
      <label>Fecha Reserva *<input v-model="form.fechaReserva" type="date" required /></label>
    </div>

    <label>Observaciones<textarea v-model="form.observaciones" rows="2" placeholder="Opcional..."></textarea></label>

    <button type="submit" class="btn" :disabled="cargando">
      {{ cargando ? 'Guardando...' : '💾 Confirmar Reserva' }}
    </button>
  </form>
</template>

<style scoped>
.tarjeta {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
h3 { margin: 0 0 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
label { display: flex; flex-direction: column; font-size: 0.85rem; font-weight: 700; color: #0f172a; gap: 4px; }
input, textarea { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; }
.btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
}
.btn:hover { background: #1d4ed8; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
