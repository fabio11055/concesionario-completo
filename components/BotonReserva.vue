<script setup>
// Props: recibe si el vehículo está disponible y su ID
defineProps({
  vehiculoId: [Number, String],
  disponible: { type: Boolean, default: true }
})

// Emit: avisa a la página padre cuando el usuario hace clic
const emit = defineEmits(['solicitar'])
</script>

<template>
  <button
    class="btn-reserva"
    :class="disponible ? 'disponible' : 'agotado'"
    :disabled="!disponible"
    @click="emit('solicitar', vehiculoId)"
  >
    {{ disponible ? '📋 Solicitar vehículo' : '🚫 No Disponible' }}
  </button>
</template>

<style scoped>
.btn-reserva {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
}

.disponible {
  background-color: #2563eb;
  color: #ffffff;
}

.disponible:hover {
  background-color: #1d4ed8;
}

.agotado {
  background-color: #e2e8f0;
  color: #475569;
  cursor: not-allowed;
}
</style>
