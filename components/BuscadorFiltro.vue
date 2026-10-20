<script setup>
// Implementación de v-model bidireccional con defineModel (Vue 3)
const busqueda = defineModel({
  type: String,
  default: '',
})
</script>

<template>
  <div class="contenedor-buscador">
    <label for="campo-busqueda">
      🔍 Filtrar por marca de carro en el servidor:
    </label>
    <div class="caja-input">
      <input
        id="campo-busqueda"
        v-model="busqueda"
        type="text"
        placeholder="Escribe una marca (ej: Toyota, Ford, Chevrolet, Mazda, BMW, Audi)..."
        autocomplete="off"
      />
      <button
        v-if="busqueda"
        class="btn-borrar"
        type="button"
        title="Limpiar filtro"
        @click="busqueda = ''"
      >
        ✕
      </button>
    </div>
    <span v-if="busqueda" class="indicador-busqueda">
      Consultando servidor para la marca: <strong>"{{ busqueda }}"</strong>
    </span>
  </div>
</template>

<style scoped>
.contenedor-buscador {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.caja-input {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 12px 42px 12px 16px;
  border: 2px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #0f172a;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.btn-borrar {
  position: absolute;
  right: 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  color: #475569;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-borrar:hover {
  background-color: #cbd5e1;
  color: #0f172a;
}

.indicador-busqueda {
  font-size: 0.85rem;
  color: #2563eb;
  font-weight: 500;
}
</style>
