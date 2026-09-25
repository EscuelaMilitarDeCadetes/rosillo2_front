// src/domains/formal/components/proyectos/ListaAsignados.js
import React from 'react';

const ListaAsignados = ({ titulo, items, renderItem, cargando, vacio }) => (
  <div className="border rounded p-3 mb-3 bg-light">
    <h6 className="mb-2">
      {titulo}{' '}
      {!cargando && <span className="badge bg-secondary">{items.length}</span>}
    </h6>
    {cargando ? (
      <small><i className="pi pi-spin pi-spinner me-1" />Cargando…</small>
    ) : items.length === 0 ? (
      <small className="text-muted">{vacio}</small>
    ) : (
      <ul className="list-unstyled mb-0" style={{ maxHeight: '10rem', overflowY: 'auto' }}>
        {items.map((item, i) => (
          <li key={item.id ?? i} className="py-1">{renderItem(item)}</li>
        ))}
      </ul>
    )}
  </div>
);

export default ListaAsignados;