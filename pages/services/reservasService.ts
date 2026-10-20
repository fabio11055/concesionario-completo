export interface Reserva {
  id: number | string
  productId: number | string
  vehiculo?: string
  nombre: string
  telefono: string
  email?: string
  fecha: string
  mensaje?: string
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada'
  fechaCreacion?: string
}

const API_URL = 'http://localhost:3001/reservations'

export const reservasService = {
  /**
   * Extrae todas las reservas/solicitudes de la base de datos
   */
  obtenerTodas() {
    return $fetch<Reserva[]>(API_URL)
  },

  /**
   * Guarda una nueva solicitud de vehículo en la base de datos
   */
  crear(datos: Omit<Reserva, 'id'>) {
    return $fetch<Reserva>(API_URL, {
      method: 'POST',
      body: datos,
    })
  },

  /**
   * Actualiza el estado o datos de una reserva en la base de datos
   */
  actualizar(id: number | string, datos: Partial<Reserva>) {
    return $fetch<Reserva>(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: datos,
    })
  },

  /**
   * Elimina una reserva de la base de datos
   */
  eliminar(id: number | string) {
    return $fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })
  },
}
