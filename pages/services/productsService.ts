import { vehiculosService, type Vehiculo, type RespuestaPaginadaVehiculos } from './vehiculosService'
import type { Product } from '~/stores/products'

export const productsService = {
  obtenerTodos(): Promise<Product[]> {
    return vehiculosService.obtenerTodos() as Promise<Product[]>
  },

  obtenerPaginados(start: number, limit: number, marca = ''): Promise<RespuestaPaginadaVehiculos> {
    return vehiculosService.obtenerPaginados(start, limit, marca)
  },

  obtenerPorMarca(marca: string): Promise<Product[]> {
    return vehiculosService.obtenerPorMarca(marca) as Promise<Product[]>
  },

  obtenerPorId(id: number | string): Promise<Product> {
    return vehiculosService.obtenerPorId(id) as Promise<Product>
  },

  crear(datos: Record<string, unknown>): Promise<Product> {
    return vehiculosService.crear(datos) as Promise<Product>
  },

  actualizar(id: number | string, datos: Record<string, unknown>): Promise<Product> {
    return vehiculosService.actualizar(id, datos) as Promise<Product>
  },

  eliminar(id: number | string) {
    return vehiculosService.eliminar(id)
  },
}
