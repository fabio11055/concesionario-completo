<script setup>
// defineModel sincroniza automáticamente el texto con el componente padre (v-model)
const busqueda = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="buscador">
    <label for="buscar">🔍 Buscar vehículo por marca o modelo:</label>
    <div class="caja-input">
      <input
        id="buscar"
        v-model="busqueda"
        type="text"
        placeholder="Ej: Toyota, Ford, Mazda, Chevrolet..."
      />
      <button v-if="busqueda" type="button" title="Borrar búsqueda" @click="busqueda = ''">✕</button>
    </div>
  </div>
</template>

<style scoped>
.buscador {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.caja-input {
  position: relative;
  display: flex;
}

input {
  width: 100%;
  padding: 12px 42px 12px 14px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #ffffff;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
}

input:focus {
  border-color: #2563eb;
}

button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: 700;
  color: #0f172a;
}
</style>
