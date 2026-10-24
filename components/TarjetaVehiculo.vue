<script setup>
// Recibe el objeto con los datos del vehículo
defineProps({
  vehiculo: { type: Object, required: true }
})
</script>

<template>
  <div class="tarjeta">
    <!-- Encabezado con marca, modelo y estado -->
    <div class="cabecera">
      <div>
        <span class="marca">{{ vehiculo.marca }}</span>
        <h3>{{ vehiculo.modelo }}</h3>
      </div>
      <span class="badge" :class="vehiculo.disponible ? 'disponible' : 'agotado'">
        {{ vehiculo.disponible ? 'Disponible' : 'Agotado' }}
      </span>
    </div>

    <!-- Especificaciones técnicas -->
    <div class="detalles">
      <p><span>Categoría:</span> <strong>{{ vehiculo.categoria }}</strong></p>
      <p><span>Año:</span> <strong>{{ vehiculo.anio }}</strong></p>
      <p><span>Color:</span> <strong>{{ vehiculo.color }}</strong></p>
      <div class="precio">
        <span>Precio:</span>
        <strong class="monto">${{ Number(vehiculo.precio).toLocaleString() }} {{ vehiculo.currency || 'USD' }}</strong>
      </div>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.tarjeta {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}

.marca {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1d4ed8;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
}

h3 {
  margin: 4px 0 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
}

.disponible {
  background: #dcfce7;
  color: #166534;
}

.agotado {
  background: #fee2e2;
  color: #991b1b;
}

.detalles p {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
  font-size: 0.88rem;
  color: #334155;
}

.detalles p span {
  color: #64748b;
}

.precio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #cbd5e1;
  padding-top: 8px;
  margin-top: 4px;
  font-size: 0.9rem;
  color: #334155;
}

.monto {
  font-size: 1.2rem;
  color: #2563eb;
}
</style>
