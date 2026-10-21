<template>
  <div class="layout-wrapper">
    <!-- Barra superior de navegación -->
    <header class="barra-navegacion">
      <div class="nav-contenido">
        <NuxtLink to="/" class="logo-texto">
          🚗 Concesionario de Vehículos
        </NuxtLink>
        <span class="subtitulo-nav">Técnicas Avanzadas de Programación</span>
      </div>
    </header>

    <!-- Contenido principal de la página -->
    <main class="contenido-principal">
      <slot />
    </main>

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
  /* Fondo sobrio y limpio: gris suave con cuadrícula tenue tradicional */
  background-color: #f8fafc;
  background-image: 
    linear-gradient(to right, #e2e8f0 1px, transparent 1px),
    linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
  background-size: 32px 32px;
}

.barra-navegacion {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.nav-contenido {
  max-width: 1100px;
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

.subtitulo-nav {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 500;
}

.contenido-principal {
  flex: 1;
}

.pie-pagina {
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 18px 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

.pie-pagina p {
  margin: 0;
}
</style>
