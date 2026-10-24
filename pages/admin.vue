<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '~/stores/admin'

const adminStore = useAdminStore()

// 1. Estado reactivo principal
const tab = ref('vehiculos')
const busqueda = ref('')
const filtroEstado = ref('todos')
const email = ref(''), password = ref(''), errorLogin = ref('')
const modalVehiculo = ref(false)
const itemAEliminar = ref(null)

const formVehiculo = ref({
  id: null, marca: '', modelo: '', categoria: 'Sedán', anio: 2024, color: '', precio: 25000, currency: 'USD', disponible: true
})
const categorias = ['Sedán', 'SUV', 'Deportivo', 'Camioneta', 'Hatchback', 'Eléctrico']

// 2. Carga y verificación de sesión
onMounted(async () => {
  adminStore.verificarSesion()
  if (adminStore.estaAutenticado) await adminStore.cargarTodo()
})

function iniciarSesion() {
  errorLogin.value = ''
  if (adminStore.iniciarSesion(email.value, password.value)) {
    email.value = ''
    password.value = ''
    adminStore.cargarTodo()
  } else {
    errorLogin.value = adminStore.mensajeError || 'Credenciales inválidas.'
  }
}

// 3. Filtrado de vehículos
const vehiculosFiltrados = computed(() => {
  return adminStore.inventarioVehiculos.filter((c) => {
    const t = busqueda.value.toLowerCase()
    const coincideTexto = !t || c.marca.toLowerCase().includes(t) || c.modelo.toLowerCase().includes(t) || String(c.id).includes(t)
    const coincideEstado = filtroEstado.value === 'todos' || (filtroEstado.value === 'disponibles' ? c.disponible : !c.disponible)
    return coincideTexto && coincideEstado
  })
})

// 4. Modal Crear / Editar
function abrirModal(carro = null) {
  adminStore.limpiarMensajes()
  formVehiculo.value = carro ? { ...carro } : {
    id: null, marca: '', modelo: '', categoria: 'Sedán', anio: new Date().getFullYear(), color: '', precio: 25000, currency: 'USD', disponible: true
  }
  modalVehiculo.value = true
}

async function guardarVehiculo() {
  if (!formVehiculo.value.marca.trim() || !formVehiculo.value.modelo.trim()) return alert('Ingresa marca y modelo.')
  const datos = { ...formVehiculo.value, anio: Number(formVehiculo.value.anio), precio: Number(formVehiculo.value.precio) }
  if (formVehiculo.value.id) await adminStore.modificarVehiculo(formVehiculo.value.id, datos)
  else await adminStore.agregarVehiculo(datos)
  modalVehiculo.value = false
}

// 5. Alternar disponibilidad y eliminación
const toggleEstado = (c) => adminStore.modificarEstadoVehiculo(c.id, !c.disponible)

function pedirEliminar(tipo, item) {
  const nombre = tipo === 'vehiculo' ? `${item.marca} ${item.modelo} (#${item.id})` : `Reserva #${item.id} de ${item.nombreCliente}`
  itemAEliminar.value = { tipo, id: item.id, nombre }
}

async function confirmarEliminar() {
  if (!itemAEliminar.value) return
  if (itemAEliminar.value.tipo === 'vehiculo') await adminStore.eliminarVehiculo(itemAEliminar.value.id)
  else await adminStore.eliminarReserva(itemAEliminar.value.id)
  itemAEliminar.value = null
}
</script>

<template>
  <div class="contenedor-admin">
    <!-- LOGIN -->
    <div v-if="!adminStore.estaAutenticado" class="caja-login">
      <div class="tarjeta tarjeta-login">
        <div style="font-size: 2.5rem;">🔐</div>
        <h1>Acceso Administrador</h1>
        <p class="subtitulo-login">Ingresa tus credenciales para administrar inventario y reservas.</p>
        <div v-if="errorLogin || adminStore.mensajeError" class="alerta error">
          ⚠️ {{ errorLogin || adminStore.mensajeError }}
        </div>
        <form class="form-login" @submit.prevent="iniciarSesion">
          <label>Correo Electrónico:<input v-model="email" type="email" required placeholder="ejemplo@correo.com" /></label>
          <label>Contraseña:<input v-model="password" type="password" required placeholder="••••••••" /></label>
          <button type="submit" class="btn-azul" :disabled="adminStore.cargando">
            {{ adminStore.cargando ? 'Verificando...' : '🚀 Ingresar al Panel' }}
          </button>
        </form>
        <NuxtLink to="/" class="link-volver">⬅ Volver al Catálogo</NuxtLink>
      </div>
    </div>

    <!-- PANEL PRINCIPAL -->
    <div v-else class="panel-admin">
      <header class="header-admin">
        <div>
          <span class="badge-rol">👑 Administrador</span>
          <h1>Panel de Control</h1>
          <p class="subtitulo">Gestión de catálogo y reservas conectadas a la API.</p>
        </div>
        <div class="acciones-header">
          <NuxtLink to="/" class="btn-blanco">🚗 Ver Catálogo</NuxtLink>
          <button class="btn-blanco" @click="adminStore.cargarTodo">🔄 Actualizar</button>
          <button class="btn-rojo" @click="adminStore.cerrarSesion">🚪 Salir</button>
        </div>
      </header>

      <div v-if="adminStore.mensajeExito" class="alerta exito">
        ✅ {{ adminStore.mensajeExito }}
        <button class="btn-cerrar" @click="adminStore.mensajeExito = ''">✕</button>
      </div>
      <div v-if="adminStore.mensajeError" class="alerta error">
        ⚠️ {{ adminStore.mensajeError }}
        <button class="btn-cerrar" @click="adminStore.mensajeError = ''">✕</button>
      </div>

      <!-- KPIs -->
      <section class="kpis">
        <div class="tarjeta"><span class="kpi-num">{{ adminStore.totalVehiculos }}</span><span>🚘 Total Autos</span></div>
        <div class="tarjeta"><span class="kpi-num">{{ adminStore.vehiculosDisponibles }}</span><span>✅ Disponibles</span></div>
        <div class="tarjeta"><span class="kpi-num">{{ adminStore.vehiculosAgotados }}</span><span>🛑 Agotados</span></div>
        <div class="tarjeta"><span class="kpi-num">{{ adminStore.totalReservas }}</span><span>📋 Reservas</span></div>
      </section>

      <!-- Pestañas -->
      <div class="tabs">
        <button class="tab-btn" :class="{ activo: tab === 'vehiculos' }" @click="tab = 'vehiculos'">
          🚗 Vehículos ({{ adminStore.totalVehiculos }})
        </button>
        <button class="tab-btn" :class="{ activo: tab === 'reservas' }" @click="tab = 'reservas'">
          📋 Reservas ({{ adminStore.totalReservas }})
        </button>
      </div>

      <!-- TAB 1: VEHÍCULOS -->
      <section v-if="tab === 'vehiculos'">
        <div class="barra-tabla">
          <div class="filtros">
            <input v-model="busqueda" placeholder="🔍 Buscar marca, modelo o ID..." />
            <select v-model="filtroEstado">
              <option value="todos">Todos los estados</option>
              <option value="disponibles">Disponibles</option>
              <option value="agotados">Agotados</option>
            </select>
          </div>
          <button class="btn-azul" @click="abrirModal()">➕ Agregar Vehículo</button>
        </div>

        <div class="caja-tabla">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Vehículo</th><th>Categoría</th><th>Año</th><th>Color</th><th>Precio</th><th>Estado</th><th>Alternar</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!vehiculosFiltrados.length"><td colspan="9" class="td-vacio">No hay vehículos para mostrar.</td></tr>
              <tr v-for="c in vehiculosFiltrados" :key="c.id">
                <td>#{{ c.id }}</td>
                <td><strong>{{ c.marca }}</strong> {{ c.modelo }}</td>
                <td>{{ c.categoria }}</td>
                <td>{{ c.anio }}</td>
                <td>{{ c.color }}</td>
                <td><strong>${{ Number(c.precio).toLocaleString() }}</strong></td>
                <td>
                  <span class="badge" :class="c.disponible ? 'disponible' : 'agotado'">
                    {{ c.disponible ? 'Disponible' : 'Agotado' }}
                  </span>
                </td>
                <td>
                  <button class="btn-sm" :class="c.disponible ? 'btn-rojo' : 'btn-sm-verde'" @click="toggleEstado(c)">
                    {{ c.disponible ? '🛑 Agotar' : '✅ Habilitar' }}
                  </button>
                </td>
                <td>
                  <button class="btn-icono" @click="abrirModal(c)">✏️</button>
                  <button class="btn-icono" @click="pedirEliminar('vehiculo', c)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 2: RESERVAS -->
      <section v-if="tab === 'reservas'">
        <div class="caja-tabla">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Vehículo</th><th>Cliente</th><th>Cédula</th><th>Contacto</th><th>Fecha</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!adminStore.listaReservas.length"><td colspan="8" class="td-vacio">No hay reservas registradas.</td></tr>
              <tr v-for="r in adminStore.listaReservas" :key="r.id">
                <td>#{{ r.id }}</td>
                <td><strong>{{ r.marca }} {{ r.modelo }}</strong> <small>(#{{ r.vehiculoId }})</small></td>
                <td><strong>{{ r.nombreCliente }}</strong></td>
                <td>{{ r.documento }}</td>
                <td>📞 {{ r.telefono }}<br><small>✉️ {{ r.correo }}</small></td>
                <td>📅 {{ r.fechaReserva }}</td>
                <td>
                  <select :value="r.estado || 'Pendiente'" class="select-estado" @change="adminStore.cambiarEstadoReserva(r.id, $event.target.value)">
                    <option value="Pendiente">🟡 Pendiente</option>
                    <option value="Confirmada">🟢 Confirmada</option>
                    <option value="Completada">🔵 Completada</option>
                    <option value="Cancelada">🔴 Cancelada</option>
                  </select>
                </td>
                <td><button class="btn-icono" @click="pedirEliminar('reserva', r)">🗑️</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- MODAL AGREGAR / EDITAR -->
    <div v-if="modalVehiculo" class="fondo-modal" @click.self="modalVehiculo = false">
      <div class="tarjeta modal">
        <h3>{{ formVehiculo.id ? '✏️ Editar Vehículo' : '➕ Agregar Vehículo' }}</h3>
        <form class="form-modal" @submit.prevent="guardarVehiculo">
          <div class="fila">
            <label>Marca *<input v-model="formVehiculo.marca" required placeholder="Toyota" /></label>
            <label>Modelo *<input v-model="formVehiculo.modelo" required placeholder="Corolla" /></label>
          </div>
          <div class="fila">
            <label>Categoría
              <select v-model="formVehiculo.categoria">
                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </label>
            <label>Año *<input v-model.number="formVehiculo.anio" type="number" required /></label>
          </div>
          <div class="fila">
            <label>Color<input v-model="formVehiculo.color" placeholder="Blanco" /></label>
            <label>Precio (USD) *<input v-model.number="formVehiculo.precio" type="number" min="0" required /></label>
          </div>
          <label style="flex-direction: row; align-items: center; gap: 8px; cursor: pointer;">
            <input v-model="formVehiculo.disponible" type="checkbox" /> ¿Disponible para reserva?
          </label>
          <div class="modal-acciones">
            <button type="button" class="btn-blanco" @click="modalVehiculo = false">Cancelar</button>
            <button type="submit" class="btn-azul" :disabled="adminStore.cargando">💾 Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL ELIMINAR -->
    <div v-if="itemAEliminar" class="fondo-modal" @click.self="itemAEliminar = null">
      <div class="tarjeta modal" style="max-width: 400px; text-align: center;">
        <div style="font-size: 2.5rem;">⚠️</div>
        <h3>¿Eliminar elemento?</h3>
        <p>¿Deseas eliminar permanentemente <strong>{{ itemAEliminar.nombre }}</strong>?</p>
        <div class="modal-acciones" style="justify-content: center;">
          <button class="btn-blanco" @click="itemAEliminar = null">Cancelar</button>
          <button class="btn-rojo" :disabled="adminStore.cargando" @click="confirmarEliminar">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor-admin { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }
.tarjeta { background: #ffffff; border-radius: 12px; padding: 20px; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.caja-login { min-height: 70vh; display: flex; justify-content: center; align-items: center; }
.tarjeta-login { max-width: 420px; width: 100%; text-align: center; }
.tarjeta-login h1 { margin: 6px 0; font-size: 1.5rem; }
.subtitulo-login { font-size: 0.9rem; color: #475569; margin-bottom: 18px; }
.form-login { display: flex; flex-direction: column; gap: 12px; text-align: left; }
.link-volver { display: inline-block; margin-top: 14px; color: #2563eb; font-weight: 700; text-decoration: none; }
.header-admin { background: #ffffff; border-radius: 12px; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; color: #0f172a; }
.header-admin h1 { margin: 4px 0 0; font-size: 1.5rem; }
.badge-rol { font-size: 0.75rem; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-weight: 700; }
.subtitulo { color: #475569; font-size: 0.88rem; margin: 4px 0 0; }
.acciones-header { display: flex; gap: 8px; flex-wrap: wrap; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px; }
.kpi-num { display: block; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.tabs { display: flex; gap: 10px; margin-bottom: 16px; border-bottom: 2px solid rgba(255,255,255,0.2); }
.tab-btn { background: none; border: none; color: #e2e8f0; padding: 10px 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; }
.tab-btn.activo { color: #ffffff; border-bottom-color: #38bdf8; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
.barra-tabla { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.filtros { display: flex; gap: 8px; flex-wrap: wrap; }
.caja-tabla { background: #ffffff; border-radius: 12px; overflow-x: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
table { width: 100%; border-collapse: collapse; font-size: 0.88rem; color: #0f172a; }
th { background: #f8fafc; padding: 10px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #334155; font-weight: 700; }
td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.td-vacio { text-align: center; padding: 24px; color: #64748b; font-style: italic; }
.badge { font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; }
.disponible { background: #dcfce7; color: #166534; }
.agotado { background: #fee2e2; color: #991b1b; }
.btn-azul { background: #2563eb; color: #ffffff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-blanco { background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; }
.btn-rojo { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-sm { font-size: 0.75rem; padding: 4px 8px; }
.btn-sm-verde { background: #dcfce7; color: #166534; border: 1px solid #86efac; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-icono { background: none; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 6px; cursor: pointer; margin-right: 4px; }
.fondo-modal { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
.modal { max-width: 480px; width: 100%; }
.modal h3 { margin: 0 0 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
.form-modal { display: flex; flex-direction: column; gap: 10px; }
.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; font-weight: 700; color: #0f172a; }
input, select { padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; color: #0f172a; background: #ffffff; }
.modal-acciones { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
.alerta { padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; }
.exito { background: #dcfce7; color: #14532d; border: 1px solid #86efac; }
.error { background: #fee2e2; color: #7f1d1d; border: 1px solid #fca5a5; }
.btn-cerrar { background: none; border: none; font-weight: bold; cursor: pointer; color: inherit; }
</style>
