import { useAdminStore } from '~/stores/admin'

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const adminStore = useAdminStore()
    adminStore.verificarSesion()
  }
})
