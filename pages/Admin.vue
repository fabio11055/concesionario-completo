<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreAuth } from '~/stores/auth'
import { vehiculosService, type Vehiculo } from '~/pages/services/vehiculosService'
import { reservasService, type Reserva } from '~/pages/services/reservasService'

// Proteger la ruta con el middleware de admin
definePageMeta({
  middleware: 'admin',
})

const authStore = useStoreAuth()
const router = useRouter()

// Pestaña activa: 'solicitudes' | 'inventario' | 'nuevo'
const pestanaActiva = ref<'solicitudes' | 'inventario' | 'nuevo'>('solicitudes')

// Estados de inventario de vehículos
const vehiculos = ref<Vehiculo[]>([])
const cargandoVehiculos = ref(false)
const errorVehiculos = ref('')
const mensajeVehiculos = ref('')

// Estados de solicitudes / reservas
const solicitudes = ref<Reserva[]>([])
const cargandoSolicitudes = ref(false)
const errorSolicitudes = ref('')
const mensajeSolicitudes = ref('')

// Formulario para registrar nuevo vehículo
const formulario = ref({
  marca: '',
  modelo: '',
  categoria: '',
  anio: new Date().getFullYear(),
  precio: 0,
  color: '',
  estado: 'Disponible',
})
const guardandoVehiculo = ref(false)

// Filtro rápido de vehículos en el panel
const busquedaAdmin = ref('')

const vehiculosFiltradosAdmin = computed(() => {
  if (!busquedaAdmin.value.trim()) return vehiculos.value
  const q = busquedaAdmin.value.toLowerCase().trim()
  return vehiculos.value.filter(v =>
    v.marca.toLowerCase().includes(q) ||
    v.modelo.toLowerCase().includes(q) ||
    v.color.toLowerCase().includes(q) ||
    v.categoria.toLowerCase().includes(q)
  )
})

/**
 * Carga todos los vehículos desde la base de datos
 */
async function cargarVehiculos() {
  cargandoVehiculos.value = true
  errorVehiculos.value = ''

  try {
    const data = await vehiculosService.obtenerTodos()
    vehiculos.value = data.map(v => ({
      ...v,
      estado: v.estado || v.status || (v.disponible ? 'Disponible' : 'Agotado'),
      disponible: v.disponible !== undefined ? v.disponible : (v.estado === 'Disponible' || v.status === 'Disponible'),
    }))
  } catch {
    errorVehiculos.value = 'No se pudieron cargar los vehículos de la base de datos.'
  } finally {
    cargandoVehiculos.value = false
  }
}

/**
 * Carga todas las solicitudes/reservas desde la base de datos
 */
async function cargarSolicitudes() {
  cargandoSolicitudes.value = true
  errorSolicitudes.value = ''

  try {
    const data = await reservasService.obtenerTodas()
    solicitudes.value = data.sort((a, b) => {
      const fechaA = new Date(a.fechaCreacion || a.fecha).getTime()
      const fechaB = new Date(b.fechaCreacion || b.fecha).getTime()
      return fechaB - fechaA
    })
  } catch {
    errorSolicitudes.value = 'No se pudieron cargar las solicitudes de la base de datos.'
  } finally {
    cargandoSolicitudes.value = false
  }
}

/**
 * Agrega un nuevo vehículo a la base de datos del servidor
 */
async function crearVehiculo() {
  mensajeVehiculos.value = ''
  errorVehiculos.value = ''

  if (
    !formulario.value.marca.trim() ||
    !formulario.value.modelo.trim() ||
    !formulario.value.categoria.trim() ||
    !formulario.value.color.trim() ||
    formulario.value.precio <= 0
  ) {
    errorVehiculos.value = 'Por favor completa todos los campos con valores válidos.'
    return
  }

  guardandoVehiculo.value = true

  try {
    const { marca, modelo, categoria, anio, precio, color, estado } = formulario.value
    await vehiculosService.crear({
      name: `${marca} ${modelo}`,
      marca,
      modelo,
      category: categoria,
      categoria,
      year: anio,
      anio,
      price: precio,
      precio,
      currency: 'USD',
      color,
      status: estado,
      estado,
      disponible: estado === 'Disponible',
    })

    mensajeVehiculos.value = `¡Vehículo ${marca} ${modelo} registrado con éxito en la base de datos!`
    formulario.value = {
      marca: '',
      modelo: '',
      categoria: '',
      anio: new Date().getFullYear(),
      precio: 0,
      color: '',
      estado: 'Disponible',
    }

    await cargarVehiculos()
    pestanaActiva.value = 'inventario'
  } catch {
    errorVehiculos.value = 'Error al guardar el vehículo en la base de datos.'
  } finally {
    guardandoVehiculo.value = false
  }
}

/**
 * Cambia el estado (Disponible / Agotado) de un vehículo en la base de datos
 */
async function cambiarEstadoVehiculo(vehiculo: Vehiculo) {
  const nuevoEstado = vehiculo.estado === 'Disponible' ? 'Agotado' : 'Disponible'
  try {
    await vehiculosService.actualizar(vehiculo.id, {
      estado: nuevoEstado,
      status: nuevoEstado,
      disponible: nuevoEstado === 'Disponible',
    })
    mensajeVehiculos.value = `Estado de "${vehiculo.marca} ${vehiculo.modelo}" actualizado a ${nuevoEstado}.`
    await cargarVehiculos()
  } catch {
    errorVehiculos.value = 'No se pudo actualizar el estado en el servidor.'
  }
}

/**
 * Elimina un vehículo de la base de datos
 */
async function eliminarVehiculo(vehiculo: Vehiculo) {
  const confirmar = window.confirm(`¿Estás seguro de eliminar "${vehiculo.marca} ${vehiculo.modelo}" de la base de datos?`)
  if (!confirmar) return

  try {
    await vehiculosService.eliminar(vehiculo.id)
    mensajeVehiculos.value = `Vehículo "${vehiculo.marca} ${vehiculo.modelo}" eliminado correctamente.`
    await cargarVehiculos()
  } catch {
    errorVehiculos.value = 'No se pudo eliminar el vehículo del servidor.'
  }
}

/**
 * Cambia el estado de una solicitud (Confirmada / Cancelada) en la base de datos
 */
async function cambiarEstadoSolicitud(solicitud: Reserva, nuevoEstado: 'Confirmada' | 'Cancelada') {
  try {
    await reservasService.actualizar(solicitud.id, { estado: nuevoEstado })
    mensajeSolicitudes.value = `Solicitud #${solicitud.id} marcada como ${nuevoEstado}.`
    await cargarSolicitudes()
  } catch {
    errorSolicitudes.value = 'No se pudo actualizar el estado de la solicitud.'
  }
}

/**
 * Elimina una solicitud de la base de datos
 */
async function eliminarSolicitud(solicitud: Reserva) {
  const confirmar = window.confirm(`¿Eliminar la solicitud de ${solicitud.nombre}?`)
  if (!confirmar) return

  try {
    await reservasService.eliminar(solicitud.id)
    mensajeSolicitudes.value = `Solicitud #${solicitud.id} eliminada de la base de datos.`
    await cargarSolicitudes()
  } catch {
    errorSolicitudes.value = 'No se pudo eliminar la solicitud.'
  }
}

function salirAdmin() {
  authStore.cerrarSesion()
  router.push('/')
}

onMounted(() => {
  // Verificación adicional de rol
  if (!authStore.esAdmin) {
    router.push({ path: '/', query: { alerta: 'acceso-denegado' } })
    return
  }
  cargarVehiculos()
  cargarSolicitudes()
})
</script>

<template>
  <main class="panel-admin">
    <!-- Encabezado con perfil y botón salir -->
    <header class="encabezado-admin">
      <div>
        <div class="badge-rol">
          <span>👑 Módulo de Administrador</span>
        </div>
        <h1>Panel de Control del Concesionario</h1>
        <p class="subtitulo-admin">
          Supervisa solicitudes de clientes, administra el inventario, agrega nuevos vehículos o elimina existentes.
        </p>
      </div>

      <div class="acciones-encabezado">
        <NuxtLink to="/" class="btn-catalogo">
          ⬅ Ver Catálogo
        </NuxtLink>
        <button type="button" class="btn-cerrar-sesion" @click="salirAdmin">
          Cerrar Sesión Admin
        </button>
      </div>
    </header>

    <!-- Pestañas de Navegación del Panel de Admin -->
    <div class="barra-pestanas">
      <button
        type="button"
        class="pestana"
        :class="{ activa: pestanaActiva === 'solicitudes' }"
        @click="pestanaActiva = 'solicitudes'"
      >
        📋 Solicitudes Recibidas ({{ solicitudes.length }})
      </button>

      <button
        type="button"
        class="pestana"
        :class="{ activa: pestanaActiva === 'inventario' }"
        @click="pestanaActiva = 'inventario'"
      >
        🚗 Inventario de Vehículos ({{ vehiculos.length }})
      </button>

      <button
        type="button"
        class="pestana"
        :class="{ activa: pestanaActiva === 'nuevo' }"
        @click="pestanaActiva = 'nuevo'"
      >
        ➕ Registrar Nuevo Vehículo
      </button>
    </div>

    <!-- SECCIÓN 1: SOLICITUDES RECIBIDAS -->
    <section v-if="pestanaActiva === 'solicitudes'" class="seccion-panel">
      <div class="seccion-cabecera">
        <div>
          <h2>📋 Solicitudes de Clientes</h2>
          <p>Revisa y gestiona las solicitudes de vehículos enviadas por los usuarios desde la página principal.</p>
        </div>
        <button type="button" class="btn-refrescar" @click="cargarSolicitudes">
          🔄 Actualizar
        </button>
      </div>

      <div v-if="mensajeSolicitudes" class="alerta-exito">
        <span>{{ mensajeSolicitudes }}</span>
        <button type="button" @click="mensajeSolicitudes = ''">✕</button>
      </div>

      <div v-if="errorSolicitudes" class="alerta-error">
        <span>{{ errorSolicitudes }}</span>
        <button type="button" @click="errorSolicitudes = ''">✕</button>
      </div>

      <div v-if="cargandoSolicitudes" class="estado-cargando">
        <div class="spinner" />
        <p>Cargando solicitudes desde la base de datos...</p>
      </div>

      <div v-else-if="solicitudes.length === 0" class="caja-vacia">
        <p>📭 No hay solicitudes registradas todavía en la base de datos.</p>
      </div>

      <div v-else class="lista-solicitudes">
        <article
          v-for="sol in solicitudes"
          :key="sol.id"
          class="tarjeta-solicitud"
        >
          <div class="solicitud-header">
            <div>
              <span class="solicitud-id">Solicitud #{{ sol.id }}</span>
              <h3 class="solicitud-cliente">{{ sol.nombre }}</h3>
            </div>
            <span
              class="solicitud-estado"
              :class="sol.estado ? sol.estado.toLowerCase() : 'pendiente'"
            >
              {{ sol.estado || 'Pendiente' }}
            </span>
          </div>

          <div class="solicitud-detalles">
            <p><strong>🚗 Vehículo:</strong> {{ sol.vehiculo || `ID #${sol.productId}` }}</p>
            <p><strong>📞 Teléfono:</strong> {{ sol.telefono }}</p>
            <p v-if="sol.email"><strong>✉️ Correo:</strong> {{ sol.email }}</p>
            <p><strong>📅 Fecha de Visita:</strong> {{ sol.fecha }}</p>
            <p v-if="sol.mensaje" class="solicitud-mensaje">
              <strong>💬 Notas:</strong> "{{ sol.mensaje }}"
            </p>
          </div>

          <div class="solicitud-acciones">
            <button
              v-if="sol.estado !== 'Confirmada'"
              type="button"
              class="btn-confirmar-sol"
              @click="cambiarEstadoSolicitud(sol, 'Confirmada')"
            >
              ✓ Confirmar
            </button>
            <button
              v-if="sol.estado !== 'Cancelada'"
              type="button"
              class="btn-cancelar-sol"
              @click="cambiarEstadoSolicitud(sol, 'Cancelada')"
            >
              ✕ Cancelar
            </button>
            <button
              type="button"
              class="btn-eliminar-sol"
              @click="eliminarSolicitud(sol)"
            >
              🗑 Eliminar
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- SECCIÓN 2: INVENTARIO DE VEHÍCULOS (ELIMINAR / MODIFICAR ESTADO) -->
    <section v-else-if="pestanaActiva === 'inventario'" class="seccion-panel">
      <div class="seccion-cabecera">
        <div>
          <h2>🚗 Inventario General de Vehículos</h2>
          <p>Visualiza todos los carros registrados, cambia su disponibilidad o elimínalos de la base de datos.</p>
        </div>
        <button type="button" class="btn-refrescar" @click="cargarVehiculos">
          🔄 Actualizar
        </button>
      </div>

      <div class="filtro-admin">
        <input
          v-model="busquedaAdmin"
          type="text"
          placeholder="Filtrar por marca, modelo o categoría en este inventario..."
        />
      </div>

      <div v-if="mensajeVehiculos" class="alerta-exito">
        <span>{{ mensajeVehiculos }}</span>
        <button type="button" @click="mensajeVehiculos = ''">✕</button>
      </div>

      <div v-if="errorVehiculos" class="alerta-error">
        <span>{{ errorVehiculos }}</span>
        <button type="button" @click="errorVehiculos = ''">✕</button>
      </div>

      <div v-if="cargandoVehiculos" class="estado-cargando">
        <div class="spinner" />
        <p>Cargando vehículos desde la base de datos...</p>
      </div>

      <div v-else-if="vehiculosFiltradosAdmin.length === 0" class="caja-vacia">
        <p>No se encontraron vehículos.</p>
      </div>

      <div v-else class="tabla-vehiculos-admin">
        <div
          v-for="v in vehiculosFiltradosAdmin"
          :key="v.id"
          class="fila-vehiculo-admin"
        >
          <div class="vehiculo-info-col">
            <div class="marca-modelo-admin">
              <span class="badge-marca-admin">{{ v.marca }}</span>
              <h4>{{ v.modelo }}</h4>
              <span
                class="badge-estado-admin"
                :class="v.disponible ? 'disponible' : 'agotado'"
              >
                {{ v.disponible ? 'Disponible' : 'Agotado' }}
              </span>
            </div>
            <div class="datos-tecnicos-admin">
              <span><strong>Cat:</strong> {{ v.categoria || v.category }}</span>
              <span>·</span>
              <span><strong>Año:</strong> {{ v.anio || v.year }}</span>
              <span>·</span>
              <span><strong>Color:</strong> {{ v.color }}</span>
              <span>·</span>
              <span class="precio-destacado-admin">
                ${{ Number(v.precio || v.price || 0).toLocaleString('en-US') }} USD
              </span>
            </div>
          </div>

          <div class="vehiculo-acciones-col">
            <button
              type="button"
              class="btn-toggle-estado"
              :class="v.disponible ? 'btn-agotado-admin' : 'btn-disponible-admin'"
              @click="cambiarEstadoVehiculo(v)"
            >
              {{ v.disponible ? 'Marcar como Agotado' : 'Marcar como Disponible' }}
            </button>
            <button
              type="button"
              class="btn-eliminar-admin"
              title="Eliminar este vehículo de la base de datos"
              @click="eliminarVehiculo(v)"
            >
              🗑 Eliminar
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 3: REGISTRAR NUEVO VEHÍCULO ("q carros agg") -->
    <section v-else-if="pestanaActiva === 'nuevo'" class="seccion-panel">
      <div class="seccion-cabecera">
        <div>
          <h2>➕ Registrar Nuevo Vehículo</h2>
          <p>Llena los datos para agregar un nuevo auto al catálogo de la base de datos.</p>
        </div>
      </div>

      <div v-if="mensajeVehiculos" class="alerta-exito">
        <span>{{ mensajeVehiculos }}</span>
        <button type="button" @click="mensajeVehiculos = ''">✕</button>
      </div>

      <div v-if="errorVehiculos" class="alerta-error">
        <span>{{ errorVehiculos }}</span>
        <button type="button" @click="errorVehiculos = ''">✕</button>
      </div>

      <form class="formulario-admin" @submit.prevent="crearVehiculo">
        <div class="grid-formulario">
          <label>
            Marca del carro *
            <input
              v-model="formulario.marca"
              type="text"
              required
              placeholder="Ej: Toyota, Ford, Chevrolet..."
            />
          </label>

          <label>
            Modelo *
            <input
              v-model="formulario.modelo"
              type="text"
              required
              placeholder="Ej: Corolla Cross, Mustang GT..."
            />
          </label>

          <label>
            Categoría *
            <input
              v-model="formulario.categoria"
              type="text"
              required
              placeholder="Ej: SUV, Sedán, Deportivo, Camioneta..."
            />
          </label>

          <label>
            Año de fabricación *
            <input
              v-model.number="formulario.anio"
              type="number"
              min="1990"
              max="2030"
              required
            />
          </label>

          <label>
            Precio en USD *
            <input
              v-model.number="formulario.precio"
              type="number"
              min="500"
              required
              placeholder="Ej: 28500"
            />
          </label>

          <label>
            Color *
            <input
              v-model="formulario.color"
              type="text"
              required
              placeholder="Ej: Blanco Perlado, Gris Grafito..."
            />
          </label>

          <label>
            Estado inicial *
            <select v-model="formulario.estado">
              <option value="Disponible">Disponible</option>
              <option value="Agotado">Agotado</option>
            </select>
          </label>
        </div>

        <div class="acciones-formulario-admin">
          <button
            type="submit"
            class="btn-guardar-admin"
            :disabled="guardandoVehiculo"
          >
            {{ guardandoVehiculo ? 'Guardando en la base de datos...' : '💾 Registrar Vehículo en BD' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.panel-admin {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
}

.encabezado-admin {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.badge-rol {
  display: inline-block;
  background-color: #fef3c7;
  color: #92400e;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #fde68a;
  margin-bottom: 6px;
}

h1 {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
}

.subtitulo-admin {
  color: #64748b;
  margin: 4px 0 0 0;
  font-size: 0.95rem;
}

.acciones-encabezado {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn-catalogo {
  padding: 9px 15px;
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.btn-catalogo:hover {
  background-color: #dbeafe;
}

.btn-cerrar-sesion {
  padding: 9px 15px;
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-cerrar-sesion:hover {
  background-color: #fecaca;
}

.barra-pestanas {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 24px;
  overflow-x: auto;
}

.pestana {
  padding: 12px 20px;
  border: none;
  background: none;
  color: #64748b;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.pestana:hover {
  color: #2563eb;
}

.pestana.activa {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background-color: #eff6ff;
  border-radius: 8px 8px 0 0;
}

.seccion-panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.seccion-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.seccion-cabecera h2 {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.seccion-cabecera p {
  margin: 4px 0 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.btn-refrescar {
  padding: 8px 14px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.alerta-exito {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #dcfce7;
  color: #14532d;
  border: 1px solid #86efac;
  border-radius: 8px;
  margin-bottom: 18px;
  font-weight: 600;
}

.alerta-error {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  margin-bottom: 18px;
  font-weight: 600;
}

.alerta-exito button,
.alerta-error button {
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: inherit;
}

.estado-cargando {
  text-align: center;
  padding: 40px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.caja-vacia {
  text-align: center;
  padding: 40px;
  color: #64748b;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

/* Solicitudes */
.lista-solicitudes {
  display: grid;
  gap: 16px;
}

.tarjeta-solicitud {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 18px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;
}

.tarjeta-solicitud:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.solicitud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
}

.solicitud-id {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.solicitud-cliente {
  margin: 2px 0 0 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.solicitud-estado {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.solicitud-estado.pendiente {
  background-color: #fef3c7;
  color: #92400e;
}

.solicitud-estado.confirmada {
  background-color: #dcfce7;
  color: #15803d;
}

.solicitud-estado.cancelada {
  background-color: #fee2e2;
  color: #b91c1c;
}

.solicitud-detalles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  font-size: 0.9rem;
  color: #334155;
}

.solicitud-detalles p {
  margin: 0;
}

.solicitud-mensaje {
  grid-column: 1 / -1;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #cbd5e1;
  font-style: italic;
}

.solicitud-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.btn-confirmar-sol {
  padding: 7px 14px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-confirmar-sol:hover {
  background: #15803d;
}

.btn-cancelar-sol {
  padding: 7px 14px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-cancelar-sol:hover {
  background: #e2e8f0;
}

.btn-eliminar-sol {
  padding: 7px 14px;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-eliminar-sol:hover {
  background: #fecaca;
}

/* Inventario Admin */
.filtro-admin {
  margin-bottom: 16px;
}

.filtro-admin input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 0.95rem;
}

.tabla-vehiculos-admin {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fila-vehiculo-admin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  gap: 16px;
  transition: all 0.2s;
}

.fila-vehiculo-admin:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.vehiculo-info-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.marca-modelo-admin {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge-marca-admin {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.marca-modelo-admin h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.badge-estado-admin {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.badge-estado-admin.disponible {
  background: #dcfce7;
  color: #15803d;
}

.badge-estado-admin.agotado {
  background: #fee2e2;
  color: #b91c1c;
}

.datos-tecnicos-admin {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
  flex-wrap: wrap;
}

.precio-destacado-admin {
  color: #2563eb;
  font-weight: 700;
}

.vehiculo-acciones-col {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-toggle-estado {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-agotado-admin {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.btn-agotado-admin:hover {
  background: #fde68a;
}

.btn-disponible-admin {
  background: #dcfce7;
  color: #15803d;
  border-color: #86efac;
}

.btn-disponible-admin:hover {
  background: #bbf7d0;
}

.btn-eliminar-admin {
  padding: 8px 14px;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-eliminar-admin:hover {
  background: #fecaca;
}

/* Formulario Nuevo */
.formulario-admin {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grid-formulario {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.grid-formulario label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
}

.grid-formulario input,
.grid-formulario select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
  font-size: 0.95rem;
  outline: none;
}

.grid-formulario input:focus,
.grid-formulario select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.acciones-formulario-admin {
  display: flex;
  justify-content: flex-end;
}

.btn-guardar-admin {
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-guardar-admin:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-guardar-admin:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 768px) {
  .encabezado-admin,
  .fila-vehiculo-admin {
    flex-direction: column;
    align-items: stretch;
  }

  .grid-formulario {
    grid-template-columns: 1fr;
  }
}
</style>
