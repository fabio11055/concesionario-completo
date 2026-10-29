<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVehiculosStore } from '~/stores/vehiculos'
import { useReservasStore } from '~/stores/reservas'

const route = useRoute()
const vehiculosStore = useVehiculosStore()
const reservasStore = useReservasStore()

const reservaExitosa = ref(null)
const error = ref('')

// Carga los vehículos si la página se abre directamente
onMounted(async () => {
  reservasStore.limpiarMensajes()
  if (!vehiculosStore.todosLosCarros.length) await vehiculosStore.cargarInicial()
})

// Busca el vehículo seleccionado por el ID de la URL
const vehiculo = computed(() =>
  vehiculosStore.todosLosCarros.find((v) => String(v.id) === String(route.query.vehiculoId))
)

// Guarda la reserva recibida del componente FormularioReserva
async function guardarReserva(datosCliente) {
  error.value = ''
  reservaExitosa.value = null

  try {
    reservaExitosa.value = await reservasStore.crearReserva({
      ...datosCliente,
      vehiculoId: vehiculo.value.id,
      marca: vehiculo.value.marca,
      modelo: vehiculo.value.modelo,
      precio: vehiculo.value.precio,
      currency: vehiculo.value.currency || 'USD'
    })
  } catch {
    error.value = 'Error al registrar la reserva.'
  }
}
</script>

<template>
  <div class="contenedor">
    <NuxtLink to="/" class="btn-blanco">⬅ Volver al Catálogo</NuxtLink>

    <!-- Caso 1: No seleccionó ningún vehículo -->
    <div v-if="!route.query.vehiculoId || !vehiculo" class="aviso">
      <h2>🚗 Selecciona un vehículo primero</h2>
      <p>Elige un vehículo en el catálogo antes de apartarlo.</p>
      <NuxtLink to="/" class="btn-azul">Ir al Catálogo</NuxtLink>
    </div>

    <!-- Caso 2: Formulario activo -->
    <div v-else>
      <header class="cabecera">
        <h1>📋 Formulario de Reserva</h1>
        <p>Aparta el vehículo completando tus datos personales.</p>
      </header>

      <!-- Mensajes de éxito o error -->
      <div v-if="reservaExitosa" class="alerta exito">
        🎉 ¡Reserva guardada para <strong>{{ reservaExitosa.nombreCliente }}</strong> ({{ reservaExitosa.marca }} {{ reservaExitosa.modelo }})!
      </div>
      <div v-if="error || reservasStore.mensajeError" class="alerta error">
        ⚠️ {{ error || reservasStore.mensajeError }}
      </div>

      <!-- Componentes hijos comunicados con Props y Emits -->
      <div class="panel">
        <ResumenVehiculo :vehiculo="vehiculo" />
        <FormularioReserva :cargando="reservasStore.cargando" @confirmar="guardarReserva" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor { max-width: 950px; margin: 0 auto; padding: 20px; }
.btn-blanco { display: inline-block; background: #fff; color: #2563eb; padding: 8px 14px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-bottom: 16px; }
.btn-azul { display: inline-block; background: #2563eb; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 700; }
.cabecera { margin-bottom: 16px; }
.cabecera h1 { color: #fff; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
.cabecera p { color: #f1f5f9; margin: 4px 0 0; }
.aviso { background: #fff; border-radius: 12px; padding: 24px; text-align: center; max-width: 450px; margin: 30px auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.panel { display: grid; grid-template-columns: 1fr 1.4fr; gap: 16px; }
@media (max-width: 700px) { .panel { grid-template-columns: 1fr; } }
.alerta { padding: 12px; border-radius: 8px; margin-bottom: 14px; font-weight: 600; font-size: 0.9rem; }
.exito { background: #dcfce7; color: #14532d; }
.error { background: #fee2e2; color: #7f1d1d; }
</style>
