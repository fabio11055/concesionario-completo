<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '~/stores/admin'

const adminStore = useAdminStore()

const modalLoginVisible = ref(false)
const emailAdmin = ref('')
const passwordAdmin = ref('')
const errorLogin = ref('')
const cargando = ref(false)

onMounted(() => {
  adminStore.verificarSesion()
})

function clickAdminHeader() {
  if (adminStore.estaAutenticado) {
    navigateTo('/admin')
  } else {
    errorLogin.value = ''
    adminStore.limpiarMensajes()
    modalLoginVisible.value = true
  }
}

function procesarAccesoAdmin() {
  errorLogin.value = ''
  cargando.value = true

  const exito = adminStore.iniciarSesion(emailAdmin.value, passwordAdmin.value)
  cargando.value = false

  if (exito) {
    modalLoginVisible.value = false
    emailAdmin.value = ''
    passwordAdmin.value = ''
    navigateTo('/admin')
  } else {
    errorLogin.value = adminStore.mensajeError || 'Correo o contraseña incorrectos.'
  }
}
</script>

<template>
  <div class="layout-wrapper">
    <!-- Barra superior de navegación -->
    <header class="barra-navegacion">
      <div class="nav-contenido">
        <NuxtLink to="/" class="logo-texto">
          🚗 Concesionario de Vehículos
        </NuxtLink>

        <div class="nav-centro">
          <span class="subtitulo-nav">Técnicas Avanzadas de Programación</span>
        </div>

        <!-- Acciones en el Header principal -->
        <div class="nav-acciones">
          <NuxtLink to="/" class="enlace-catalogo">
            Catálogo
          </NuxtLink>

          <!-- Botón de Administrador en el Header -->
          <button
            type="button"
            class="btn-admin-header"
            :class="{ 'admin-logeado': adminStore.estaAutenticado }"
            title="Ingreso exclusivo para administradores"
            @click="clickAdminHeader"
          >
            <span class="icono-candado">🔐</span>
            <span>Administrador</span>
            <span
              v-if="adminStore.estaAutenticado"
              class="indicador-activo"
              title="Sesión activa"
            />
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido principal de la página -->
    <main class="contenido-principal">
      <slot />
    </main>

    <!-- Modal emergente para Login de Administrador desde el Header -->
    <transition name="fade">
      <div
        v-if="modalLoginVisible"
        class="fondo-modal-auth"
        @click.self="modalLoginVisible = false"
      >
        <div class="caja-modal-auth">
          <div class="modal-auth-icono">🔐</div>
          <h3>Acceso Administrador</h3>
          <p class="modal-auth-subtitulo">
            Solo el administrador puede entrar ingresando su correo y contraseña.
          </p>

          <div v-if="errorLogin" class="alerta-auth-error">
            ⚠️ {{ errorLogin }}
          </div>

          <form class="formulario-auth" @submit.prevent="procesarAccesoAdmin">
            <div class="campo-auth">
              <label>Correo Electrónico:</label>
              <input
                v-model="emailAdmin"
                type="email"
                required
                placeholder="ejemplo@correo.com"
                autocomplete="email"
              />
            </div>

            <div class="campo-auth">
              <label>Contraseña:</label>
              <input
                v-model="passwordAdmin"
                type="password"
                required
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>

            <button
              type="submit"
              class="btn-enviar-auth"
              :disabled="cargando"
            >
              <span v-if="cargando">Verificando...</span>
              <span v-else>🚀 Ingresar al Panel</span>
            </button>
          </form>

          <button
            type="button"
            class="btn-cerrar-auth"
            @click="modalLoginVisible = false"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </transition>

    <!-- Pie de página -->
    <footer class="pie-pagina">
      <p>© {{ new Date().getFullYear() }} Concesionario TAP · Catálogo con Store y Servidor</p>
    </footer>
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* Fondo personalizado con imagen en public/fondo.jpg y filtro de alto contraste */
  background-image: 
    linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.84)),
    url('/fondo.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.barra-navegacion {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  padding: 12px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.nav-contenido {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.logo-texto {
  font-weight: 700;
  font-size: 1.18rem;
  color: #0f172a;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-centro {
  display: flex;
  align-items: center;
}

.subtitulo-nav {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 500;
}

.nav-acciones {
  display: flex;
  align-items: center;
  gap: 14px;
}

.enlace-catalogo {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.enlace-catalogo:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

/* Botón de Administrador en el Header */
.btn-admin-header {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #0f172a;
  color: #ffffff;
  border: 1px solid #0f172a;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-admin-header:hover {
  background-color: #1e293b;
  border-color: #1e293b;
  transform: translateY(-1px);
}

.btn-admin-header.admin-logeado {
  background-color: #1e3a8a;
  border-color: #1d4ed8;
}

.icono-candado {
  font-size: 0.95rem;
}

.indicador-activo {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  display: inline-block;
  margin-left: 2px;
  box-shadow: 0 0 6px #22c55e;
}

.contenido-principal {
  flex: 1;
}

.pie-pagina {
  background-color: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 18px 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

.pie-pagina p {
  margin: 0;
}

/* Modal de Autenticación rápida desde el Header */
.fondo-modal-auth {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.caja-modal-auth {
  background-color: #ffffff;
  border-radius: 14px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-auth-icono {
  font-size: 2.4rem;
  margin-bottom: 8px;
}

.caja-modal-auth h3 {
  margin: 0 0 6px 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
}

.modal-auth-subtitulo {
  font-size: 0.86rem;
  color: #64748b;
  margin: 0 0 16px 0;
}

.alerta-auth-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  margin-bottom: 14px;
  text-align: left;
}

.formulario-auth {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.campo-auth label {
  display: block;
  font-size: 0.84rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.campo-auth input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  font-size: 0.9rem;
  outline: none;
}

.campo-auth input:focus {
  border-color: #2563eb;
}

.btn-enviar-auth {
  margin-top: 6px;
  padding: 10px;
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 7px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-enviar-auth:hover:not(:disabled) {
  background-color: #1e293b;
}

.btn-cerrar-auth {
  margin-top: 14px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.84rem;
  cursor: pointer;
}

.btn-cerrar-auth:hover {
  text-decoration: underline;
  color: #0f172a;
}

/* Transición fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .nav-centro {
    display: none;
  }
}
</style>
