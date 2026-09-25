// src/domains/formal/components/proyectos/ObjetivosProyectoTable.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import AddAvanceModal from './AddAvanceModal';
import AddObjetivoModal from './AddObjetivoModal';
import EditObjetivoModal from './EditObjetivoModal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import {
  fetchObjetivosPorProyecto,
  fetchObjetivoXPuntoPorProyecto,
  eliminarObjetivo,
} from '../../../../features/proyectos/objetivosSlice';

const ROLES_PUEDEN_GESTIONAR_OBJETIVOS = ['CINTERNO', 'CEXTERNO'];
const ROLES_PUEDEN_AGREGAR_AVANCE = ['FACULTAD', 'GRUPO'];


const ObjetivosProyectoTable = ({ proyectoId, readOnly = false }) => {
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.auth);
  const { objetivos, objetivoXPunto, loading, deletingId } = useSelector((state) => state.objetivos);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddAvanceModalVisible, setIsAddAvanceModalVisible] = useState(false);
  const [isAddObjetivoModalVisible, setIsAddObjetivoModalVisible] = useState(false);
  const [objetivoAEditar, setObjetivoAEditar] = useState(null);
  const [objetivoAEliminar, setObjetivoAEliminar] = useState(null);

  const avancePonderadoTemplate = (rowData) => {
    const peso = rowData.punto_control_peso || 0;
    return `${((rowData.avance || 0) * peso / 100).toFixed(2)}%`;
  };

  const mesAnioTemplate = (rowData) => `${rowData.mes_avance} ${rowData.anio_avance}`;

  useEffect(() => {
    if (proyectoId) {
      dispatch(fetchObjetivosPorProyecto(proyectoId));
      dispatch(fetchObjetivoXPuntoPorProyecto(proyectoId));
    }
  }, [dispatch, proyectoId]);

  const hasAnyRole = (requiredRoles) => requiredRoles.some((rol) => roles.includes(rol));
  const puedeGestionar = !readOnly && hasAnyRole(ROLES_PUEDEN_GESTIONAR_OBJETIVOS);
  const puedeAgregarAvance = hasAnyRole(ROLES_PUEDEN_AGREGAR_AVANCE);

  const objetivoGeneral = objetivos.find((o) => o.clase === 'PRINCIPAL' && o.estado);
  const objetivosEspecificos = objetivos.filter((o) => o.clase === 'ESPECIFICO' && o.estado);

  const puntosPorObjetivo = (objetivoId) =>
    objetivoXPunto.filter((p) => p.objetivo === objetivoId);

  const calcularPromedioPorObjetivo = (puntos) => {
    if (!puntos || puntos.length === 0) return 0;
    const suma = puntos.reduce((sum, p) => sum + (p.avance || 0), 0);
    return (suma / puntos.length).toFixed(2);
  };

  const promedioAvanceBodyTemplate = (rowData) =>
    `${calcularPromedioPorObjetivo(puntosPorObjetivo(rowData.objetivo))}%`;

  const handleConfirmarEliminar = () => {
    dispatch(eliminarObjetivo({ id: objetivoAEliminar.id, proyectoId })).then((result) => {
      if (eliminarObjetivo.fulfilled.match(result)) setObjetivoAEliminar(null);
    });
  };

  const accionesObjetivoTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text p-button-warning"
        onClick={() => setObjetivoAEditar(rowData)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => setObjetivoAEliminar(rowData)}
        tooltip="Eliminar"
      />
    </>
  );

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="m-0">Seguimiento de Puntos de Control</h5>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  return (
    <>
      <Card title="Objetivo General" className="mb-4">
        {objetivoGeneral ? (
          <div className="d-flex justify-content-between align-items-start">
            <p className="mb-0">{objetivoGeneral.objetivo}</p>
          </div>
        ) : (
          <p className="text-muted mb-0">Este proyecto aún no tiene un objetivo general registrado.</p>
        )}
      </Card>

      <Card title="Objetivos Específicos" className="mb-4">
        <DataTable
          value={objetivosEspecificos}
          emptyMessage="Este proyecto aún no tiene objetivos específicos registrados."
          responsiveLayout="scroll"
          dataKey="id"
        >
          <Column field="objetivo" header="Objetivo Específico" />
        </DataTable>
      </Card>

      <div className="d-flex justify-content-end mb-3 gap-2">
        {puedeGestionar && (
          <Button label="Agregar Objetivo" icon="pi pi-plus" onClick={() => setIsAddObjetivoModalVisible(true)} />
        )}
        {puedeAgregarAvance && (
          <Button label="Agregar Avance" icon="pi pi-chart-line" className="p-button-secondary" onClick={() => setIsAddAvanceModalVisible(true)} />
        )}
      </div>
      <DataTable
        value={objetivoXPunto}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No hay puntos de control definidos para este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="id" header="Id" sortable />
        <Column field="objetivo_texto" header="Objetivo Específico" sortable />
        <Column field="punto_control_control" header="Punto de Control" sortable />
        <Column field="descripcion_avance" header="Descripción del Avance" />
        <Column header="Mes/Año" body={mesAnioTemplate} sortable field="anio_avance" />
        <Column field="avance" header="Avance (%)" body={(r) => `${r.avance}%`} sortable />
        <Column header="Promedio x Objetivo (%)" body={promedioAvanceBodyTemplate} />
        <Column field="punto_control_peso" header="Peso x Punto de Control (%)" body={(r) => r.punto_control_peso != null ? `${r.punto_control_peso}%` : 'N/A'} />
        <Column header="Avance Ponderado (%)" body={avancePonderadoTemplate} />
      </DataTable>
      <AddObjetivoModal
        visible={isAddObjetivoModalVisible}
        onHide={() => setIsAddObjetivoModalVisible(false)}
        proyectoId={proyectoId}
      />
      <AddAvanceModal
        visible={isAddAvanceModalVisible}
        onHide={() => setIsAddAvanceModalVisible(false)}
        proyectoId={proyectoId}
      />
      <EditObjetivoModal
        visible={Boolean(objetivoAEditar)}
        onHide={() => setObjetivoAEditar(null)}
        objetivo={objetivoAEditar}
        proyectoId={proyectoId}
      />
      <ConfirmationModal
        visible={Boolean(objetivoAEliminar)}
        onHide={() => setObjetivoAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
        header="¿Eliminar objetivo?"
        loading={Boolean(deletingId)}
      >
        Esta acción desactivará el objetivo{' '}
        <strong>{objetivoAEliminar?.clase === 'PRINCIPAL' ? 'general' : `"${objetivoAEliminar?.objetivo}"`}</strong>.
        No se elimina de forma permanente, pero dejará de aparecer en el seguimiento del proyecto.
      </ConfirmationModal>
    </>
  );
};

export default ObjetivosProyectoTable;