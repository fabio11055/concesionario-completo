import { useStoreAuth } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useStoreAuth()

  if (!authStore.esAdmin) {
    // Redirige al inicio si no es administrador
    return navigateTo({
      path: '/',
      query: { alerta: 'acceso-denegado' },
    })
  }
})
