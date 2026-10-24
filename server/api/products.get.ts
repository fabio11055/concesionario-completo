// El servidor se encarga de pasarle los productos al store
export default defineEventHandler(async () => {
  try {
    // Si json-server está corriendo (puerto 3001), extrae los productos de allí
    return await $fetch('http://localhost:3001/products')
  } catch {
    // Si json-server no está encendido, responde leyendo directamente de db.json
    const db = readDbData()
    return db.products || []
  }
})
