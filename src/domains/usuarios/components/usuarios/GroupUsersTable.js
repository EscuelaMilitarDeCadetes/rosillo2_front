// src/domains/usuarios/components/usuarios/GroupUsersTable.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchGroupUsers, borrarPersonaDeGrupo } from "../../../../features/usuarios/personaGrupoSlice.js";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import ConfirmationModal from "../../../../components/common/ConfirmationModal.js";
import ReactivarVinculacionModal from "./ReactivarVinculacionModal";

/**
 * Tabla de personas vinculadas a Grupos/Facultades
 */
const GroupUsersTable = () => {
  const dispatch = useDispatch();
  const { groupUsers, groupUsersTotal, loading, error, rowLoading } = useSelector(
    (state) => state.personaGrupo
  );
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isReactivarModalVisible, setIsReactivarModalVisible] = useState(false);

  const cargarPagina = () => {
    dispatch(fetchGroupUsers({ page: lazyParams.page, pageSize: lazyParams.rows }));
  };

  useEffect(() => {
    cargarPagina();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, lazyParams.page, lazyParams.rows]);

  const onPage = (event) => {
    setLazyParams({ first: event.first, rows: event.rows, page: event.page + 1 });
  };

  const abrirConfirmacion = (row) => {
    setFilaSeleccionada(row);
    setIsConfirmVisible(true);
  };

  const handleConfirmBorrar = () => {
    if (!filaSeleccionada) return;
    dispatch(borrarPersonaDeGrupo(filaSeleccionada.id)).then((result) => {
      if (borrarPersonaDeGrupo.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        setFilaSeleccionada(null);
        cargarPagina();
      }
    });
  };

  const accionesTemplate = (row) => (
    <Button
      label="Borrar del Grupo"
      icon="pi pi-user-minus"
      className="p-button-danger p-button-sm"
      loading={!!rowLoading[row.id]}
      onClick={() => abrirConfirmacion(row)}
    />
  );

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Personas en Grupos y Facultades</h5>
      <Button
        label="Ver Historial / Reactivar"
        icon="pi pi-history"
        className="p-button-sm p-button-outlined"
        onClick={() => setIsReactivarModalVisible(true)}
      />
    </div>
  );

  return (
    <>
      {error && <Message severity="error" className="mb-3 w-full" text="No se pudieron cargar las personas vinculadas." />}
      <DataTable
        value={groupUsers}
        header={header}
        loading={loading}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={groupUsersTotal}
        onPage={onPage}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="No se encontraron personas."
        responsiveLayout="scroll"
        dataKey="id"
      >
        <Column field="persona_nombre" header="Nombre" />
        <Column field="persona_documento" header="Documento" />
        <Column field="rol_grupo_nombre" header="Cargo" />
        <Column field="grupo_nombre" header="Grupo (sigla)" />
        <Column field="facultad_nombre" header="Facultad (abrev.)" />
        <Column field="vinculacion" header="Fecha de Vinculación" />
        <Column header="Acciones" body={accionesTemplate} />
      </DataTable>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => {
          setIsConfirmVisible(false);
          setFilaSeleccionada(null);
        }}
        onConfirm={handleConfirmBorrar}
        header="¿Borrar del grupo/facultad?"
        loading={filaSeleccionada ? !!rowLoading[filaSeleccionada.id] : false}
      >
        {filaSeleccionada && (
          <p className="mb-0">
            Se borrará (desvinculará) a <strong>{filaSeleccionada.persona_nombre}</strong> de{' '}
            {filaSeleccionada.grupo_nombre || filaSeleccionada.facultad_nombre}.
          </p>
        )}
      </ConfirmationModal>
      <ReactivarVinculacionModal
        visible={isReactivarModalVisible}
        onHide={() => setIsReactivarModalVisible(false)}
      />
    </>
  );
};

export default GroupUsersTable;