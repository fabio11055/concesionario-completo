<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStoreReservations } from '~/stores/reservations'
import { useStoreAuth } from '~/stores/auth'

// Proteger la ruta: solo accesible por el administrador
definePageMeta({
  middleware: 'admin',
})

const authStore = useStoreAuth()
const store = useStoreReservations()
const mensaje = ref('')

onMounted(async () => {
  if (!authStore.esAdmin) {
    return navigateTo({ path: '/', query: { alerta: 'acceso-denegado' } })
  }
  await store.fetchReservations()
})

async function cambiarEstado(id: number | string, estado: 'Confirmada' | 'Cancelada') {
  mensaje.value = ''
  try {
    await store.updateReservation(id, { estado })
  } catch {
    mensaje.value = store.error
  }
}

async function eliminarReserva(id: number | string) {
  const confirmar = window.confirm('¿Seguro que deseas eliminar esta reserva?')
  if (!confirmar) return

  mensaje.value = ''
  try {
    await store.deleteReservation(id)
  } catch {
    mensaje.value = store.error
  }
}
</script>

<template>
  <main class="pagina">
    <header class="encabezado">
      <div>
        <span class="badge-admin">👑 Panel Exclusivo de Administrador</span>
        <h1>Reservas y Solicitudes de Vehículos</h1>
        <p>Administra las solicitudes enviadas por los clientes desde la base de datos.</p>
      </div>

      <div class="acciones-nav">
        <NuxtLink to="/Admin" class="boton-admin">
          Ir al Panel de Administración
        </NuxtLink>
        <NuxtLink to="/" class="boton-secundario">
          Ver Catálogo
        </NuxtLink>
      </div>
    </header>

    <div v-if="store.loading" class="estado-cargando">
      <p>Cargando reservas desde el servidor...</p>
    </div>

    <p v-if="mensaje" class="error">
      {{ mensaje }}
    </p>

    <p v-else-if="!store.loading && store.error" class="error">
      {{ store.error }}
    </p>

    <div v-else-if="!store.loading && store.reservations.length === 0" class="vacio">
      <h2>No hay reservas todavía</h2>
      <p>Cuando un cliente solicite un vehículo en el catálogo, aparecerá registrado aquí.</p>
    </div>

    <div v-else-if="!store.loading" class="lista">
      <article
        v-for="reserva in store.reservations"
        :key="reserva.id"
        class="tarjeta"
      >
        <div class="fila">
          <div>
            <span class="id-reserva">Solicitud #{{ reserva.id }}</span>
            <h2>{{ reserva.nombre }}</h2>
          </div>

          <span
            class="estado"
            :class="reserva.estado ? reserva.estado.toLowerCase() : 'pendiente'"
          >
            {{ reserva.estado || 'Pendiente' }}
          </span>
        </div>

        <div class="info-grid">
          <p><strong>🚗 Vehículo:</strong> {{ reserva.vehiculo || `ID #${reserva.productId}` }}</p>
          <p><strong>📞 Teléfono:</strong> {{ reserva.telefono }}</p>
          <p v-if="reserva.email"><strong>✉️ Correo:</strong> {{ reserva.email }}</p>
          <p><strong>📅 Fecha de Visita:</strong> {{ reserva.fecha }}</p>
          <p v-if="reserva.mensaje" class="mensaje-nota">
            <strong>💬 Mensaje:</strong> "{{ reserva.mensaje }}"
          </p>
        </div>

        <div class="acciones">
          <button
            v-if="reserva.estado !== 'Confirmada'"
            class="boton-confirmar"
            @click="cambiarEstado(reserva.id, 'Confirmada')"
          >
            Confirmar
          </button>

          <button
            v-if="reserva.estado !== 'Cancelada'"
            class="boton-cancelar"
            @click="cambiarEstado(reserva.id, 'Cancelada')"
          >
            Cancelar
          </button>

          <button
            class="peligro"
            @click="eliminarReserva(reserva.id)"
          >
            Eliminar
          </button>
        </div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  max-width: 1000px;
  margin: 30px auto;
  padding: 24px 20px;
  color: #1f2937;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
}

.badge-admin {
  display: inline-block;
  background-color: #fef3c7;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 20px;
  margin-bottom: 6px;
}

h1 {
  font-size: 26px;
  margin: 0;
  color: #0f172a;
}

h2 {
  font-size: 19px;
  margin: 4px 0 0 0;
  color: #0f172a;
}

p {
  line-height: 1.6;
  margin: 4px 0;
}

.acciones-nav {
  display: flex;
  gap: 10px;
}

.lista {
  display: grid;
  gap: 18px;
}

.tarjeta, .vacio {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background: white;
}

.fila {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.id-reserva {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
  font-size: 0.9rem;
}

.mensaje-nota {
  grid-column: 1 / -1;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  font-style: italic;
}

.estado {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.estado.pendiente {
  background-color: #fef3c7;
  color: #92400e;
}

.estado.confirmada {
  background-color: #dcfce7;
  color: #15803d;
}

.estado.cancelada {
  background-color: #fee2e2;
  color: #b91c1c;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

button, .boton-secundario, .boton-admin {
  border: 0;
  border-radius: 7px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
}

.boton-admin {
  background: #2563eb;
  color: white;
}

.boton-admin:hover {
  background: #1d4ed8;
}

.boton-secundario {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.boton-confirmar {
  background: #16a34a;
  color: white;
}

.boton-confirmar:hover {
  background: #15803d;
}

.boton-cancelar {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.peligro {
  background: #dc2626;
  color: white;
}

.peligro:hover {
  background: #b91c1c;
}

.error {
  color: #dc2626;
  font-weight: 600;
}

.vacio {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

@media (max-width: 600px) {
  .encabezado {
    flex-direction: column;
  }
}
</style>
