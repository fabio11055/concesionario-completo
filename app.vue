<template>
  <NuxtLayout>
    <v-app class="app-base">
      <NuxtPage />
    </v-app>
  </NuxtLayout>
</template>

<style>
/* Estilos globales y reset simple */
html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
}

/* Permitir que el fondo del layout se muestre correctamente */
.app-base.v-application {
  background: transparent !important;
}

.app-base.v-application .v-application__wrap {
  min-height: 100vh;
  background: transparent !important;
}
</style>
