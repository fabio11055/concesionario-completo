<script setup>
import { ref, watch, onMounted } from 'vue'
import { vehiculosService } from '~/pages/services/vehiculosService'
import { reservasService } from '~/pages/services/reservasService'
import BuscadorFiltro from '~/components/BuscadorFiltro.vue'
import TarjetaVehiculo from '~/components/TarjetaVehiculo.vue'
import BotonReserva from '~/components/BotonReserva.vue'

// Lista reactiva de vehículos mostrados en el catálogo
const listaVehiculos = ref([])
const cargandoInicial = ref(true)
const cargandoMas = ref(false)
const cargandoFiltro = ref(false)
const sinMasAutos = ref(false)
const totalEnServidor = ref(0)

// Filtro de marca en tiempo real conectado al servidor
const filtroTexto = ref('')
const modoFiltroActivo = ref(false)

// Estado del Modal de Solicitud ("Solicitar vehículo")
const vehiculoSeleccionado = ref(null)
const datosSolicitud = ref({
  nombre: '',
  telefono: '',
  email: '',
  fecha: '',
  mensaje: '',
})
const enviandoSolicitud = ref(false)
const errorSolicitud = ref('')
const mensajeConfirmacion = ref('')

/**
 * Normaliza los datos de un vehículo proveniente del backend
 */
function normalizarVehiculo(item) {
  const partes = (item.name || '').split(' ')
  return {
    id: item.id,
    marca: item.marca || partes[0] || 'Vehículo',
    modelo: item.modelo || partes.slice(1).join(' ') || item.name || '',
    categoria: item.categoria || item.category || 'General',
    anio: item.anio || item.year || 2024,
    precio: item.precio || item.price || 0,
    color: item.color || 'No especificado',
    disponible: item.disponible !== undefined ? item.disponible : (item.estado === 'Disponible' || item.status === 'Disponible'),
    estado: item.estado || item.status || (item.disponible ? 'Disponible' : 'Agotado'),
  }
}

// Carga asíncrona SSR/inicial de los primeros 6 vehículos
const { data: datosIniciales } = await useAsyncData('primeros-6-vehiculos', () =>
  vehiculosService.obtenerPaginados(0, 6)
)

if (datosIniciales.value?.data && datosIniciales.value.data.length > 0) {
  listaVehiculos.value = datosIniciales.value.data.map(normalizarVehiculo)
  totalEnServidor.value = datosIniciales.value.total || listaVehiculos.value.length
  sinMasAutos.value = !datosIniciales.value.hasMore || listaVehiculos.value.length >= totalEnServidor.value
  cargandoInicial.value = false
}

/**
 * Carga inicial: Extrae estrictamente los primeros 6 carros del servidor
 */
async function cargarPrimeros6Autos() {
  cargandoInicial.value = true
  sinMasAutos.value = false
  modoFiltroActivo.value = false

  try {
    const respuesta = await vehiculosService.obtenerPaginados(0, 6)
    listaVehiculos.value = (respuesta.data || []).map(normalizarVehiculo)
    totalEnServidor.value = respuesta.total || listaVehiculos.value.length
    sinMasAutos.value = !respuesta.hasMore || listaVehiculos.value.length >= totalEnServidor.value
  } catch (err) {
    console.error('Error al cargar los 6 carros iniciales desde el servidor:', err)
  } finally {
    cargandoInicial.value = false
  }
}

/**
 * Extrae otros 5 autos del servidor al hacer clic en "Mostrar más"
 */
async function mostrarMasAutos() {
  if (sinMasAutos.value || cargandoMas.value || modoFiltroActivo.value) return

  cargandoMas.value = true

  try {
    const inicio = listaVehiculos.value.length
    const respuesta = await vehiculosService.obtenerPaginados(inicio, 5)

    if (respuesta.data && respuesta.data.length > 0) {
      const nuevos = respuesta.data.map(normalizarVehiculo)
      // Evitar duplicados por id
      const idsExistentes = new Set(listaVehiculos.value.map(v => String(v.id)))
      const filtradosNuevos = nuevos.filter(v => !idsExistentes.has(String(v.id)))
      listaVehiculos.value.push(...filtradosNuevos)
    }

    totalEnServidor.value = respuesta.total || totalEnServidor.value

    // Si ya no hay más carros en el servidor o el lote vino vacío
    if (!respuesta.hasMore || respuesta.data.length === 0 || listaVehiculos.value.length >= totalEnServidor.value) {
      sinMasAutos.value = true
    }
  } catch (err) {
    console.error('Error al extraer más autos del servidor:', err)
  } finally {
    cargandoMas.value = false
  }
}

/**
 * Consulta y extrae del servidor todos los carros de la marca especificada en el filtro
 */
let temporizadorBusqueda = null
watch(filtroTexto, (nuevoValor) => {
  if (temporizadorBusqueda) clearTimeout(temporizadorBusqueda)

  const termino = nuevoValor.trim()

  if (!termino) {
    // Si el usuario borra el filtro, restablecer los primeros 6 autos y la paginación
    cargarPrimeros6Autos()
    return
  }

  temporizadorBusqueda = setTimeout(async () => {
    cargandoFiltro.value = true
    modoFiltroActivo.value = true

    try {
      // Extrae del servidor TODOS los carros de esa marca desplegados en la BD
      const autosMarca = await vehiculosService.obtenerPorMarca(termino)
      listaVehiculos.value = (autosMarca || []).map(normalizarVehiculo)
      sinMasAutos.value = true
    } catch (err) {
      console.error('Error al filtrar marca en el servidor:', err)
      listaVehiculos.value = []
    } finally {
      cargandoFiltro.value = false
    }
  }, 350)
})

/**
 * Inicia el proceso de solicitud para el vehículo seleccionado
 */
function procesarSolicitud(id) {
  const carro = listaVehiculos.value.find(v => String(v.id) === String(id))
  if (!carro || !carro.disponible) return

  vehiculoSeleccionado.value = carro
  datosSolicitud.value = {
    nombre: '',
    telefono: '',
    email: '',
    fecha: '',
    mensaje: '',
  }
  errorSolicitud.value = ''
}

/**
 * Envía la solicitud a la base de datos del servidor y notifica al usuario
 */
async function enviarSolicitud() {
  if (!vehiculoSeleccionado.value) return

  enviandoSolicitud.value = true
  errorSolicitud.value = ''

  try {
    await reservasService.crear({
      productId: vehiculoSeleccionado.value.id,
      vehiculo: `${vehiculoSeleccionado.value.marca} ${vehiculoSeleccionado.value.modelo}`,
      nombre: datosSolicitud.value.nombre.trim(),
      telefono: datosSolicitud.value.telefono.trim(),
      email: datosSolicitud.value.email.trim(),
      fecha: datosSolicitud.value.fecha,
      mensaje: datosSolicitud.value.mensaje.trim(),
      estado: 'Pendiente',
      fechaCreacion: new Date().toISOString(),
    })

    mensajeConfirmacion.value = `¡Solicitud enviada exitosamente para ${vehiculoSeleccionado.value.marca} ${vehiculoSeleccionado.value.modelo}! Un asesor se comunicará contigo pronto.`
    vehiculoSeleccionado.value = null
  } catch (err) {
    console.error('Error al enviar la solicitud al servidor:', err)
    errorSolicitud.value = 'No se pudo registrar la solicitud. Por favor intenta de nuevo.'
  } finally {
    enviandoSolicitud.value = false
  }
}

onMounted(() => {
  if (listaVehiculos.value.length === 0) {
    cargarPrimeros6Autos()
  }
})
</script>

<template>
  <div class="pagina-concesionario">
    <!-- Encabezado de la página -->
    <header class="encabezado-seccion">
      <div class="titulo-con-badge">
        <h1>🚗 Catálogo de Vehículos</h1>
        <span v-if="!modoFiltroActivo" class="badge-total">
          {{ listaVehiculos.length }} de {{ totalEnServidor }} disponibles en BD
        </span>
      </div>
      <p class="subtitulo">
        Explora nuestros vehículos en tiempo real, filtra por marca o solicita el auto de tus sueños.
      </p>
    </header>

    <!-- Buscador/Filtro conectado al servidor -->
    <BuscadorFiltro v-model="filtroTexto" />

    <!-- Notificación de éxito al enviar solicitud -->
    <transition name="fade">
      <div v-if="mensajeConfirmacion" class="mensaje-exito">
        <div class="mensaje-exito-texto">
          <span>✅ {{ mensajeConfirmacion }}</span>
        </div>
        <button
          type="button"
          class="btn-cerrar-alerta"
          title="Cerrar notificación"
          @click="mensajeConfirmacion = ''"
        >
          ✕
        </button>
      </div>
    </transition>

    <!-- Indicador de carga inicial o de filtro -->
    <div v-if="cargandoInicial || cargandoFiltro" class="estado-cargando">
      <div class="spinner" />
      <p v-if="cargandoFiltro">
        Extrayendo del servidor vehículos de la marca "<strong>{{ filtroTexto }}</strong>"...
      </p>
      <p v-else>Cargando vehículos desde la base de datos...</p>
    </div>

    <!-- Catálogo de Vehículos en Grilla -->
    <div v-else-if="listaVehiculos.length > 0" class="seccion-catalogo">
      <div class="grilla-catalogo">
        <div
          v-for="carro in listaVehiculos"
          :key="carro.id"
          class="bloque-tarjeta"
        >
          <TarjetaVehiculo :vehiculo="carro" />
          <BotonReserva
            :vehiculo-id="carro.id"
            :disponible="carro.disponible"
            @solicitar="procesarSolicitud"
          />
        </div>
      </div>

      <!-- Zona de Paginación / "Mostrar más" (solo cuando no está filtrando) -->
      <div v-if="!modoFiltroActivo" class="zona-paginacion">
        <!-- Botón Mostrar más mientras haya datos en el server -->
        <button
          v-if="!sinMasAutos"
          type="button"
          class="btn-mostrar-mas"
          :disabled="cargandoMas"
          @click="mostrarMasAutos"
        >
          <span v-if="cargandoMas" class="loader-btn">
            ⏳ Extrayendo 5 autos más del servidor...
          </span>
          <span v-else>
            ➕ Mostrar más (+5 vehículos)
          </span>
        </button>

        <!-- Mensaje cuando ya no hay más datos en el server -->
        <div v-else class="mensaje-fin-catalogo">
          <p class="texto-fin">
            🏁 <strong>Estos son todos los carros disponibles</strong>
          </p>
          <p class="subtexto-fin">
            Has explorado el inventario completo registrado en la base de datos.
          </p>
        </div>
      </div>

      <!-- Información cuando está en modo filtro por marca -->
      <div v-else class="zona-modo-filtro">
        <p>
          Mostrando <strong>{{ listaVehiculos.length }}</strong> vehículo(s) extraído(s) del servidor para la marca "<strong>{{ filtroTexto }}</strong>".
        </p>
        <button
          type="button"
          class="btn-restablecer"
          @click="filtroTexto = ''"
        >
          Ver los 6 principales de nuevo
        </button>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else class="sin-resultados">
      <p class="texto-vacio">
        ⚠️ No se encontraron vehículos de la marca "<strong>{{ filtroTexto }}</strong>" desplegados en el servidor.
      </p>
      <button
        type="button"
        class="btn-limpiar"
        @click="filtroTexto = ''"
      >
        Limpiar filtro y ver catálogo
      </button>
    </div>

    <!-- Modal para Solicitar Vehículo ("y si unde solicitar ps q llene los datos y hasta ahi") -->
    <div
      v-if="vehiculoSeleccionado"
      class="modal-fondo"
      @click.self="vehiculoSeleccionado = null"
    >
      <section
        class="modal-solicitud"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-solicitud"
      >
        <div class="modal-solicitud-header">
          <div>
            <span class="subtitulo-modal">Formulario de Solicitud</span>
            <h2 id="titulo-solicitud">
              Solicitar {{ vehiculoSeleccionado.marca }} {{ vehiculoSeleccionado.modelo }}
            </h2>
          </div>
          <button
            type="button"
            class="btn-cerrar-modal"
            @click="vehiculoSeleccionado = null"
          >
            ✕
          </button>
        </div>

        <p class="modal-info-carro">
          Precio de referencia: <strong>${{ Number(vehiculoSeleccionado.precio).toLocaleString('en-US') }} USD</strong> · Año: <strong>{{ vehiculoSeleccionado.anio }}</strong>
        </p>

        <form class="formulario-solicitud" @submit.prevent="enviarSolicitud">
          <label>
            Nombre completo *
            <input
              v-model="datosSolicitud.nombre"
              type="text"
              required
              maxlength="100"
              placeholder="Ej: Juan Pérez"
              autofocus
            />
          </label>

          <div class="fila-dos-campos">
            <label>
              Teléfono de contacto *
              <input
                v-model="datosSolicitud.telefono"
                type="tel"
                required
                maxlength="30"
                placeholder="+57 300 1234567"
              />
            </label>

            <label>
              Correo electrónico *
              <input
                v-model="datosSolicitud.email"
                type="email"
                required
                placeholder="juan@ejemplo.com"
              />
            </label>
          </div>

          <label>
            Fecha estimada de visita / cita *
            <input
              v-model="datosSolicitud.fecha"
              type="date"
              required
            />
          </label>

          <label>
            Mensaje o consulta adicional (opcional)
            <textarea
              v-model="datosSolicitud.mensaje"
              rows="3"
              placeholder="Comentarios, opciones de financiamiento, retoma de vehículo, etc..."
            />
          </label>

          <p v-if="errorSolicitud" class="error-solicitud">{{ errorSolicitud }}</p>

          <div class="acciones-solicitud">
            <button
              type="button"
              class="boton-cancelar"
              @click="vehiculoSeleccionado = null"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="boton-confirmar"
              :disabled="enviandoSolicitud"
            >
              {{ enviandoSolicitud ? 'Enviando solicitud...' : 'Enviar Solicitud' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.pagina-concesionario {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
}

.encabezado-seccion {
  margin-bottom: 24px;
}

.titulo-con-badge {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

h1 {
  color: #0f172a;
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.badge-total {
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #bae6fd;
}

.subtitulo {
  color: #64748b;
  margin: 6px 0 0 0;
  font-size: 1rem;
}

.mensaje-exito {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background-color: #dcfce7;
  color: #14532d;
  border: 1px solid #86efac;
  border-radius: 10px;
  margin-bottom: 24px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(20, 83, 45, 0.08);
}

.btn-cerrar-alerta {
  background: none;
  border: none;
  color: #14532d;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0 4px;
}

.estado-cargando {
  text-align: center;
  padding: 60px 20px;
  color: #475569;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.seccion-catalogo {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.grilla-catalogo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 24px;
}

.bloque-tarjeta {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
}

.zona-paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.btn-mostrar-mas {
  padding: 14px 32px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transition: all 0.2s ease;
}

.btn-mostrar-mas:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-mostrar-mas:disabled {
  opacity: 0.7;
  cursor: wait;
}

.mensaje-fin-catalogo {
  text-align: center;
  padding: 24px 32px;
  background-color: #f1f5f9;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
}

.texto-fin {
  margin: 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.subtexto-fin {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.zona-modo-filtro {
  text-align: center;
  padding: 16px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  color: #1e40af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.zona-modo-filtro p {
  margin: 0;
}

.btn-restablecer {
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
}

.btn-restablecer:hover {
  background-color: #1d4ed8;
}

.sin-resultados {
  text-align: center;
  padding: 50px 20px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.texto-vacio {
  font-size: 1.05rem;
  color: #475569;
  margin: 0 0 16px 0;
}

.btn-limpiar {
  padding: 10px 20px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.modal-fondo {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(2px);
}

.modal-solicitud {
  width: min(100%, 500px);
  max-height: 90vh;
  overflow-y: auto;
  padding: 26px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-solicitud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.subtitulo-modal {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.modal-solicitud h2 {
  margin: 2px 0 0 0;
  color: #0f172a;
  font-size: 1.35rem;
}

.btn-cerrar-modal {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

.modal-info-carro {
  font-size: 0.9rem;
  color: #475569;
  margin: 0 0 18px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.formulario-solicitud {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.formulario-solicitud label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
}

.formulario-solicitud input,
.formulario-solicitud textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.formulario-solicitud input:focus,
.formulario-solicitud textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.fila-dos-campos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.error-solicitud {
  margin: 0;
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 600;
}

.acciones-solicitud {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.boton-cancelar {
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
}

.boton-cancelar:hover {
  background: #e2e8f0;
}

.boton-confirmar {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.boton-confirmar:hover:not(:disabled) {
  background: #1d4ed8;
}

.boton-confirmar:disabled {
  opacity: 0.7;
  cursor: wait;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .fila-dos-campos {
    grid-template-columns: 1fr;
  }
}
</style>
