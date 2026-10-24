import { defineStore } from 'pinia'
import { useVehiculosStore } from './vehiculos'

export interface VehiculoAdmin {
  id: string | number
  marca: string
  modelo: string
  categoria: string
  anio: number
  color: string
  precio: number
  currency: string
  disponible: boolean
}

export interface ReservaAdmin {
  id?: string | number
  vehiculoId: string | number
  marca: string
  modelo: string
  precio: number
  nombreCliente: string
  documento: string
  telefono: string
  correo: string
  fechaReserva: string
  observaciones?: string
  estado?: string
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    estaAutenticado: false,
    usuarioAdmin: null as { email: string; nombre: string } | null,
    inventarioVehiculos: [] as VehiculoAdmin[],
    listaReservas: [] as ReservaAdmin[],
    cargando: false,
    mensajeExito: '',
    mensajeError: '',
  }),

  getters: {
    totalVehiculos: (state) => state.inventarioVehiculos.length,
    vehiculosDisponibles: (state) => state.inventarioVehiculos.filter((v) => v.disponible).length,
    vehiculosAgotados: (state) => state.inventarioVehiculos.filter((v) => !v.disponible).length,
    totalReservas: (state) => state.listaReservas.length,
  },

  actions: {
    // ---------------------------------------------
    // 1. AUTENTICACIÓN Y SESIÓN
    // ---------------------------------------------
    verificarSesion() {
      if (typeof window !== 'undefined' && localStorage.getItem('admin_auth_sesion')) {
        this.estaAutenticado = true
        this.usuarioAdmin = { email: 'admin@concesionario.com', nombre: 'Administrador' }
      }
    },

    iniciarSesion(correo: string, contrasenia: string): boolean {
      this.limpiarMensajes()
      const email = (correo || '').trim().toLowerCase()
      const pass = (contrasenia || '').trim()

      // Valida credenciales de admin (ej: admin@concesionario.com / admin123)
      if (email.startsWith('admin') && (pass === 'admin123' || pass === 'admin')) {
        this.estaAutenticado = true
        this.usuarioAdmin = { email, nombre: 'Administrador' }
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_auth_sesion', JSON.stringify(this.usuarioAdmin))
        }
        this.mensajeExito = '¡Sesión iniciada correctamente!'
        return true
      }

      this.mensajeError = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
      return false
    },

    cerrarSesion() {
      this.estaAutenticado = false
      this.usuarioAdmin = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_auth_sesion')
      }
    },

    // ---------------------------------------------
    // 2. GESTIÓN DE VEHÍCULOS (API /api/products)
    // ---------------------------------------------
    async cargarProductos() {
      this.cargando = true
      try {
        const data = await $fetch<VehiculoAdmin[]>('/api/products')
        this.inventarioVehiculos = Array.isArray(data) ? data : []
      } catch (error) {
        this.mensajeError = 'Error al cargar productos del servidor.'
      } finally {
        this.cargando = false
      }
    },

    async agregarVehiculo(nuevoCarro: Omit<VehiculoAdmin, 'id'>) {
      this.cargando = true
      this.limpiarMensajes()
      try {
        const guardado = await $fetch<VehiculoAdmin>('/api/products', {
          method: 'POST',
          body: nuevoCarro,
        })
        this.inventarioVehiculos.push(guardado)

        // Sincroniza con el catálogo principal
        const storeV = useVehiculosStore()
        storeV.todosLosCarros.push(guardado)
        if (!storeV.modoFiltroActivo) {
          storeV.listaVehiculos = storeV.todosLosCarros.slice(0, storeV.cantidadVisible)
        }

        this.mensajeExito = `¡Vehículo "${guardado.marca} ${guardado.modelo}" agregado con éxito!`
        return guardado
      } catch (error) {
        this.mensajeError = 'Error al agregar el vehículo.'
        throw error
      } finally {
        this.cargando = false
      }
    },

    async modificarVehiculo(id: string | number, datosModificados: Partial<VehiculoAdmin>) {
      this.cargando = true
      this.limpiarMensajes()
      try {
        const actualizado = await $fetch<VehiculoAdmin>(`/api/products/${id}`, {
          method: 'PUT',
          body: datosModificados,
        })

        const index = this.inventarioVehiculos.findIndex((c) => String(c.id) === String(id))
        if (index !== -1) {
          this.inventarioVehiculos[index] = { ...this.inventarioVehiculos[index], ...datosModificados }
        }

        // Sincroniza con el catálogo
        const storeV = useVehiculosStore()
        const catIndex = storeV.todosLosCarros.findIndex((c: any) => String(c.id) === String(id))
        if (catIndex !== -1) {
          storeV.todosLosCarros[catIndex] = { ...storeV.todosLosCarros[catIndex], ...datosModificados }
          storeV.listaVehiculos = storeV.todosLosCarros.slice(0, storeV.cantidadVisible)
        }

        this.mensajeExito = '¡Vehículo actualizado correctamente!'
        return actualizado
      } catch (error) {
        this.mensajeError = 'No fue posible actualizar el vehículo.'
        throw error
      } finally {
        this.cargando = false
      }
    },

    async modificarEstadoVehiculo(id: string | number, nuevoEstado?: boolean) {
      this.cargando = true
      this.limpiarMensajes()
      const carro = this.inventarioVehiculos.find((c) => String(c.id) === String(id))
      const estadoFinal = typeof nuevoEstado === 'boolean' ? nuevoEstado : !carro?.disponible

      try {
        const respuesta = await $fetch<VehiculoAdmin>(`/api/products/${id}`, {
          method: 'PATCH',
          body: { disponible: estadoFinal },
        })

        if (carro) carro.disponible = estadoFinal

        // Sincroniza con el catálogo
        const storeV = useVehiculosStore()
        const catCarro = storeV.todosLosCarros.find((c: any) => String(c.id) === String(id))
        if (catCarro) catCarro.disponible = estadoFinal

        this.mensajeExito = `Estado cambiado a: ${estadoFinal ? 'Disponible' : 'Agotado'}`
        return respuesta
      } catch (error) {
        this.mensajeError = 'No se pudo cambiar el estado del vehículo.'
        throw error
      } finally {
        this.cargando = false
      }
    },

    async eliminarVehiculo(id: string | number) {
      this.cargando = true
      this.limpiarMensajes()
      try {
        await $fetch(`/api/products/${id}`, { method: 'DELETE' })
        this.inventarioVehiculos = this.inventarioVehiculos.filter((c) => String(c.id) !== String(id))

        // Sincroniza con el catálogo
        const storeV = useVehiculosStore()
        storeV.todosLosCarros = storeV.todosLosCarros.filter((c: any) => String(c.id) !== String(id))
        storeV.listaVehiculos = storeV.listaVehiculos.filter((c: any) => String(c.id) !== String(id))

        this.mensajeExito = `Vehículo #${id} eliminado correctamente.`
        return true
      } catch (error) {
        this.mensajeError = 'No se pudo eliminar el vehículo.'
        throw error
      } finally {
        this.cargando = false
      }
    },

    // ---------------------------------------------
    // 3. GESTIÓN DE RESERVAS (API /api/reservas)
    // ---------------------------------------------
    async cargarReservas() {
      this.cargando = true
      try {
        const data = await $fetch<ReservaAdmin[]>('/api/reservas')
        this.listaReservas = Array.isArray(data) ? data : []
      } catch (error) {
        this.mensajeError = 'Error al cargar reservas.'
      } finally {
        this.cargando = false
      }
    },

    async cambiarEstadoReserva(id: string | number, nuevoEstado: string) {
      this.cargando = true
      this.limpiarMensajes()
      try {
        const respuesta = await $fetch<ReservaAdmin>(`/api/reservas/${id}`, {
          method: 'PATCH',
          body: { estado: nuevoEstado },
        })

        const item = this.listaReservas.find((r) => String(r.id) === String(id))
        if (item) item.estado = nuevoEstado

        this.mensajeExito = `Estado de reserva actualizado a: "${nuevoEstado}".`
        return respuesta
      } catch (error) {
        this.mensajeError = 'No se pudo actualizar el estado de la reserva.'
        throw error
      } finally {
        this.cargando = false
      }
    },

    async eliminarReserva(id: string | number) {
      this.cargando = true
      this.limpiarMensajes()
      try {
        await $fetch(`/api/reservas/${id}`, { method: 'DELETE' })
        this.listaReservas = this.listaReservas.filter((r) => String(r.id) !== String(id))
        this.mensajeExito = `Reserva #${id} eliminada con éxito.`
        return true
      } catch (error) {
        this.mensajeError = 'No se pudo eliminar la reserva.'
        throw error
      } finally {
        this.cargando = false
      }
    },

    // ---------------------------------------------
    // 4. MÉTODOS AUXILIARES
    // ---------------------------------------------
    async cargarTodo() {
      await Promise.all([this.cargarProductos(), this.cargarReservas()])
    },

    limpiarMensajes() {
      this.mensajeExito = ''
      this.mensajeError = ''
    },
  },
})
