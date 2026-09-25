// src/domains/formal/components/proyectos/GastosProyectoTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteDocumentoPresupuesto, deleteEjecucion } from '../../../../features/proyectos/gastoSlice';
import { fetchMontoPorProyecto } from '../../../../features/proyectos/montoSlice'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import AddGastoModal from './AddGastoModal';
import EditMontoAprobadoModal from './EditMontoAprobadoModal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/';

const GastosProyectoTable = ({ proyectoId }) => {
  const dispatch = useDispatch();
  const { gastos, loading } = useSelector((state) => state.gastos);
  const { montoProyecto } = useSelector((state) => state.montos)
  const { roles } = useSelector((state) => state.auth);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    if (proyectoId) {
      dispatch(fetchMontoPorProyecto(proyectoId));
    }
  }, [dispatch, proyectoId]);

  const hasAnyRole = (requiredRoles) => requiredRoles.some(role => roles.includes(role));

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Gastos</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const formatCurrency = (value) => {
    return value ? value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : '$0';
  };

  const downloadBodyTemplate = (rowData) => {
    if (rowData.documento) {
      return <Button icon="pi pi-download" className="p-button-rounded p-button-info p-button-sm" tooltip="Descargar" onClick={() => window.open(`${API_BASE_URL}common/documento-firma/${rowData.id}/descargar/`, '_blank')} />;
    }
    return 'N/A';
  };

  const actionBodyTemplate = (rowData) => {
    const canModify = hasAnyRole(['CINTERNO', 'CEXTERNO']);
    return (
      <div className="d-flex gap-2">
        {canModify && rowData.documento && rowData.estado && (
          <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar Documento" onClick={() => handleDeleteDocPresupuestoClick(rowData)} />
        )}
        {canModify && !rowData.estado && ( // Si el documento no está activo, se puede borrar la ejecución
          <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-sm" tooltip="Borrar Ejecución" onClick={() => handleDeleteEjecucionClick(rowData)} />
        )}
      </div>
    );
  };

  // Cálculos para el resumen del presupuesto
  const porcentajeImplementado = montoProyecto?.aprobado > 0 ? ((montoProyecto.ejecutado || 0) * 100 / montoProyecto.aprobado).toFixed(2) : 0;

  const [isAddGastoModalVisible, setIsAddGastoModalVisible] = useState(false);
  const [isEditMontoModalVisible, setIsEditMontoModalVisible] = useState(false);
  const [isDeleteDocConfirmVisible, setIsDeleteDocConfirmVisible] = useState(false);
  const [docPresupuestoToDelete, setDocPresupuestoToDelete] = useState(null);
  const [isDeleteEjecucionConfirmVisible, setIsDeleteEjecucionConfirmVisible] = useState(false);
  const [ejecucionToDelete, setEjecucionToDelete] = useState(null);

  const handleDeleteDocPresupuestoClick = (doc) => {
    setDocPresupuestoToDelete(doc);
    setIsDeleteDocConfirmVisible(true);
  };

  const handleConfirmDeleteDocPresupuesto = () => {
    if (docPresupuestoToDelete) {
      dispatch(deleteDocumentoPresupuesto({ documentoId: docPresupuestoToDelete.id, montoId: montoProyecto?.id })).then(() => setIsDeleteDocConfirmVisible(false));
    }
  };

  const handleDeleteEjecucionClick = (ejecucion) => {
    setEjecucionToDelete(ejecucion);
    setIsDeleteEjecucionConfirmVisible(true);
  };

  const handleConfirmDeleteEjecucion = () => {
    if (ejecucionToDelete) {
      dispatch(deleteEjecucion({ ejecucionId: ejecucionToDelete.id, proyectoId, montoId: montoProyecto?.id })).then(() => setIsDeleteEjecucionConfirmVisible(false));
    }
  };

  return (
    <>
      {montoProyecto?.proyecto_details?.financiado && (
        <div className="row g-4 mt-4">
          <div className="col-lg-9 col-md-9 col-sm-12">
            <h2 className="text-center">Gastos</h2>
            {montoProyecto.aprobado - (montoProyecto.ejecutado || 0) > 0 && hasAnyRole(['CINTERNO', 'CEXTERNO']) && (
              <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
                <Button label="Agregar Gasto" icon="pi pi-plus" onClick={() => setIsAddGastoModalVisible(true)} />
                <Button label="Modificar Monto Aprobado" icon="pi pi-pencil" onClick={() => setIsEditMontoModalVisible(true)} />
              </div>
            )}
            <DataTable
              value={gastos}
              header={header}
              loading={loading}
              paginator
              rows={10}
              globalFilter={globalFilter}
              emptyMessage="No hay gastos registrados para este proyecto."
              responsiveLayout="scroll"
            >
              <Column field="tipo_rubro_details.nombre_rubro" header="Tipo de Rubro" sortable />
              <Column field="nombre" header="Nombre" sortable />
              <Column field="costo" header="Costo" body={(rowData) => formatCurrency(rowData.costo)} sortable />
              <Column field="descripcion" header="Descripción" sortable />
              <Column header="Link" body={downloadBodyTemplate} />
              <Column header="Opciones" body={actionBodyTemplate} />
            </DataTable>
          </div>
          <div className="col-lg-3 col-md-3 col-sm-12">
            <Card title="Presupuesto" className="text-center h-100">
              <p><strong>Aprobado:</strong> {formatCurrency(montoProyecto.aprobado)}</p>
              <p><strong>Ejecutado:</strong> {formatCurrency(montoProyecto.ejecutado)}</p>
              <p><strong>Porcentaje Implementado:</strong> {porcentajeImplementado}%</p>
            </Card>
          </div>
        </div>
      )}
      <AddGastoModal
        visible={isAddGastoModalVisible}
        onHide={() => setIsAddGastoModalVisible(false)}
        proyectoId={proyectoId}
        montoId={montoProyecto?.id}
      />
      <EditMontoAprobadoModal
        visible={isEditMontoModalVisible}
        onHide={() => setIsEditMontoModalVisible(false)}
        monto={montoProyecto}
        proyectoId={proyectoId}
      />
      <ConfirmationModal
        visible={isDeleteDocConfirmVisible}
        onHide={() => setIsDeleteDocConfirmVisible(false)}
        onConfirm={handleConfirmDeleteDocPresupuesto}
        header="Confirmar Eliminación de Documento"
        loading={loading}
      >
        <p>¿Estás seguro de que quieres borrar el documento de presupuesto <strong>{docPresupuestoToDelete?.nombre}</strong>?</p>
      </ConfirmationModal>
      <ConfirmationModal
        visible={isDeleteEjecucionConfirmVisible}
        onHide={() => setIsDeleteEjecucionConfirmVisible(false)}
        onConfirm={handleConfirmDeleteEjecucion}
        header="Confirmar Eliminación de Gasto"
        loading={loading}
      >
        <p>¿Estás seguro de que quieres borrar el gasto <strong>{ejecucionToDelete?.nombre}</strong>?</p>
      </ConfirmationModal>
    </>
  );
};

export default GastosProyectoTable;