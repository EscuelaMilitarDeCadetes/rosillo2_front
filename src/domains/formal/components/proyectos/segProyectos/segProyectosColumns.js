// src/domains/formal/components/proyectos/segProyectos/segProyectosColumns.js
import React from "react";
import { formatoMoneda } from "./formatters";
import TituloProyectoCell from "./cells/TituloProyectoCell";
import VerMasCell from "./cells/VerMasCell";
import MontoCell from "./cells/MontoCell";
import PorcentajeEjecutadoCell from "./cells/PorcentajeEjecutadoCell";

export function buildSegProyectosColumns({ detalle, cargandoDetalles, onVerInvestigadores, onVerProductos }) {
  return [
    { key: "codigo", field: "proyecto_codigo", header: "Código" },
    { key: "responsable", field: "responsable", header: "Facultad/Grupo" },
    { key: "titulo", header: "Proyecto", body: (row) => <TituloProyectoCell row={row} /> },
    { key: "anio", header: "Año", body: (row) => (cargandoDetalles ? "..." : detalle(row)?.anioConvocatoria ?? "N/A") },
    { key: "inicio", field: "proyecto_fecha_inicio", header: "Inicio" },
    { key: "fin", header: "Fin", body: (row) => (cargandoDetalles ? "..." : detalle(row)?.fechaFin ?? "N/A") },
    {
      key: "avance",
      header: "% Avance",
      body: (row) => {
        const d = detalle(row);
        if (cargandoDetalles || !d) return "...";
        return `${Number(d.avance ?? 0).toFixed(2)}%`;
      },
    },
    { key: "convocatoria", header: "Convocatoria", body: (row) => (row.convocatoria_interno ? "Interno" : "Externo") },
    { key: "valorAsignado", header: "Valor asignado", body: (row) => formatoMoneda(row.monto_aprobado) },
    { key: "contrapartida", header: "Valor contrapartida", body: (row) => <MontoCell cargando={cargandoDetalles} valor={detalle(row)?.contrapartida} /> },
    { key: "total", header: "Valor Total", body: (row) => <MontoCell cargando={cargandoDetalles} valor={detalle(row)?.total} /> },
    { key: "ejecutado", header: "Valor asignado ejecutado", body: (row) => <MontoCell cargando={cargandoDetalles} valor={detalle(row)?.ejecutado} /> },
    {
      key: "pctEjecutado",
      header: "% Ejecutado",
      body: (row) => (
        <PorcentajeEjecutadoCell cargando={cargandoDetalles} ejecutado={detalle(row)?.ejecutado} montoAprobado={row.monto_aprobado} />
      ),
    },
    { key: "gruplac", header: "gruLAC", body: (row) => (row.proyecto_gruplac ? "SI" : "NO") },
    {
      key: "investigadores",
      header: "Investigadores",
      body: (row) => <VerMasCell tiene={row.tiene_investigadores} onVerMas={() => onVerInvestigadores(row)} mensajeVacio="Sin investigadores" />,
    },
    {
      key: "productos",
      header: "Productos",
      body: (row) => <VerMasCell tiene={row.tiene_productos} onVerMas={() => onVerProductos(row)} mensajeVacio="Sin productos" />,
    },
  ];
}