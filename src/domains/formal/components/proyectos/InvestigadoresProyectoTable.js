// src/domains/formal/components/proyectos/InvestigadoresProyectoTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import AddInvestigadorProyectoModal from './AddInvestigadorProyectoModal';
import RegisterInvestigatorModal from './RegisterInvestigatorModal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import {
  fetchInvestigadoresPorProyecto,
  deleteInvestigadorProyecto,
} from '../../../../features/proyectos/investigadoresSlice';

const ROLES_PUEDEN_AGREGAR = ['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO'];
const ROLES_PUEDEN_BORRAR = ['CINTERNO', 'CEXTERNO'];


const InvestigadoresProyectoTable = ({ proyectoId, readOnly = false }) => {
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.auth);
  const { investigadores, loading } = useSelector((state) => state.investigadores);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddInvestigatorModalVisible, setIsAddInvestigatorModalVisible] = useState(false);
  const [isRegisterNewInvestigatorModalVisible, setIsRegisterNewInvestigatorModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [investigatorToDelete, setInvestigatorToDelete] = useState(null);

  useEffect(() => {
    if (proyectoId) dispatch(fetchInvestigadoresPorProyecto(proyectoId));
  }, [dispatch, proyectoId]);

  const hasAnyRole = (requiredRoles) => requiredRoles.some((rol) => roles.includes(rol));

  const handleDeleteClick = (investigator) => {
    setInvestigatorToDelete(investigator);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (investigatorToDelete) {
      dispatch(
        deleteInvestigadorProyecto({ id: investigatorToDelete.id, proyectoId })
      ).then((result) => {
        if (deleteInvestigadorProyecto.fulfilled.match(result)) {
          setIsDeleteConfirmVisible(false);
        }
      });
    }
  };

  const actionBodyTemplate = (rowData) => {
    const canModify = hasAnyRole(ROLES_PUEDEN_BORRAR);
    return (
      <div className="d-flex gap-2">
        {canModify && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-sm"
            tooltip="Retirar Investigador"
            onClick={() => handleDeleteClick(rowData)}
          />
        )}
      </div>
    );
  };

  const activoBodyTemplate = (rowData) => (rowData.estado ? 'SI' : 'NO');

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">{readOnly ? 'Investigadores Asociados' : 'Investigadores Agregados'}</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  return (
    <>
      {!readOnly && (
        <div className="d-flex justify-content-end mb-3">
          {hasAnyRole(ROLES_PUEDEN_AGREGAR) && (
            <Button label="Agregar Investigador" icon="pi pi-plus" onClick={() => setIsAddInvestigatorModalVisible(true)} />
          )}
        </div>
      )}
      <DataTable
        value={investigadores}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No se encontraron investigadores vinculados a este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="persona_nombre_completo" header="Investigador" sortable />
        <Column field="rol_nombre" header="Rol" sortable />
        {readOnly ? (
          <Column header="Activo" body={activoBodyTemplate} />
        ) : (
          <Column header="Acciones" body={actionBodyTemplate} />
        )}
      </DataTable>
      {!readOnly && (
        <>
          <AddInvestigadorProyectoModal
            visible={isAddInvestigatorModalVisible}
            onHide={() => setIsAddInvestigatorModalVisible(false)}
            proyectoId={proyectoId}
            onRegisterNewInvestigator={() => {
              setIsAddInvestigatorModalVisible(false);
              setIsRegisterNewInvestigatorModalVisible(true);
            }}
          />
          <RegisterInvestigatorModal
            visible={isRegisterNewInvestigatorModalVisible}
            onHide={() => setIsRegisterNewInvestigatorModalVisible(false)}
            proyectoId={proyectoId}
          />
          <ConfirmationModal
            visible={isDeleteConfirmVisible}
            onHide={() => setIsDeleteConfirmVisible(false)}
            onConfirm={handleConfirmDelete}
            header="Confirmar Retiro del Investigador"
            loading={loading}
          >
            <p>
              ¿Estás seguro de que quieres retirar a{' '}
              <strong>{investigatorToDelete?.persona_nombre_completo}</strong> del proyecto?
            </p>
          </ConfirmationModal>
        </>
      )}
    </>
  );
};

export default InvestigadoresProyectoTable;