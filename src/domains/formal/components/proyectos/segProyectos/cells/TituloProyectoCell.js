// src/domains/formal/components/proyectos/segProyectos/cells/TituloProyectoCell.js
import React from "react";
import { Link } from "react-router-dom";

const TituloProyectoCell = ({ row }) =>
  row.calificacion_ultimo_filtro_calificacion === "APROBADO" ? (
    <Link to={`/proyectos/${row.proyecto}`} className="text-decoration-none">
      {row.proyecto_titulo}
    </Link>
  ) : (
    row.proyecto_titulo
  );

export default TituloProyectoCell;