// El servidor se encarga de recibir la reserva del store y mandarla a json-server en el puerto 3001 (/reservas) o a db.json
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // Si json-server está corriendo (puerto 3001), envía la reserva al endpoint /reservas
    return await $fetch('http://localhost:3001/reservas', {
      method: 'POST',
      body,
    })
  } catch (error) {
    console.warn('json-server (puerto 3001) no respondió, guardando en db.json de respaldo')
    // Si json-server no está encendido en el puerto 3001, guardamos localmente en db.json
    const nuevaReserva = {
      id: body.id ? String(body.id) : String(Date.now()),
      ...body,
      estado: body.estado || 'Pendiente',
      fechaCreacion: body.fechaCreacion || new Date().toISOString(),
    }
// Intentamos persistir la reserva en db.json
    try {
      const db = readDbData()
      if (!Array.isArray(db.reservas)) {
        db.reservas = []
      }
      db.reservas.push(nuevaReserva)
      writeDbData(db)
    } catch (fsError) {
      console.error('Error al persistir reserva en db.json:', fsError)
    }

    return nuevaReserva
  }
})
