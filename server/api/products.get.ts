import { defineEventHandler, getQuery } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

interface VehiculoDB {
  id: string | number
  name?: string
  marca: string
  modelo: string
  categoria?: string
  category?: string
  anio?: number
  year?: number
  precio?: number
  price?: number
  color?: string
  currency?: string
  disponible?: boolean
  estado?: string
  status?: string
}

function leerDbJsonLocal(): VehiculoDB[] {
  try {
    const ruta = path.resolve(process.cwd(), 'db.json')
    if (fs.existsSync(ruta)) {
      const contenido = fs.readFileSync(ruta, 'utf-8')
      const parsed = JSON.parse(contenido)
      return parsed.products || []
    }
  } catch (err) {
    console.error('Error al leer db.json local:', err)
  }
  return []
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const marcaFiltro = (query.marca as string || query.q as string || '').trim().toLowerCase()
  const start = query.start !== undefined ? parseInt(query.start as string, 10) : undefined
  const limit = query.limit !== undefined ? parseInt(query.limit as string, 10) : undefined

  let todos: VehiculoDB[] = []

  // Intentar consultar json-server en http://localhost:3001/products
  try {
    const url = marcaFiltro
      ? `http://localhost:3001/products?marca:contains=${encodeURIComponent(marcaFiltro)}`
      : 'http://localhost:3001/products'
    
    const respuesta = await $fetch<VehiculoDB[]>(url)
    if (Array.isArray(respuesta)) {
      todos = respuesta
    }
  } catch (error) {
    console.warn('json-server (puerto 3001) no respondió, usando db.json local:', error)
    // Fallback de contingencia a db.json local
    const dataLocal = leerDbJsonLocal()
    if (marcaFiltro) {
      todos = dataLocal.filter(v =>
        (v.marca && v.marca.toLowerCase().includes(marcaFiltro)) ||
        (v.modelo && v.modelo.toLowerCase().includes(marcaFiltro))
      )
    } else {
      todos = dataLocal
    }
  }

  // Si se solicitó paginación con start y limit
  if (start !== undefined && limit !== undefined) {
    const total = todos.length
    const sliced = todos.slice(start, start + limit)
    const hasMore = start + limit < total

    return {
      data: sliced,
      total,
      start,
      limit,
      hasMore,
      count: sliced.length,
    }
  }

  // Si se solicita filtrar por marca directamente sin paginación (o lista completa)
  if (query.paginado === 'true') {
    return {
      data: todos,
      total: todos.length,
      hasMore: false,
      count: todos.length,
    }
  }

  // Por compatibilidad estándar con json-server devuelve el array completo
  return todos
})
