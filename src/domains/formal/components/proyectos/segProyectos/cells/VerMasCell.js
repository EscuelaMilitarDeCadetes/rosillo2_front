// src/domains/formal/components/proyectos/segProyectos/cells/VerMasCell.js
import React from "react";
import { Button } from "primereact/button";

// Reemplaza investigadoresTemplate y productosTemplate, que eran idénticos
// salvo el texto y el handler.
const VerMasCell = ({ tiene, onVerMas, mensajeVacio }) =>
  tiene ? (
    <Button label="VER MÁS" className="p-button-text p-button-sm" onClick={onVerMas} />
  ) : (
    <span style={{ color: "gray" }}>{mensajeVacio}</span>
  );

export default VerMasCell;