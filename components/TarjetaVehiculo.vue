<script setup>
// Recibe los datos del vehículo mediante Props
defineProps({
  vehiculo: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="tarjeta-carro">
    <div class="encabezado">
      <div>
        <span class="etiqueta-marca">{{ vehiculo.marca }}</span>
        <h3 class="modelo-titulo">{{ vehiculo.modelo }}</h3>
      </div>
      <span
        class="estado"
        :class="vehiculo.disponible ? 'disponible' : 'agotado'"
      >
        {{ vehiculo.disponible ? 'Disponible' : 'Agotado' }}
      </span>
    </div>

    <div class="detalles">
      <div class="fila-detalle">
        <span class="label-info">Categoría:</span>
        <span class="valor-info">{{ vehiculo.categoria }}</span>
      </div>
      <div class="fila-detalle">
        <span class="label-info">Año:</span>
        <span class="valor-info">{{ vehiculo.anio }}</span>
      </div>
      <div class="fila-detalle">
        <span class="label-info">Color:</span>
        <span class="valor-info">{{ vehiculo.color }}</span>
      </div>
      <div class="precio-bloque">
        <span class="precio-label">Precio</span>
        <span class="precio-monto">
          ${{ Number(vehiculo.precio).toLocaleString('en-US') }} {{ vehiculo.currency }}
        </span>
      </div>
    </div>

    <!-- Slot opcional por si se desea incrustar acciones dentro de la tarjeta -->
    <slot />
  </div>
</template>

<style scoped>
.tarjeta-carro {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease-in-out;
}

.tarjeta-carro:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
}

.etiqueta-marca {
  display: inline-block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #2563eb;
  background-color: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.modelo-titulo {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.estado {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 700;
}

.estado.disponible {
  background-color: #dcfce7;
  color: #15803d;
}

.estado.agotado {
  background-color: #fee2e2;
  color: #b91c1c;
}

.detalles {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fila-detalle {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
}

.label-info {
  color: #64748b;
  font-weight: 500;
}

.valor-info {
  color: #1e293b;
  font-weight: 600;
}

.precio-bloque {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.precio-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.precio-monto {
  color: #2563eb;
  font-size: 1.2rem;
  font-weight: 800;
}
</style>
