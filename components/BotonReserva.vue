<script setup>
// Props para recibir ID y disponibilidad del vehículo
const props = defineProps({
  vehiculoId: {
    type: [Number, String],
    required: true,
  },
  disponible: {
    type: Boolean,
    default: true,
  },
})

// Declaración del evento emitido hacia el padre mediante defineEmits
const emit = defineEmits(['solicitar', 'reservar'])

function manejarClic() {
  if (props.disponible) {
    emit('solicitar', props.vehiculoId)
    emit('reservar', props.vehiculoId)
  }
}
</script>

<template>
  <button
    type="button"
    class="btn-solicitar"
    :class="{ 'btn-disponible': disponible, 'btn-agotado': !disponible }"
    :disabled="!disponible"
    @click="manejarClic"
  >
    <span v-if="disponible">📋 Solicitar vehículo</span>
    <span v-else>🚫 No Disponible</span>
  </button>
</template>

<style scoped>
.btn-solicitar {
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-disponible {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-disponible:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

.btn-disponible:active {
  transform: scale(0.98);
}

.btn-agotado {
  background-color: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
