<script setup>
import { ref, computed } from 'vue'

// Props: lista de vehículos
const props = defineProps({
  vehiculos: { type: Array, default: () => [] }
})

// Emits: eventos para avisar al padre
const emit = defineEmits(['agregar', 'editar', 'eliminar', 'toggle-estado'])

const busqueda = ref('')

// Filtro sencillo por marca, modelo o ID
const filtrados = computed(() => {
  const txt = busqueda.value.toLowerCase().trim()
  if (!txt) return props.vehiculos
  return props.vehiculos.filter(c =>
    c.marca.toLowerCase().includes(txt) ||
    c.modelo.toLowerCase().includes(txt) ||
    String(c.id).includes(txt)
  )
})
</script>

<template>
  <div>
    <!-- Barra de búsqueda y agregar -->
    <div class="barra">
      <input v-model="busqueda" placeholder="🔍 Buscar vehículo..." />
      <button class="btn-azul" @click="emit('agregar')">➕ Nuevo Vehículo</button>
    </div>

    <!-- Tabla -->
    <div class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehículo</th>
            <th>Categoría</th>
            <th>Año</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filtrados.length">
            <td colspan="7" class="vacio">No hay vehículos registrados.</td>
          </tr>
          <tr v-for="c in filtrados" :key="c.id">
            <td>#{{ c.id }}</td>
            <td><strong>{{ c.marca }}</strong> {{ c.modelo }}</td>
            <td>{{ c.categoria }}</td>
            <td>{{ c.anio }}</td>
            <td><strong>${{ Number(c.precio).toLocaleString() }}</strong></td>
            <td>
              <button
                class="badge-btn"
                :class="c.disponible ? 'verde' : 'rojo'"
                @click="emit('toggle-estado', c)"
              >
                {{ c.disponible ? 'Disponible' : 'Agotado' }}
              </button>
            </td>
            <td>
              <button class="btn-icono" @click="emit('editar', c)">✏️</button>
              <button class="btn-icono" @click="emit('eliminar', c)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.barra { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; width: 240px; }
.btn-azul { background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.tabla-contenedor { background: #fff; border-radius: 10px; overflow-x: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { background: #f8fafc; padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; }
td { padding: 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.vacio { text-align: center; color: #94a3b8; padding: 20px; }
.badge-btn { border: none; border-radius: 12px; padding: 3px 10px; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
.verde { background: #dcfce7; color: #166534; }
.rojo { background: #fee2e2; color: #991b1b; }
.btn-icono { background: none; border: 1px solid #cbd5e1; border-radius: 4px; padding: 3px 6px; cursor: pointer; margin-right: 4px; }
</style>
