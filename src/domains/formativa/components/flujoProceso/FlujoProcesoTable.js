// src/domains/formativa/components/flujoProceso/FlujoProcesoTable.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import {
  fetchFlujosProceso,
  fetchFlujosPorModalidad,
  fetchFlujoVigente,
  activarFlujoProceso,
  desactivarFlujoProceso,
  establecerFiltroModalidadFlujo,
  limpiarFiltrosFlujoProceso,
  limpiarFlujoVigente,
  limpiarErrorFlujoProceso,
} from '../../../../features/flujoProceso/flujoProcesoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const OPCIONES_ACTIVO = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false },
];


const FlujoProcesoTable = ({ onEdit }) => {
  const dispatch = useDispatch();
  const {
    items, total, loading, error, transicionandoId, modalidadFiltro, activoFiltro,
    flujoVigente, buscandoVigente,
  } = useSelector((state) => state.flujoProceso);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [itemATransicion, setItemATransicion] = useState(null);
  const [modalidadInput, setModalidadInput] = useState('');
  const [activoInput, setActivoInput] = useState(null);
  const [vigenteConsultado, setVigenteConsultado] = useState(false);

  const hayFiltroActivo = Boolean(modalidadFiltro);

  useEffect(() => {
    if (modalidadFiltro) {
      dispatch(fetchFlujosPorModalidad({ modalidadId: modalidadFiltro, activo: activoFiltro }));
    } else {
      dispatch(fetchFlujosProceso({ page: lazyParams.page, pageSize: lazyParams.rows }));
    }
  }, [dispatch, modalidadFiltro, activoFiltro, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const onBuscarPorModalidad = () => {
    dispatch(
      establecerFiltroModalidadFlujo({ modalidadId: modalidadInput.trim() || null, activo: activoInput })
    );
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const onVerVigente = () => {
    if (!modalidadInput.trim()) return;
    setVigenteConsultado(true);
    dispatch(fetchFlujoVigente(modalidadInput.trim()));
  };

  const onLimpiarFiltros = () => {
    dispatch(limpiarFiltrosFlujoProceso());
    dispatch(limpiarFlujoVigente());
    setModalidadInput('');
    setActivoInput(null);
    setVigenteConsultado(false);
    setLazyParams({ first: 0, rows: lazyParams.rows, page: 1 });
  };

  const activoTemplate = (rowData) => (
    <Tag value={rowData.activo ? 'Activo' : 'Inactivo'} severity={rowData.activo ? 'success' : 'danger'} />
  );

  const accionesTemplate = (rowData) => {
    const enTransicion = transicionandoId === rowData.id;
    return (
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => onEdit(rowData)}
          tooltip="Editar"
        />
        {rowData.activo ? (
          <Button
            icon="pi pi-ban"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => setItemATransicion({ ...rowData, accion: 'desactivar' })}
            loading={enTransicion}
            tooltip="Desactivar"
          />
        ) : (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => dispatch(activarFlujoProceso(rowData.id))}
            loading={enTransicion}
            tooltip="Activar"
          />
        )}
      </>
    );
  };

  const handleConfirmarDesactivar = () => {
    dispatch(desactivarFlujoProceso(itemATransicion.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setItemATransicion(null);
      }
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
        <div className="p-inputgroup" style={{ maxWidth: '14rem' }}>
          <InputText
            value={modalidadInput}
            onChange={(e) => {
              setModalidadInput(e.target.value);
              setVigenteConsultado(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && onBuscarPorModalidad()}
            placeholder="ID Modalidad"
          />
          <Button icon="pi pi-search" onClick={onBuscarPorModalidad} tooltip="Filtrar por modalidad" />
        </div>
        <Dropdown
          value={activoInput}
          options={OPCIONES_ACTIVO}
          onChange={(e) => setActivoInput(e.value)}
          placeholder="Estado"
          style={{ minWidth: '10rem' }}
          disabled={!modalidadInput.trim()}
        />
        <Button
          label="Ver vigente"
          icon="pi pi-eye"
          className="p-button-text p-button-sm"
          onClick={onVerVigente}
          disabled={!modalidadInput.trim()}
          tooltip="Consultar la versión de flujo vigente para esta modalidad"
        />
        {(hayFiltroActivo || vigenteConsultado) && (
          <Button
            label="Limpiar filtros"
            icon="pi pi-times"
            className="p-button-text p-button-sm"
            onClick={onLimpiarFiltros}
          />
        )}
      </div>
      {vigenteConsultado && (
        buscandoVigente ? (
          <Message severity="info" className="mb-3 w-full" text="Consultando la versión vigente..." />
        ) : flujoVigente ? (
          <Message
            severity="success"
            className="mb-3 w-full"
            text={
              `Versión vigente para la modalidad ${modalidadInput}: ${flujoVigente.nombre} v${flujoVigente.version}` +
              ` (vigente desde ${flujoVigente.fecha_vigencia_inicio}` +
              `${flujoVigente.fecha_vigencia_fin ? ` hasta ${flujoVigente.fecha_vigencia_fin}` : ''}).`
            }
          />
        ) : (
          <Message
            severity="warn"
            className="mb-3 w-full"
            text={`No hay ninguna versión de flujo vigente para la modalidad ${modalidadInput} en este momento.`}
          />
        )
      )}
      {error && (
        <Message
          severity="error"
          className="mb-3 w-full"
          text={error}
          onClick={() => dispatch(limpiarErrorFlujoProceso())}
        />
      )}
      <DataTable
        value={items}
        header={<h5 className="m-0">Flujos de Proceso</h5>}
        loading={loading}
        lazy={!hayFiltroActivo}
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={hayFiltroActivo ? undefined : total}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron flujos de proceso."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="nombre" header="Nombre" />
        <Column field="modalidad_nombre" header="Modalidad" />
        <Column field="version" header="Versión" />
        <Column field="tipo" header="Tipo" />
        <Column field="fecha_vigencia_inicio" header="Vigente Desde" />
        <Column field="fecha_vigencia_fin" header="Vigente Hasta" />
        <Column field="activo" header="Estado" body={activoTemplate} />
        <Column body={accionesTemplate} header="Acciones" style={{ width: '9rem' }} />
      </DataTable>
      <ConfirmationModal
        visible={Boolean(itemATransicion)}
        onHide={() => setItemATransicion(null)}
        onConfirm={handleConfirmarDesactivar}
        header="¿Desactivar flujo de proceso?"
        loading={transicionandoId === itemATransicion?.id}
      >
        Esta acción desactivará <strong>{itemATransicion?.nombre} v{itemATransicion?.version}</strong>.
        Los procesos formativos que ya lo usan no se ven afectados.
      </ConfirmationModal>
    </>
  );
};

export default FlujoProcesoTable;