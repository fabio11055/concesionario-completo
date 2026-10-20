import { defineStore } from 'pinia'
import {
  reservasService,
  type Reserva,
} from '~/pages/services/reservasService'

export const useStoreReservations = defineStore('reservations', {
  state: () => ({
    reservations: [] as Reserva[],
    loading: false,
    error: '',
  }),

  actions: {
    async fetchReservations() {
      this.loading = true
      this.error = ''

      try {
        this.reservations = await reservasService.obtenerTodas()
      } catch (error) {
        console.error('Error al cargar reservas:', error)
        this.error = 'No se pudieron cargar las solicitudes.'
      } finally {
        this.loading = false
      }
    },

    async createReservation(datos: Omit<Reserva, 'id'>) {
      try {
        const nueva = await reservasService.crear(datos)
        this.reservations.unshift(nueva)
        return nueva
      } catch (error) {
        console.error('Error al crear la solicitud:', error)
        this.error = 'No se pudo guardar la solicitud en la base de datos.'
        throw error
      }
    },

    async updateReservation(id: number | string, datos: Partial<Reserva>) {
      try {
        const actualizada = await reservasService.actualizar(id, datos)
        const index = this.reservations.findIndex(r => String(r.id) === String(id))

        if (index !== -1) {
          this.reservations[index] = { ...this.reservations[index], ...actualizada }
        }

        return actualizada
      } catch (error) {
        console.error('Error al actualizar la solicitud:', error)
        this.error = 'No se pudo actualizar la solicitud.'
        throw error
      }
    },

    async deleteReservation(id: number | string) {
      try {
        await reservasService.eliminar(id)
        this.reservations = this.reservations.filter(r => String(r.id) !== String(id))
      } catch (error) {
        console.error('Error al eliminar la solicitud:', error)
        this.error = 'No se pudo eliminar la solicitud.'
        throw error
      }
    },
  },
})
