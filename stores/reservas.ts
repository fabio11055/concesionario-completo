import { defineStore } from 'pinia'

export interface Reserva {
  id?: string | number
  vehiculoId: string | number
  marca: string
  modelo: string
  precio: number
  currency: string
  nombreCliente: string
  documento: string
  telefono: string
  correo: string
  fechaReserva: string
  observaciones?: string
  fechaCreacion?: string
}

export const useReservasStore = defineStore('reservas', {
  state: () => ({
    listaReservas: [] as Reserva[],
    cargando: false,
    mensajeExito: '',
    mensajeError: '',
  }),

  getters: {
    totalReservas: (state) => state.listaReservas.length,
    tieneReservas: (state) => state.listaReservas.length > 0,
  },

  actions: {
    // 1. Obtener la lista de reservas desde la API
    async cargarReservas() {
      this.cargando = true
      this.limpiarMensajes()
      try {
        const respuesta = await $fetch<Reserva[]>('/api/reservas')
        this.listaReservas = Array.isArray(respuesta) ? respuesta : []
      } catch (error) {
        this.mensajeError = 'No se pudieron cargar las reservas.'
      } finally {
        this.cargando = false
      }
    },

    // 2. Crear una nueva reserva (POST a la API)
    async crearReserva(datosReserva: Omit<Reserva, 'id' | 'fechaCreacion'>) {
      this.cargando = true
      this.limpiarMensajes()
      try {
        const nuevaReserva = await $fetch<Reserva>('/api/reservas', {
          method: 'POST',
          body: datosReserva,
        })
        this.listaReservas.unshift(nuevaReserva)
        this.mensajeExito = '¡Tu reserva ha sido registrada con éxito!'
        return nuevaReserva
      } catch (error) {
        this.mensajeError = 'No fue posible registrar la reserva.'
        throw error
      } finally {
        this.cargando = false
      }
    },

    // 3. Limpiar mensajes de éxito o error
    limpiarMensajes() {
      this.mensajeExito = ''
      this.mensajeError = ''
    },
  },
})
