import { readDbData, writeDbData } from '../utils/db'

// Endpoint para agregar un nuevo vehículo al inventario
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.marca || !body.modelo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La marca y el modelo son obligatorios',
    })
  }

  const nuevoVehiculo = {
    id: body.id ? String(body.id) : String(Date.now()),
    marca: body.marca.trim(),
    modelo: body.modelo.trim(),
    categoria: body.categoria || 'Sedán',
    anio: Number(body.anio) || new Date().getFullYear(),
    color: body.color || 'Blanco',
    precio: Number(body.precio) || 0,
    currency: body.currency || 'USD',
    disponible: typeof body.disponible === 'boolean' ? body.disponible : true,
  }

  try {
    // Si json-server está corriendo en el puerto 3001, intentamos guardarlo allí
    const guardado = await $fetch('http://localhost:3001/products', {
      method: 'POST',
      body: nuevoVehiculo,
    })
    return guardado
  } catch (error) {
    // Respaldo directo en db.json si json-server no está encendido
    const db = readDbData()
    if (!Array.isArray(db.products)) {
      db.products = []
    }

    db.products.push(nuevoVehiculo)
    writeDbData(db)
    return nuevoVehiculo
  }
})
