import fs from 'node:fs'
import path from 'node:path'
import dbDefault from '../../db.json'

/**
 * Resuelve la ruta hacia el archivo db.json en el proyecto de forma segura
 */
export function getDbFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'db.json'),
    path.resolve(process.cwd(), 'tap_props', 'db.json'),
    path.resolve(process.cwd(), '..', 'db.json'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return path.resolve(process.cwd(), 'db.json')
}

/**
 * Lee los datos actuales de db.json en tiempo real
 */
export function readDbData(): any {
  try {
    const filePath = getDbFilePath()
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Error al leer db.json:', error)
  }
  return JSON.parse(JSON.stringify(dbDefault))
}

/**
 * Escribe los datos actualizados a db.json de forma segura
 */
export function writeDbData(data: any): boolean {
  try {
    const filePath = getDbFilePath()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error al escribir en db.json:', error)
    return false
  }
}
