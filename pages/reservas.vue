<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVehiculosStore } from '~/stores/vehiculos'
import { useReservasStore } from '~/stores/reservas'

const route = useRoute()
const vehiculosStore = useVehiculosStore()
const reservasStore = useReservasStore()

// 1. Datos reactivos del formulario
const form = ref({
  vehiculoId: '', nombreCliente: '', documento: '', telefono: '', correo: '', fechaReserva: '', observaciones: ''
})
const error = ref('')
const reservaExitosa = ref(null)

// 2. Carga inicial y captura de parámetro vehiculoId
onMounted(async () => {
  reservasStore.limpiarMensajes()
  if (!vehiculosStore.todosLosCarros.length) await vehiculosStore.cargarInicial()
  if (route.query.vehiculoId) form.value.vehiculoId = String(route.query.vehiculoId)
})

// 3. Vehículo seleccionado
const vehiculo = computed(() =>
  vehiculosStore.todosLosCarros.find(v => String(v.id) === String(form.value.vehiculoId))
)

const soloNumeros = (e) => { if (e.which < 48 || e.which > 57) e.preventDefault() }

// 4. Validación y envío al servidor
async function guardarReserva() {
  error.value = ''
  reservaExitosa.value = null
  if (!vehiculo.value) return (error.value = 'Debes seleccionar un vehículo.')
  if (!form.value.nombreCliente.trim() || !form.value.documento.trim()) return (error.value = 'Completa tu nombre y documento.')
  if (!/^3\d{9}$/.test(form.value.telefono)) return (error.value = 'El celular debe tener 10 dígitos y empezar por 3.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.correo)) return (error.value = 'Ingresa un correo electrónico válido.')
  if (!form.value.fechaReserva || form.value.fechaReserva > '2050-12-30') return (error.value = 'Fecha no válida (máximo año 2050).')

  try {
    reservaExitosa.value = await reservasStore.crearReserva({
      ...form.value,
      marca: vehiculo.value.marca,
      modelo: vehiculo.value.modelo,
      precio: vehiculo.value.precio,
      currency: vehiculo.value.currency || 'USD'
    })
    form.value = { vehiculoId: '', nombreCliente: '', documento: '', telefono: '', correo: '', fechaReserva: '', observaciones: '' }
  } catch {
    error.value = 'Error al registrar la reserva en el servidor.'
  }
}
</script>

<template>
  <div class="contenedor">
    <NuxtLink to="/" class="btn-volver">⬅ Volver al Catálogo</NuxtLink>

    <!-- Caso 1: Sin vehículo seleccionado -->
    <div v-if="!route.query.vehiculoId || !vehiculo" class="tarjeta aviso">
      <h2>🚗 Selecciona un vehículo primero</h2>
      <p>Debes elegir un vehículo en el catálogo y pulsar <strong>Solicitar vehículo</strong>.</p>
      <NuxtLink to="/" class="btn-azul">Ir al Catálogo</NuxtLink>
    </div>

    <!-- Caso 2: Formulario activo -->
    <div v-else>
      <header class="cabecera">
        <h1>📋 Formulario de Reserva</h1>
        <p class="subtitulo">Registra tus datos para apartar el vehículo en el sistema.</p>
      </header>

      <div v-if="reservaExitosa" class="alerta exito">
        🎉 ¡Reserva registrada con éxito para <strong>{{ reservaExitosa.nombreCliente }}</strong>!
        Vehículo: <strong>{{ reservaExitosa.marca }} {{ reservaExitosa.modelo }}</strong>.
        <div style="margin-top: 8px;"><NuxtLink to="/" class="btn-volver">Ir al Catálogo</NuxtLink></div>
      </div>
      <div v-if="error || reservasStore.mensajeError" class="alerta error">
        ⚠️ {{ error || reservasStore.mensajeError }}
      </div>

      <div class="panel">
        <!-- Resumen del carro -->
        <div class="tarjeta">
          <h3>🚗 Vehículo Seleccionado</h3>
          <p><span>Vehículo:</span> <strong>{{ vehiculo.marca }} {{ vehiculo.modelo }}</strong></p>
          <p><span>Categoría:</span> <strong>{{ vehiculo.categoria }}</strong></p>
          <p><span>Año:</span> <strong>{{ vehiculo.anio }}</strong></p>
          <p><span>Color:</span> <strong>{{ vehiculo.color }}</strong></p>
          <div class="precio">
            <span>Precio:</span>
            <strong>${{ Number(vehiculo.precio).toLocaleString() }} {{ vehiculo.currency || 'USD' }}</strong>
          </div>
        </div>

        <!-- Formulario -->
        <form class="tarjeta form" @submit.prevent="guardarReserva">
          <h3>👤 Datos del Solicitante</h3>
          <label>Nombre completo *<input v-model="form.nombreCliente" required placeholder="Ej: Carlos Gómez" /></label>
          <div class="fila">
            <label>Documento *<input v-model="form.documento" required placeholder="Ej: 1098765432" /></label>
            <label>Celular (10 dígitos) *<input v-model="form.telefono" maxlength="10" required placeholder="3001234567" @keypress="soloNumeros" /></label>
          </div>
          <div class="fila">
            <label>Correo *<input v-model="form.correo" type="email" required placeholder="carlos@correo.com" /></label>
            <label>Fecha de Reserva *<input v-model="form.fechaReserva" type="date" max="2050-12-30" required /></label>
          </div>
          <label>Observaciones (opcional)<textarea v-model="form.observaciones" rows="2" placeholder="Indicaciones..."></textarea></label>
          <button type="submit" class="btn-azul" :disabled="reservasStore.cargando">
            {{ reservasStore.cargando ? 'Guardando...' : '💾 Confirmar Reserva' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor { max-width: 1000px; margin: 0 auto; padding: 24px 20px; }
.btn-volver { display: inline-block; background: #ffffff; color: #2563eb; padding: 8px 14px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-bottom: 20px; }
.cabecera { margin-bottom: 20px; }
h1 { color: #ffffff; margin: 0; font-size: 2rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
.subtitulo { color: #f1f5f9; margin: 6px 0 0; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
.tarjeta { background: #ffffff; border-radius: 12px; padding: 20px; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.aviso { text-align: center; max-width: 500px; margin: 40px auto; }
.panel { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }
@media (max-width: 768px) { .panel { grid-template-columns: 1fr; } }
h2, h3 { margin: 0 0 12px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
.tarjeta p { display: flex; justify-content: space-between; margin: 8px 0; font-size: 0.9rem; color: #334155; }
.tarjeta p span { color: #64748b; }
.precio { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 8px; }
.precio strong { color: #2563eb; font-size: 1.2rem; }
.form { display: flex; flex-direction: column; gap: 10px; }
.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 500px) { .fila { grid-template-columns: 1fr; } }
label { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; font-weight: 700; color: #0f172a; }
input, textarea { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.92rem; color: #0f172a; background: #ffffff; }
input:focus, textarea:focus { border-color: #2563eb; outline: none; }
.btn-azul { background: #2563eb; color: #ffffff; border: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; text-decoration: none; text-align: center; }
.btn-azul:hover { background: #1d4ed8; }
.alerta { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; font-size: 0.9rem; }
.exito { background: #dcfce7; color: #14532d; border: 1px solid #86efac; }
.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fca5a5; }
</style>
