<script setup>
import { ref, watch, onMounted } from 'vue'
import { useVehiculosStore } from '~/stores/vehiculos'

// 1. Conexión con el store de Pinia y variable del buscador
const store = useVehiculosStore()
const filtroTexto = ref('')

// 2. Al cargar la página, solicita los primeros vehículos si la lista está vacía
onMounted(() => {
  if (store.listaVehiculos.length === 0) store.cargarInicial()
})

// 3. Cuando el usuario escribe en el buscador, filtra automáticamente
watch(filtroTexto, (texto) => store.buscarPorMarca(texto))

// 4. Redirige a la página de reservas enviando el ID del vehículo por la URL
function irAReservar(id) {
  navigateTo({ path: '/reservas', query: { vehiculoId: String(id) } })
}
</script>

<template>
  <div class="contenedor">
    <!-- Encabezado con título, contador y acceso al panel de administración -->
    <header class="cabecera">
      <div>
        <div class="titulo-fila">
          <h1>🚗 Catálogo de Vehículos</h1>
          <span v-if="!store.modoFiltroActivo" class="badge">
            {{ store.listaVehiculos.length }} de {{ store.totalEnServidor }} carros
          </span>
        </div>
        <p class="subtitulo">Selecciona un vehículo disponible para solicitar tu reserva.</p>
      </div>
      <button class="btn-admin" @click="navigateTo('/admin')">🔐 Administrador</button>
    </header>

    <!-- Buscador reactivo por marca o modelo -->
    <BuscadorFiltro v-model="filtroTexto" />

    <!-- Mensaje mientras cargan los datos del servidor -->
    <p v-if="store.cargandoInicial" class="mensaje-carga">⏳ Cargando vehículos del servidor...</p>

    <!-- Grilla de vehículos -->
    <div v-else-if="store.listaVehiculos.length > 0">
      <div class="grilla">
        <div v-for="carro in store.listaVehiculos" :key="carro.id" class="item-carro">
          <TarjetaVehiculo :vehiculo="carro" />
          <BotonReserva
            :vehiculo-id="carro.id"
            :disponible="carro.disponible"
            @solicitar="irAReservar"
          />
        </div>
      </div>

      <!-- Zona de paginación para cargar más carros -->
      <div class="zona-paginacion">
        <button
          v-if="!store.modoFiltroActivo && !store.sinMasAutos"
          class="btn-mas"
          @click="store.cargarMas"
        >
          ➕ Mostrar más carros (+5)
        </button>
        <p v-else-if="!store.modoFiltroActivo" class="caja-mensaje">
          🏁 Has cargado los {{ store.totalEnServidor }} vehículos disponibles en el sistema.
        </p>
      </div>
    </div>

    <!-- Mensaje si no se encuentran resultados con el filtro -->
    <div v-else class="caja-mensaje">
      <p>⚠️ No se encontraron vehículos para "<strong>{{ filtroTexto }}</strong>".</p>
      <button class="btn-limpiar" @click="filtroTexto = ''">Ver todos los vehículos</button>
    </div>
  </div>
</template>

<style scoped>
.contenedor {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
}

.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.titulo-fila {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

h1 {
  color: #ffffff;
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.badge {
  background: #0284c7;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.subtitulo {
  color: #f1f5f9;
  margin: 6px 0 0;
  font-size: 1rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.btn-admin {
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s;
}

.btn-admin:hover {
  background: #1d4ed8;
}

.mensaje-carga {
  text-align: center;
  color: #ffffff;
  font-size: 1.1rem;
  padding: 40px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.grilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-carro {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}

.zona-paginacion {
  text-align: center;
  margin-top: 30px;
}

.btn-mas {
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  transition: background-color 0.2s;
}

.btn-mas:hover {
  background: #1d4ed8;
}

.caja-mensaje {
  background: #ffffff;
  color: #0f172a;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.caja-mensaje p {
  margin: 0;
  font-weight: 600;
}

.btn-limpiar {
  margin-top: 10px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-limpiar:hover {
  background: #1d4ed8;
}
</style>
