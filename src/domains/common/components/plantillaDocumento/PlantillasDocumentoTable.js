// src/domains/common/components/plantillaDocumento/PlantillasDocumentoTable.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { 
  descargarPlantilla, 
  fetchPlantillas, 
  desactivarPlantilla } from '../../../../features/plantillaDocumento/plantillaDocumentoSlice';
import PlantillaDocumentoModal from './PlantillaDocumentoModal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

// Listado administrativo completo (CRUD -> list), con alta/edición y
// desactivación (soft delete, ya que el backend no expone destroy). Solo
// las acciones de escritura están gateadas a SOPORTE; list/retrieve son
// IsAuthenticated en el backend, pero mantener la administración en un solo
// lugar evita construir una segunda vista de "solo lectura" sin necesidad.
const PlantillasDocumentoTable = ({ puedeEditar }) => {
  const dispatch = useDispatch();
  const { items, total, loading, actioningId, actionError } = useSelector((state) => state.plantillaDocumento);
  const [page, setPage] = useState(1);
  const [rows] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [plantillaADesactivar, setPlantillaADesactivar] = useState(null);

  useEffect(() => {
    dispatch(fetchPlantillas({ page, pageSize: rows }));
  }, [dispatch, page, rows]);

  const abrirCrear = () => {
    setPlantillaEditando(null);
    setModalVisible(true);
  };

  const abrirEditar = (plantilla) => {
    setPlantillaEditando(plantilla);
    setModalVisible(true);
  };

  const descargarTemplate = (rowData) => (
    <Button
      icon="pi pi-download"
      className="p-button-sm p-button-info"
      tooltip="Descargar"
      onClick={() => dispatch(descargarPlantilla(rowData.id))}
    />
  );

  const handleConfirmarDesactivar = () => {
    dispatch(desactivarPlantilla(plantillaADesactivar.id)).then((result) => {
      if (desactivarPlantilla.fulfilled.match(result)) setPlantillaADesactivar(null);
    });
  };

  const estadoTemplate = (rowData) => (
    <Tag value={rowData.estado ? 'Activa' : 'Inactiva'} severity={rowData.estado ? 'success' : 'secondary'} />
  );

  const accionesTemplate = (rowData) =>
    puedeEditar && (
      <div className="d-flex gap-2">
        <Button icon="pi pi-pencil" className="p-button-sm p-button-secondary" tooltip="Editar" onClick={() => abrirEditar(rowData)} />
        {rowData.estado && (
          <Button
            icon="pi pi-ban"
            className="p-button-sm p-button-danger"
            tooltip="Desactivar"
            loading={actioningId === rowData.id}
            onClick={() => setPlantillaADesactivar(rowData)}
          />
        )}
      </div>
    );

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Plantillas de Documento</h5>
      {puedeEditar && <Button label="Nueva Plantilla" icon="pi pi-plus" className="p-button-sm" onClick={abrirCrear} />}
    </div>
  );

  return (
    <>
      {actionError && <Message severity="error" className="mb-3 w-full" text={actionError} />}
      <DataTable
        value={items}
        loading={loading}
        header={header}
        lazy
        paginator
        rows={rows}
        totalRecords={total}
        first={(page - 1) * rows}
        onPage={(e) => setPage(e.page + 1)}
        emptyMessage="No hay plantillas de documento registradas."
        responsiveLayout="scroll"
      >
        <Column field="tipo_documento_nombre" header="Tipo de Documento" />
        <Column field="ruta_documento" header="Archivo" />
        <Column header="Estado" body={estadoTemplate} field="estado" />
        <Column header="Descargar" body={descargarTemplate} style={{ width: '7rem' }} />
        {puedeEditar && <Column header="Acciones" body={accionesTemplate} style={{ width: '9rem' }} />}
      </DataTable>

      <PlantillaDocumentoModal visible={modalVisible} onHide={() => setModalVisible(false)} plantilla={plantillaEditando} />

      <ConfirmationModal
        visible={!!plantillaADesactivar}
        onHide={() => setPlantillaADesactivar(null)}
        onConfirm={handleConfirmarDesactivar}
        header="Desactivar Plantilla"
        loading={actioningId === plantillaADesactivar?.id}
      >
        <p>
          ¿Está seguro de que desea desactivar la plantilla de{' '}
          <strong>{plantillaADesactivar?.tipo_documento_nombre}</strong>? Dejará de aparecer como sugerencia al
          crear documentos de este tipo.
        </p>
      </ConfirmationModal>
    </>
  );
};

export default PlantillasDocumentoTable;