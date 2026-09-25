// src/domains/formal/components/proyectos/segProyectos/cells/MontoCell.js
import React from "react";
import { formatoMoneda } from "../formatters";

// Celda genérica para columnas monetarias dependientes del detalle async
// (contrapartida, total, ejecutado).
const MontoCell = ({ cargando, valor }) => (cargando ? "..." : formatoMoneda(valor));

export default MontoCell;