import { defineStore } from 'pinia'
import { productsService } from '~/pages/services/productsService'
import type { Vehiculo } from '~/pages/services/vehiculosService'

export interface Product extends Vehiculo {
  id: number | string
  name?: string
  marca: string
  modelo: string
  category?: string
  categoria: string
  year?: number
  anio: number
  color: string
  price?: number
  precio: number
  currency?: string
  status?: string
  estado?: string
  disponible: boolean
}

export const useStoreProduct = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    product: null as Product | null,
    loading: false,
    error: '',
    totalDisponibles: 0,
    hasMore: true,
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = ''

      try {
        const raw = await productsService.obtenerTodos()
        this.products = (raw as unknown as Product[])
        this.totalDisponibles = this.products.length

        if (this.product) {
          this.product =
            this.products.find(p => String(p.id) === String(this.product?.id)) ?? null
        }

        if (!this.product && this.products.length > 0) {
          this.setCurrentProduct(this.products[0])
        }
      } catch (error) {
        console.error('Error al cargar vehículos:', error)
        this.error = 'No se pudieron cargar los vehículos de la base de datos.'
      } finally {
        this.loading = false
      }
    },

    async fetchPaginated(start: number, limit: number, marca = '') {
      this.loading = true
      this.error = ''

      try {
        const respuesta = await productsService.obtenerPaginados(start, limit, marca)
        this.totalDisponibles = respuesta.total
        this.hasMore = respuesta.hasMore
        return respuesta
      } catch (error) {
        console.error('Error al obtener vehículos paginados:', error)
        this.error = 'No se pudieron extraer más vehículos del servidor.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchByBrand(marca: string) {
      this.loading = true
      this.error = ''

      try {
        const resultado = await productsService.obtenerPorMarca(marca)
        return (resultado as unknown as Product[])
      } catch (error) {
        console.error('Error al filtrar vehículos por marca:', error)
        this.error = `No se pudieron cargar los vehículos de marca ${marca}.`
        throw error
      } finally {
        this.loading = false
      }
    },

    setCurrentProduct(product: Product) {
      this.product = { ...product }
    },

    async createProduct(datos: Record<string, unknown>) {
      const nuevo = (await productsService.crear(datos)) as unknown as Product
      this.products.unshift(nuevo)
      return nuevo
    },

    async saveProduct(updatedProduct: Product) {
      const guardado = (await productsService.actualizar(
        updatedProduct.id,
        updatedProduct,
      )) as unknown as Product

      this.updateProduct(guardado)
      return guardado
    },

    updateProduct(updatedProduct: Product) {
      const index = this.products.findIndex(
        p => String(p.id) === String(updatedProduct.id),
      )

      if (index !== -1) {
        this.products[index] = { ...updatedProduct }
      }

      if (String(this.product?.id) === String(updatedProduct.id)) {
        this.product = { ...updatedProduct }
      }
    },

    async deleteProduct(id: number | string) {
      await productsService.eliminar(id)

      this.products = this.products.filter(p => String(p.id) !== String(id))

      if (String(this.product?.id) === String(id)) {
        this.product = this.products[0] ?? null
      }
    },
  },
})
