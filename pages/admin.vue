<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '~/stores/admin'

const adminStore = useAdminStore()

const tab = ref('vehiculos')
const email = ref(''), password = ref(''), errorLogin = ref('')
const modalVehiculo = ref(false)
const itemAEliminar = ref(null)

const formVehiculo = ref({
  id: null, marca: '', modelo: '', categoria: 'Sedán', anio: 2024, color: '', precio: 25000, disponible: true
})

onMounted(async () => {
  adminStore.verificarSesion()
  if (adminStore.estaAutenticado) await adminStore.cargarTodo()
})

function login() {
  errorLogin.value = ''
  if (adminStore.iniciarSesion(email.value, password.value)) {
    adminStore.cargarTodo()
  } else {
    errorLogin.value = 'Credenciales inválidas (usa admin@concesionario.com / admin123)'
  }
}

function abrirModal(carro = null) {
  formVehiculo.value = carro
    ? { ...carro }
    : { id: null, marca: '', modelo: '', categoria: 'Sedán', anio: 2024, color: '', precio: 25000, disponible: true }
  modalVehiculo.value = true
}

async function guardarVehiculo() {
  if (formVehiculo.value.id) {
    await adminStore.modificarVehiculo(formVehiculo.value.id, formVehiculo.value)
  } else {
    await adminStore.agregarVehiculo(formVehiculo.value)
  }
  modalVehiculo.value = false
}

const toggleEstado = (c) => adminStore.modificarEstadoVehiculo(c.id, !c.disponible)

function pedirEliminar(tipo, item) {
  itemAEliminar.value = {
    tipo,
    id: item.id,
    nombre: item.marca ? `${item.marca} ${item.modelo}` : `Reserva #${item.id}`
  }
}

async function confirmarEliminar() {
  if (itemAEliminar.value.tipo === 'vehiculo') {
    await adminStore.eliminarVehiculo(itemAEliminar.value.id)
  } else {
    await adminStore.eliminarReserva(itemAEliminar.value.id)
  }
  itemAEliminar.value = null
}
</script>

<template>
  <div class="contenedor">
    <!-- PANTALLA LOGIN -->
    <div v-if="!adminStore.estaAutenticado" class="caja-login">
      <div class="tarjeta form-login">
        <h2>🔐 Acceso Administrador</h2>
        <p v-if="errorLogin" class="alerta error">⚠️ {{ errorLogin }}</p>
        <form @submit.prevent="login">
          <label>Correo<input v-model="email" type="email" required placeholder="admin@concesionario.com" /></label>
          <label>Contraseña<input v-model="password" type="password" required placeholder="admin123" /></label>
          <button type="submit" class="btn-azul">Ingresar</button>
        </form>
        <NuxtLink to="/" class="link">⬅ Volver al Catálogo</NuxtLink>
      </div>
    </div>

    <!-- PANEL ADMIN -->
    <div v-else>
      <header class="header">
        <div>
          <h1>Panel de Control</h1>
          <p>Administración del inventario y reservas de vehículos.</p>
        </div>
        <div class="acciones">
          <NuxtLink to="/" class="btn-blanco">🚗 Catálogo</NuxtLink>
          <button class="btn-blanco" @click="adminStore.cargarTodo">🔄 Actualizar</button>
          <button class="btn-rojo" @click="adminStore.cerrarSesion">Salir</button>
        </div>
      </header>

      <!-- Alertas -->
      <p v-if="adminStore.mensajeExito" class="alerta exito">✅ {{ adminStore.mensajeExito }}</p>
      <p v-if="adminStore.mensajeError" class="alerta error">⚠️ {{ adminStore.mensajeError }}</p>

      <!-- KPIs -->
      <section class="kpis">
        <div class="tarjeta"><strong class="num">{{ adminStore.totalVehiculos }}</strong>Total Autos</div>
        <div class="tarjeta"><strong class="num">{{ adminStore.vehiculosDisponibles }}</strong>Disponibles</div>
        <div class="tarjeta"><strong class="num">{{ adminStore.vehiculosAgotados }}</strong>Agotados</div>
        <div class="tarjeta"><strong class="num">{{ adminStore.totalReservas }}</strong>Reservas</div>
      </section>

      <!-- Pestañas -->
      <div class="tabs">
        <button :class="{ activo: tab === 'vehiculos' }" @click="tab = 'vehiculos'">
          🚗 Vehículos ({{ adminStore.totalVehiculos }})
        </button>
        <button :class="{ activo: tab === 'reservas' }" @click="tab = 'reservas'">
          📋 Reservas ({{ adminStore.totalReservas }})
        </button>
      </div>

      <!-- COMPONENTE 1: TABLA VEHÍCULOS -->
      <AdminTablaVehiculos
        v-if="tab === 'vehiculos'"
        :vehiculos="adminStore.inventarioVehiculos"
        @agregar="abrirModal()"
        @editar="abrirModal"
        @eliminar="(c) => pedirEliminar('vehiculo', c)"
        @toggle-estado="toggleEstado"
      />

      <!-- COMPONENTE 2: TABLA RESERVAS -->
      <AdminTablaReservas
        v-if="tab === 'reservas'"
        :reservas="adminStore.listaReservas"
        @cambiar-estado="({ id, nuevoEstado }) => adminStore.cambiarEstadoReserva(id, nuevoEstado)"
        @eliminar="(r) => pedirEliminar('reserva', r)"
      />
    </div>

    <!-- MODAL VEHÍCULO -->
    <div v-if="modalVehiculo" class="fondo" @click.self="modalVehiculo = false">
      <div class="tarjeta modal">
        <h3>{{ formVehiculo.id ? '✏️ Editar Auto' : '➕ Nuevo Auto' }}</h3>
        <form @submit.prevent="guardarVehiculo">
          <div class="fila">
            <label>Marca<input v-model="formVehiculo.marca" required placeholder="Toyota" /></label>
            <label>Modelo<input v-model="formVehiculo.modelo" required placeholder="Corolla" /></label>
          </div>
          <div class="fila">
            <label>Año<input v-model.number="formVehiculo.anio" type="number" required /></label>
            <label>Precio<input v-model.number="formVehiculo.precio" type="number" required /></label>
          </div>
          <label style="flex-direction:row; align-items:center; gap:8px;">
            <input v-model="formVehiculo.disponible" type="checkbox" /> Disponible
          </label>
          <div class="modal-btns">
            <button type="button" class="btn-blanco" @click="modalVehiculo = false">Cancelar</button>
            <button type="submit" class="btn-azul">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL ELIMINAR -->
    <div v-if="itemAEliminar" class="fondo" @click.self="itemAEliminar = null">
      <div class="tarjeta modal" style="text-align: center; max-width: 380px;">
        <h3>⚠️ ¿Eliminar?</h3>
        <p>¿Deseas eliminar <strong>{{ itemAEliminar.nombre }}</strong>?</p>
        <div class="modal-btns" style="justify-content:center;">
          <button class="btn-blanco" @click="itemAEliminar = null">Cancelar</button>
          <button class="btn-rojo" @click="confirmarEliminar">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor { max-width: 1100px; margin: 0 auto; padding: 20px; }
.tarjeta { background: #fff; border-radius: 10px; padding: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
.caja-login { min-height: 60vh; display: flex; justify-content: center; align-items: center; }
.form-login { width: 340px; text-align: center; }
form { display: flex; flex-direction: column; gap: 10px; text-align: left; }
label { display: flex; flex-direction: column; font-size: 0.85rem; font-weight: 700; gap: 4px; }
input { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.link { display: inline-block; margin-top: 12px; color: #2563eb; font-weight: 700; text-decoration: none; }
.header { background: #fff; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.header h1 { margin: 0; font-size: 1.5rem; }
.header p { margin: 4px 0 0; color: #64748b; font-size: 0.88rem; }
.acciones { display: flex; gap: 8px; }
.btn-azul { background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-blanco { background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-weight: 600; cursor: pointer; }
.btn-rojo { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
.num { display: block; font-size: 1.6rem; color: #0f172a; }
.tabs { display: flex; gap: 10px; margin-bottom: 14px; }
.tabs button { background: none; border: none; color: #cbd5e1; padding: 8px 12px; font-weight: 700; cursor: pointer; border-bottom: 2px solid transparent; }
.tabs button.activo { color: #fff; border-bottom-color: #38bdf8; }
.fondo { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal { width: 100%; max-width: 440px; }
.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.modal-btns { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.alerta { padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; font-weight: 600; font-size: 0.88rem; }
.exito { background: #dcfce7; color: #14532d; }
.error { background: #fee2e2; color: #7f1d1d; }
</style>
