// src/domains/formal/components/proyectos/ControlCambiosTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import {
  fetchControlCambiosPorProyecto,
  actualizarBanderasControlCambio,
} from '../../../../features/controlCambios/controlCambiosSlice';
import AddControlCambioModal from './AddControlCambioModal';

// El backend solo permite crear registros y corregir las 4 banderas
// (cambio_tiempo / investigador / costo / producto) — no hay update ni
// delete del registro completo: es una bitácora de control de cambios.
// Coincide con ROLES_CREACION_OPERATIVA del backend (control_cambios_viewset.py)
const ROLES_PUEDEN_CREAR = ['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO'];
// Coincide con el permiso EsCInterno | EsCExterno de la acción "banderas"
const ROLES_PUEDEN_EDITAR_BANDERAS = ['CINTERNO', 'CEXTERNO'];

const BANDERAS = [
  { key: 'cambio_tiempo', label: 'Tiempo' },
  { key: 'cambio_investigador', label: 'Investigador' },
  { key: 'cambio_costo', label: 'Costo' },
  { key: 'cambio_producto', label: 'Producto' },
];

const ControlCambiosTable = ({ proyectoId, readOnly = false }) => {
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.auth);
  const { registros, loading } = useSelector((state) => state.controlCambios);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    if (proyectoId) dispatch(fetchControlCambiosPorProyecto(proyectoId));
  }, [dispatch, proyectoId]);

  const hasAnyRole = (requiredRoles) => (roles || []).some((rol) => requiredRoles.includes(rol));

  const toggleBandera = (rowData, banderaKey) => {
    dispatch(
      actualizarBanderasControlCambio({
        controlCambioId: rowData.id,
        proyectoId,
        banderas: { [banderaKey]: !rowData[banderaKey] },
      })
    );
  };

  const banderasBodyTemplate = (rowData) => {
    const puedeEditar = !readOnly && hasAnyRole(ROLES_PUEDEN_EDITAR_BANDERAS);
    return (
      <div className="d-flex gap-1 flex-wrap">
        {BANDERAS.map(({ key, label }) => (
          <Tag
            key={key}
            value={label}
            severity={rowData[key] ? 'success' : 'secondary'}
            style={puedeEditar ? { cursor: 'pointer' } : undefined}
            onClick={puedeEditar ? () => toggleBandera(rowData, key) : undefined}
          />
        ))}
      </div>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Control de Cambios del Proyecto</h5>
    </div>
  );

  return (
    <>
      {!readOnly && hasAnyRole(ROLES_PUEDEN_CREAR) && (
        <div className="d-flex justify-content-end mb-3">
          <Button label="Registrar Cambio" icon="pi pi-plus" onClick={() => setIsAddModalVisible(true)} />
        </div>
      )}
      <DataTable
        value={registros}
        header={header}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="No se han registrado cambios sobre este proyecto."
        responsiveLayout="scroll"
        sortField="fecha_cambio"
        sortOrder={-1}
      >
        <Column field="fecha_cambio" header="Fecha" sortable />
        <Column field="tipo_cambio" header="Tipo de Cambio" sortable />
        <Column header="Afecta a" body={banderasBodyTemplate} />
      </DataTable>
      {!readOnly && (
        <AddControlCambioModal
          visible={isAddModalVisible}
          onHide={() => setIsAddModalVisible(false)}
          proyectoId={proyectoId}
        />
      )}
    </>
  );
};

export default ControlCambiosTable;