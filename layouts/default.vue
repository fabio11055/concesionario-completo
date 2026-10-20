<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreAuth } from '~/stores/auth'

const authStore = useStoreAuth()
const route = useRoute()
const router = useRouter()

const mostrarModalLogin = ref(false)
const claveAdmin = ref('')
const errorLogin = ref('')
const mensajeAlerta = ref('')

// Detectar si fue redirigido por intentar acceder a una ruta de admin sin permisos
watch(
  () => route.query.alerta,
  (nuevaAlerta) => {
    if (nuevaAlerta === 'acceso-denegado') {
      mensajeAlerta.value = '⚠️ Acceso restringido: Solo el administrador autorizado puede acceder a esa sección.'
    }
  },
  { immediate: true }
)

onMounted(() => {
  authStore.restaurarSesion()
})

function abrirLoginAdmin() {
  claveAdmin.value = ''
  errorLogin.value = ''
  mostrarModalLogin.value = true
}

function procesarLoginAdmin() {
  errorLogin.value = ''
  const exito = authStore.iniciarSesionAdmin(claveAdmin.value)
  if (exito) {
    mostrarModalLogin.value = false
    claveAdmin.value = ''
    router.push('/Admin')
  } else {
    errorLogin.value = authStore.error || 'Contraseña incorrecta.'
  }
}

function cerrarSesionAdmin() {
  authStore.cerrarSesion()
  router.push('/')
}
</script>

<template>
  <div class="layout-wrapper">
    <!-- Barra de navegación -->
    <header class="barra-navegacion">
      <div class="nav-contenido">
        <NuxtLink to="/" class="logo-texto">
          🚘 Concesionario
        </NuxtLink>

        <!-- Navegación principal -->
        <nav class="menu-navegacion">
          <NuxtLink to="/" class="enlace">
            Vehículos
          </NuxtLink>

          <!-- El enlace de Administración SOLO aparece si el usuario es Administrador -->
          <NuxtLink v-if="authStore.esAdmin" to="/Admin" class="enlace enlace-admin">
            👑 Administración
          </NuxtLink>

          <!-- Botón de Cerrar Sesión si es Admin -->
          <button
            v-if="authStore.esAdmin"
            type="button"
            class="btn-logout"
            title="Cerrar sesión de administrador"
            @click="cerrarSesionAdmin"
          >
            Cerrar Sesión
          </button>

          <!-- Botón para Iniciar Sesión como Admin si es Usuario normal -->
          <button
            v-else
            type="button"
            class="btn-login-admin"
            title="Acceso exclusivo para administradores"
            @click="abrirLoginAdmin"
          >
            🔒 Acceso Admin
          </button>
        </nav>
      </div>
    </header>

    <!-- Alerta global de acceso restringido -->
    <div v-if="mensajeAlerta" class="alerta-global">
      <div class="alerta-contenido">
        <span>{{ mensajeAlerta }}</span>
        <button type="button" class="btn-cerrar-alerta" @click="mensajeAlerta = ''">✕</button>
      </div>
    </div>

    <!-- Modal de autenticación del Admin -->
    <div
      v-if="mostrarModalLogin"
      class="modal-fondo"
      @click.self="mostrarModalLogin = false"
    >
      <div class="modal-tarjeta">
        <div class="modal-header">
          <h3>🔐 Acceso de Administrador</h3>
          <button type="button" class="btn-cerrar-modal" @click="mostrarModalLogin = false">✕</button>
        </div>
        <p class="modal-desc">
          Ingresa la contraseña de administrador para gestionar vehículos y ver solicitudes.
        </p>

        <form @submit.prevent="procesarLoginAdmin">
          <div class="campo-grupo">
            <label for="clave-admin">Contraseña de Administrador:</label>
            <input
              id="clave-admin"
              v-model="claveAdmin"
              type="password"
              required
              placeholder="Ingresa la contraseña..."
              autofocus
            />
          </div>

          <p v-if="errorLogin" class="error-login">{{ errorLogin }}</p>

          <div class="modal-acciones">
            <button type="button" class="btn-secundario" @click="mostrarModalLogin = false">
              Cancelar
            </button>
            <button type="submit" class="btn-primario">
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contenido dinámico de la página -->
    <main class="contenido-principal">
      <slot />
    </main>

    <!-- Pie de página compartido -->
    <footer class="pie-pagina">
      <p>© {{ new Date().getFullYear() }} Concesionario de Vehículos · Sistema de Gestión TAP</p>
    </footer>
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.barra-navegacion {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-contenido {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.logo-texto {
  font-weight: 800;
  font-size: 1.25rem;
  color: #0f172a;
  text-decoration: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-navegacion {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enlace {
  padding: 8px 14px;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.enlace:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.enlace.router-link-active {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.enlace-admin {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.enlace-admin:hover {
  background-color: #fde68a;
  color: #78350f;
}

.btn-login-admin {
  padding: 8px 14px;
  border-radius: 8px;
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-login-admin:hover {
  background-color: #e2e8f0;
  color: #0f172a;
  border-color: #94a3b8;
}

.btn-logout {
  padding: 8px 14px;
  border-radius: 8px;
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background-color: #fecaca;
  color: #7f1d1d;
}

.alerta-global {
  background-color: #fff7ed;
  border-bottom: 1px solid #fed7aa;
  padding: 12px 24px;
}

.alerta-contenido {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #9a3412;
  font-weight: 600;
  font-size: 0.95rem;
}

.btn-cerrar-alerta {
  background: none;
  border: none;
  color: #9a3412;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0 4px;
}

.modal-fondo {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(2px);
}

.modal-tarjeta {
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.btn-cerrar-modal {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
}

.modal-desc {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0 0 16px 0;
}

.campo-grupo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.campo-grupo label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.campo-grupo input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
}

.campo-grupo input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.error-login {
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primario {
  padding: 9px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primario:hover {
  background-color: #1d4ed8;
}

.btn-secundario {
  padding: 9px 16px;
  background-color: #e2e8f0;
  color: #334155;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secundario:hover {
  background-color: #cbd5e1;
}

.contenido-principal {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.pie-pagina {
  padding: 20px 24px;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  background-color: #ffffff;
  color: #64748b;
  font-size: 0.88rem;
}

.pie-pagina p {
  margin: 0;
}

@media (max-width: 600px) {
  .barra-navegacion {
    padding: 12px 16px;
  }

  .nav-contenido {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .menu-navegacion {
    justify-content: space-between;
  }
}
</style>
