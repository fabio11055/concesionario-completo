import { defineStore } from 'pinia'

export const useVehiculosStore = defineStore('vehiculos', {
  state: () => ({
    // Lista completa que viene del servidor
    todosLosCarros: [],
    // Carros que se muestran actualmente en el index
    listaVehiculos: [],
    // Cantidad visible (empieza mostrando 6)
    cantidadVisible: 6,
    // Bandera de carga
    cargando: false,
    // Bandera para saber si se está filtrando
    modoFiltroActivo: false
  }),

  getters: {
    // Total de carros disponibles en el servidor // lenght cuenta cuantos elementos hay en el array
    totalEnServidor: (state) => state.todosLosCarros.length,
    // Verifica si ya se mostraron todos los carros
    sinMasAutos: (state) => state.listaVehiculos.length >= state.todosLosCarros.length,
    // Bandera de carga inicial
    cargandoInicial: (state) => state.cargando && state.todosLosCarros.length === 0,
    cargandoMas: () => false
  },

  actions: {
    // El store le solicita la información al servidor (/api/products)
    async cargarInicial() {
      this.cargando = true
      try {
        const respuesta = await $fetch('/api/products')
        this.todosLosCarros = respuesta || []
        this.cantidadVisible = 6
        this.modoFiltroActivo = false
        this.listaVehiculos = this.todosLosCarros.slice(0, 6)
      } catch (error) {
        console.error('Error al pedir datos al servidor:', error)
      } finally {
        this.cargando = false
      }
    },

    // Muestra 5 carros más
    cargarMas() {
      //condiciona si ya se mostraron todos los carros, si es así no hace nada
      if (this.sinMasAutos) return
      this.cantidadVisible += 5
                            //toma una copia de los carros que ya se mostraban y le agrega 5 más
      this.listaVehiculos = this.todosLosCarros.slice(0, this.cantidadVisible)
    },

    // Filtra los vehículos según lo que escriba el usuario
    buscarPorMarca(texto = '') {
                      //elimina todo el espacio en blanco y lo pasa a minúscula
      const palabra = texto.trim().toLowerCase()
      //comprueba si es un string vacio
      if (!palabra) {
        this.modoFiltroActivo = false
        this.listaVehiculos = this.todosLosCarros.slice(0, this.cantidadVisible)
        return
      }

      this.modoFiltroActivo = true
      this.listaVehiculos = this.todosLosCarros.filter(carro =>
        carro.marca.toLowerCase().includes(palabra) ||
        carro.modelo.toLowerCase().includes(palabra)
      )
    }
  }
})

// (estate) estado actual del store  