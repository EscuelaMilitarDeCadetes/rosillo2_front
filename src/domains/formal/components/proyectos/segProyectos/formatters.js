// src/domains/formal/components/proyectos/segProyectos/formatters.js
export const SIN_PAGINAR = { params: { page_size: 200 } };

export const OPCIONES_CALIFICACION = [
  { label: "Sin calificar", value: "SIN_CALIFICAR" },
  { label: "Aprobado", value: "APROBADO" },
  { label: "No aprobado", value: "NO_APROBADO" },
];

export const formatoMoneda = (valor) =>
  valor != null
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(valor)
    : "N/A";