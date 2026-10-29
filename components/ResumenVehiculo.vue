<script setup>
// Props: recibe el vehículo seleccionado desde la página de reservas
defineProps({
  vehiculo: { type: Object, required: true }
})
</script>

<template>
  <div class="tarjeta">
    <h3>🚗 Vehículo Seleccionado</h3>
    <p><span>Vehículo:</span> <strong>{{ vehiculo.marca }} {{ vehiculo.modelo }}</strong></p>
    <p><span>Categoría:</span> <strong>{{ vehiculo.categoria }}</strong></p>
    <p><span>Año:</span> <strong>{{ vehiculo.anio }}</strong></p>
    <p><span>Color:</span> <strong>{{ vehiculo.color }}</strong></p>
    <div class="precio">
      <span>Precio:</span>
      <strong>${{ Number(vehiculo.precio).toLocaleString() }} {{ vehiculo.currency || 'USD' }}</strong>
    </div>
  </div>
</template>

<style scoped>
.tarjeta {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
h3 { margin: 0 0 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
p { display: flex; justify-content: space-between; margin: 8px 0; color: #334155; }
span { color: #64748b; }
.precio { display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 10px; }
.precio strong { color: #2563eb; font-size: 1.2rem; }
</style>
