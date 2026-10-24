// El servidor se encarga de pasarle las reservas al store desde json-server (puerto 3001) o db.json
export default defineEventHandler(async () => {
  try {
    // Si json-server está corriendo (puerto 3001), extrae las reservas de allí
    return await $fetch('http://localhost:3001/reservas')
  } catch {
    // Si json-server no está encendido, responde con las reservas de db.json
    const db = readDbData()
    return db.reservas || []
  }
})
