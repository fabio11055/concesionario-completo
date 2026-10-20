import { defineStore } from 'pinia'

export interface UsuarioAuth {
  nombre: string
  rol: 'admin' | 'usuario'
}

export const useStoreAuth = defineStore('auth', {
  state: () => ({
    usuario: null as UsuarioAuth | null,
    error: '',
  }),

  getters: {
    esAdmin: (state): boolean => state.usuario?.rol === 'admin',
    estaAutenticado: (state): boolean => state.usuario !== null,
  },

  actions: {
    iniciarSesionAdmin(clave: string): boolean {
      this.error = ''
      // Clave de administrador predeterminada
      if (clave === 'admin123' || clave === 'admin') {
        this.usuario = {
          nombre: 'Administrador Principal',
          rol: 'admin',
        }
        if (import.meta.client) {
          try {
            localStorage.setItem('auth_usuario_tap', JSON.stringify(this.usuario))
          } catch {}
        }
        return true
      } else {
        this.error = 'Contraseña de administrador incorrecta'
        return false
      }
    },

    restaurarSesion() {
      if (import.meta.client) {
        try {
          const guardado = localStorage.getItem('auth_usuario_tap')
          if (guardado) {
            this.usuario = JSON.parse(guardado)
          }
        } catch {}
      }
    },

    cerrarSesion() {
      this.usuario = null
      this.error = ''
      if (import.meta.client) {
        try {
          localStorage.removeItem('auth_usuario_tap')
        } catch {}
      }
    },
  },
})
