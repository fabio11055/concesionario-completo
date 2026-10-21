<script setup>
import { ref, watch, onMounted } from 'vue'
import { useVehiculosStore } from '~/stores/vehiculos'
import BuscadorFiltro from '~/components/BuscadorFiltro.vue'
import TarjetaVehiculo from '~/components/TarjetaVehiculo.vue'
import BotonReserva from '~/components/BotonReserva.vue'

// Store de Pinia: se encarga de comunicarse con el servidor y pasarle los datos a la página
const store = useVehiculosStore()

// Filtro de búsqueda por marca reactivo
const filtroTexto = ref('')

// Mensaje cuando el usuario pulsa reservar
const mensajeReserva = ref('')

// Carga inicial: El store le pide al servidor los 6 primeros carros
onMounted(async () => {
  if (store.listaVehiculos.length === 0) {
    await store.cargarInicial()
  }
})

// Filtro por marca: El store le pide al servidor todos los carros de esa marca
let temporizadorFiltro = null
watch(filtroTexto, (nuevoValor) => {
  if (temporizadorFiltro) clearTimeout(temporizadorFiltro)

  temporizadorFiltro = setTimeout(() => {
    store.buscarPorMarca(nuevoValor)
  }, 300)
})

/**
 * Acción al presionar el botón de reserva: muestra el mensaje "Reserva en proceso"
 * sin realizar ninguna modificación ni petición a ninguna base de datos.
 */
function manejarReserva() {
  mensajeReserva.value = 'Reserva en proceso'
}
</script>

<template>
  <div class="pagina-concesionario">
    <!-- Encabezado con información del inventario de la base de datos -->
    <header class="encabezado-seccion">
      <div class="titulo-con-badge">
        <h1>🚗 Catálogo de Vehículos</h1>
        <span v-if="!store.modoFiltroActivo" class="badge-total">
          {{ store.listaVehiculos.length }} de {{ store.totalEnServidor }} carros
        </span>
      </div>
      <p class="subtitulo">
        Catálogo conectado al Store de Pinia y alimentado por el servidor Nuxt.
      </p>
    </header>

    <!-- Componente Buscador por marca -->
    <BuscadorFiltro v-model="filtroTexto" />

    <!-- Mensaje: "Reserva en proceso" -->
    <transition name="fade">
      <div v-if="mensajeReserva" class="alerta-reserva">
        <div class="alerta-reserva-contenido">
          <span>🔔 <strong>{{ mensajeReserva }}</strong></span>
        </div>
        <button
          type="button"
          class="btn-cerrar-alerta"
          title="Cerrar notificación"
          @click="mensajeReserva = ''"
        >
          ✕
        </button>
      </div>
    </transition>

    <!-- Estado: Cargando datos desde el servidor -->
    <div v-if="store.cargandoInicial" class="estado-cargando">
      <div class="spinner" />
      <p>Cargando vehículos desde el servidor...</p>
    </div>

    <!-- Catálogo de Vehículos -->
    <div v-else-if="store.listaVehiculos.length > 0" class="seccion-catalogo">
      <div class="grilla-catalogo">
        <div
          v-for="carro in store.listaVehiculos"
          :key="carro.id"
          class="bloque-tarjeta"
        >
          <!-- Componente Hijo 1: Recibe los datos por Props -->
          <TarjetaVehiculo :vehiculo="carro" />

          <!-- Componente Hijo 2: Botón con Props y Emits (Muestra "Reserva en proceso") -->
          <BotonReserva
            :vehiculo-id="carro.id"
            :disponible="carro.disponible"
            @solicitar="manejarReserva"
          />
        </div>
      </div>

      <!-- Paginación: Botón "Mostrar más" (+5 carros) -->
      <div v-if="!store.modoFiltroActivo" class="zona-paginacion">
        <!-- Mientras queden más carros en la base de datos -->
        <button
          v-if="!store.sinMasAutos"
          type="button"
          class="btn-mostrar-mas"
          :disabled="store.cargandoMas"
          @click="store.cargarMas"
        >
          <span v-if="store.cargandoMas" class="loader-btn">
            ⏳ Cargando más carros...
          </span>
          <span v-else>
            ➕ Mostrar más carros (+5)
          </span>
        </button>

        <!-- Cuando se hayan cargado todos los carros de la BD -->
        <div v-else class="mensaje-fin-catalogo">
          <p class="texto-fin">
            🏁 <strong>Estos son todos los carros disponibles</strong>
          </p>
          <p class="subtexto-fin">
            Has cargado los {{ store.totalEnServidor }} vehículos disponibles en la base de datos.
          </p>
        </div>
      </div>

      <!-- Filtro por marca activo -->
      <div v-else class="zona-modo-filtro">
        <p>
          Se encontraron <strong>{{ store.listaVehiculos.length }}</strong> vehículo(s) para la marca "<strong>{{ filtroTexto }}</strong>" en la base de datos.
        </p>
        <button
          type="button"
          class="btn-restablecer"
          @click="filtroTexto = ''"
        >
          Restablecer y ver los 6 iniciales
        </button>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else class="sin-resultados">
      <p class="texto-vacio">
        ⚠️ No se encontraron carros de la marca "<strong>{{ filtroTexto }}</strong>" en el servidor.
      </p>
      <button
        type="button"
        class="btn-limpiar"
        @click="filtroTexto = ''"
      >
        Limpiar búsqueda y ver los 6 iniciales
      </button>
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
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #bae6fd;
}

.subtitulo {
  color: #64748b;
  margin: 6px 0 0 0;
  font-size: 1rem;
}

.alerta-reserva {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  margin-bottom: 24px;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08);
}

.alerta-reserva-contenido {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cerrar-alerta {
  background: none;
  border: none;
  color: #1d4ed8;
  cursor: pointer;
  font-size: 1.15rem;
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
  width: 38px;
  height: 38px;
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
  padding: 20px 0;
}

.btn-mostrar-mas {
  padding: 14px 34px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.btn-mostrar-mas:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.4);
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
  padding: 8px 18px;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
