export interface Vehiculo {
  id: number | string
  name?: string
  marca: string
  modelo: string
  categoria: string
  category?: string
  anio: number
  year?: number
  precio: number
  price?: number
  color: string
  currency?: string
  estado?: string
  status?: string
  disponible: boolean
}

export interface RespuestaPaginadaVehiculos {
  data: Vehiculo[]
  total: number
  hasMore: boolean
  start: number
  limit: number
  count: number
}

const API_SERVER_URL = 'http://localhost:3001/products'
const API_LOCAL_URL = '/api/products'

export const vehiculosService = {
  /**
   * Obtiene todos los vehículos desde el servidor backend
   */
  async obtenerTodos(): Promise<Vehiculo[]> {
    try {
      return await $fetch<Vehiculo[]>(API_SERVER_URL)
    } catch {
      return await $fetch<Vehiculo[]>(API_LOCAL_URL)
    }
  },

  /**
   * Extrae vehículos paginados desde el servidor con start y limit
   * Permite extraer los primeros 6 y luego lotes de 5
   */
  async obtenerPaginados(start: number, limit: number, marca = ''): Promise<RespuestaPaginadaVehiculos> {
    const params = new URLSearchParams()
    params.set('start', String(start))
    params.set('limit', String(limit))
    if (marca.trim()) {
      params.set('marca', marca.trim())
    }

    try {
      return await $fetch<RespuestaPaginadaVehiculos>(`${API_LOCAL_URL}?${params.toString()}`)
    } catch {
      // Fallback directo en caso de fallo
      const todos = await this.obtenerTodos()
      const filtrados = marca.trim()
        ? todos.filter(v => v.marca.toLowerCase().includes(marca.toLowerCase().trim()))
        : todos
      const sliced = filtrados.slice(start, start + limit)
      return {
        data: sliced,
        total: filtrados.length,
        hasMore: start + limit < filtrados.length,
        start,
        limit,
        count: sliced.length,
      }
    }
  },

  /**
   * Extrae del servidor todos los vehículos que coincidan con la marca especificada
   */
  async obtenerPorMarca(marca: string): Promise<Vehiculo[]> {
    if (!marca.trim()) {
      return []
    }
    try {
      return await $fetch<Vehiculo[]>(`${API_LOCAL_URL}?marca=${encodeURIComponent(marca.trim())}`)
    } catch {
      try {
        return await $fetch<Vehiculo[]>(`${API_SERVER_URL}?marca:contains=${encodeURIComponent(marca.trim())}`)
      } catch {
        const todos = await this.obtenerTodos()
        return todos.filter(v => v.marca.toLowerCase().includes(marca.toLowerCase().trim()))
      }
    }
  },

  /**
   * Obtiene un vehículo por su identificador único
   */
  obtenerPorId(id: number | string) {
    return $fetch<Vehiculo>(`${API_SERVER_URL}/${id}`)
  },

  /**
   * Registra un nuevo vehículo en la base de datos del servidor
   */
  crear(datos: Record<string, unknown>) {
    return $fetch<Vehiculo>(API_SERVER_URL, {
      method: 'POST',
      body: datos,
    })
  },

  /**
   * Actualiza los datos de un vehículo existente en la base de datos
   */
  actualizar(id: number | string, datos: Record<string, unknown>) {
    return $fetch<Vehiculo>(`${API_SERVER_URL}/${id}`, {
      method: 'PATCH',
      body: datos,
    })
  },

  /**
   * Elimina un vehículo de la base de datos del servidor
   */
  eliminar(id: number | string) {
    return $fetch(`${API_SERVER_URL}/${id}`, {
      method: 'DELETE',
    })
  },
}
