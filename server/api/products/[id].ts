import { readDbData, writeDbData } from '../../utils/db'

// Endpoint único para manejar las operaciones por ID de productos (PUT, PATCH, DELETE)
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const id = getRouterParam(event, 'id') || (event.context.params as any)?.id
  const body = method !== 'DELETE' ? await readBody(event) : null

  // 1. Intentar comunicar con json-server (puerto 3001)
  try {
    return await $fetch(`http://localhost:3001/products/${id}`, {
      method,
      body,
    })
  } catch {
    // 2. Si json-server no está corriendo, gestionar directamente en db.json
    const db = readDbData()
    if (!Array.isArray(db.products)) {
      db.products = []
    }

    // ELIMINAR (DELETE)
    if (method === 'DELETE') {
      db.products = db.products.filter((p: any) => String(p.id) !== String(id))
      writeDbData(db)
      return { success: true, id }
    }

    // EDITAR O CAMBIAR ESTADO (PUT o PATCH)
    const index = db.products.findIndex((p: any) => String(p.id) === String(id))
    if (index === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: `Vehículo con ID ${id} no encontrado`,
      })
    }

    db.products[index] = {
      ...db.products[index],
      ...body,
    }

    writeDbData(db)
    return db.products[index]
  }
})
