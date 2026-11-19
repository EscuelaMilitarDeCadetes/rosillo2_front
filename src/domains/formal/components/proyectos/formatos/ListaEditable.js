// src/domains/formal/components/proyectos/formatos/ListaEditable.js
// Tabla simple de filas editables (equipo, riesgos, productos, cronograma...)
// para revisar lo que se extrajo de la propuesta antes de confirmarlo.
import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

const ListaEditable = ({ titulo, filas = [], columnas, onChange, filaNueva, ayuda }) => {
  const actualizar = (indice, campo, valor) => {
    const copia = filas.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f));
    onChange(copia);
  };
  const eliminar = (indice) => onChange(filas.filter((_, i) => i !== indice));
  const agregar = () => onChange([...filas, { ...filaNueva }]);

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="m-0">{titulo} <small className="p-text-secondary">({filas.length})</small></h6>
        <Button icon="pi pi-plus" label="Agregar" className="p-button-text p-button-sm" onClick={agregar} />
      </div>
      {ayuda && <small className="p-text-secondary d-block mb-2">{ayuda}</small>}
      {filas.length === 0 && <div className="p-text-secondary small">Sin registros.</div>}
      {filas.map((fila, indice) => (
        <div key={indice} className="d-flex gap-2 align-items-start mb-2">
          {columnas.map(({ campo, etiqueta, ancho = 1, multilinea = false }) => (
            <div key={campo} style={{ flex: ancho }}>
              {indice === 0 && <small className="d-block p-text-secondary">{etiqueta}</small>}
              {multilinea ? (
                <InputTextarea value={fila[campo] ?? ''} rows={1} autoResize className="w-100"
                  onChange={(e) => actualizar(indice, campo, e.target.value)} />
              ) : (
                <InputText value={fila[campo] ?? ''} className="w-100"
                  onChange={(e) => actualizar(indice, campo, e.target.value)} />
              )}
            </div>
          ))}
          <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger p-button-sm"
            style={{ marginTop: indice === 0 ? '1.2rem' : 0 }} tooltip="Quitar" onClick={() => eliminar(indice)} />
        </div>
      ))}
    </div>
  );
};

export default ListaEditable;
