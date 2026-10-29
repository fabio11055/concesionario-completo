<script setup>
// Props: lista de reservas enviadas por el store
defineProps({
  reservas: { type: Array, default: () => [] }
})

// Emits: notifica cambio de estado o eliminación
const emit = defineEmits(['cambiar-estado', 'eliminar'])
</script>

<template>
  <div class="tabla-contenedor">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Vehículo</th>
          <th>Cliente</th>
          <th>Documento</th>
          <th>Contacto</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!reservas.length">
          <td colspan="8" class="vacio">No hay reservas registradas.</td>
        </tr>
        <tr v-for="r in reservas" :key="r.id">
          <td>#{{ r.id }}</td>
          <td><strong>{{ r.marca }} {{ r.modelo }}</strong></td>
          <td>{{ r.nombreCliente }}</td>
          <td>{{ r.documento }}</td>
          <td>{{ r.telefono }}</td>
          <td>{{ r.fechaReserva }}</td>
          <td>
            <select
              :value="r.estado || 'Pendiente'"
              class="select"
              @change="emit('cambiar-estado', { id: r.id, nuevoEstado: $event.target.value })"
            >
              <option value="Pendiente">🟡 Pendiente</option>
              <option value="Confirmada">🟢 Confirmada</option>
              <option value="Cancelada">🔴 Cancelada</option>
            </select>
          </td>
          <td>
            <button class="btn-borrar" @click="emit('eliminar', r)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tabla-contenedor { background: #fff; border-radius: 10px; overflow-x: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
th { background: #f8fafc; padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; }
td { padding: 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.vacio { text-align: center; color: #94a3b8; padding: 20px; }
.select { padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.82rem; }
.btn-borrar { background: none; border: 1px solid #fca5a5; border-radius: 4px; padding: 3px 6px; cursor: pointer; }
</style>
