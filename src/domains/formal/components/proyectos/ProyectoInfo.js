// src/domains/formal/components/proyectos/ProyectoInfo.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { uploadProjectToGruplac, registrarActaCierre } from '../../../../features/proyectos/proyectosSlice';
import EditProjectDatesModal from './EditProjectDatesModal';
import CambiarEstadoAprobadoModal from './CambiarEstadoAprobadoModal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const ESTADO_SEVERITY = { APROBADO: 'success', NO_APROBADO: 'danger', SIN_CALIFICAR: 'warning' };


const ProyectoInfo = ({ proyecto }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.proyectos);
  const { roles } = useSelector((state) => state.auth);
  const [isEditDatesModalVisible, setIsEditDatesModalVisible] = useState(false);
  const [isEstadoModalVisible, setIsEstadoModalVisible] = useState(false);
  const [isConfirmActaCierreVisible, setIsConfirmActaCierreVisible] = useState(false);

  if (!proyecto) {
    return null;
  }

  const hasAnyRole = (requiredRoles) => requiredRoles.some((role) => roles.includes(role));

  // Calcular porcentaje de avance
  const calculatePercentage = (proj) => {
    if (!proj.fecha_inicio || !proj.fecha_fin) return 0;
    const startDate = new Date(proj.fecha_inicio);
    const endDate = new Date(proj.fecha_fin);
    const currentDate = new Date();
    if (currentDate < startDate) return 0;
    if (currentDate > endDate) return 100;
    const timeBetweenStartAndCurrent = currentDate.getTime() - startDate.getTime();
    const timeBetweenStartAndEnd = endDate.getTime() - startDate.getTime();
    return Math.min(100, Math.max(0, (timeBetweenStartAndCurrent / timeBetweenStartAndEnd) * 100)).toFixed(0);
  };

  const handleUploadToGruplac = () => dispatch(uploadProjectToGruplac(proyecto.id));

  const handleRegistrarActaCierre = () => {
    dispatch(registrarActaCierre(proyecto.id)).then((result) => {
      if (registrarActaCierre.fulfilled.match(result)) setIsConfirmActaCierreVisible(false);
    });
  };

  return (
    <>
      <Card title="Información General del Proyecto">
        <div className="text-center mb-4">
          <h1 className="mb-3">{proyecto.titulo}</h1>
          <div className="mb-3">
            <Tag severity={ESTADO_SEVERITY[proyecto.estado_aprobado] || 'info'} value={proyecto.estado_aprobado} />
            {proyecto.registro_acta_cierre && (
              <Tag className="ms-2" severity="secondary" value="CERRADO (Acta Registrada)" />
            )}
          </div>
          <div className="row justify-content-center g-2">
            {hasAnyRole(['CINTERNO', 'CEXTERNO']) && (
              <div className="col-auto">
                <Button
                  label="Editar Fechas de Cierre"
                  icon="pi pi-calendar-times"
                  className="p-button-primary"
                  onClick={() => setIsEditDatesModalVisible(true)}
                  disabled={proyecto.registro_acta_cierre}
                />
              </div>
            )}
            {hasAnyRole(['CINTERNO', 'CEXTERNO']) && !proyecto.gruplac && (
              <div className="col-auto">
                <Button label="Subir a GrupLAC" icon="pi pi-upload" className="p-button-info" onClick={handleUploadToGruplac} loading={loading} />
              </div>
            )}
            {proyecto.gruplac && (
              <div className="col-auto">
                <p className="fw-bold text-success">Proyecto Subido a GrupLAC</p>
              </div>
            )}
            {hasAnyRole(['CINTERNO', 'CEXTERNO']) && proyecto.estado_aprobado === 'APROBADO' && !proyecto.registro_acta_cierre && (
              <div className="col-auto">
                <Button label="Registrar Acta de Cierre" icon="pi pi-lock" className="p-button-danger" onClick={() => setIsConfirmActaCierreVisible(true)} />
              </div>
            )}
          </div>
        </div>
        <div className="row text-center mt-4">
          <div className="col-md-4"><strong>Inicio:</strong> <p>{proyecto.fecha_inicio}</p></div>
          <div className="col-md-4"><strong>Fin:</strong> <p>{proyecto.fecha_fin}</p></div>
          <div className="col-md-4"><strong>Porcentaje de Avance:</strong><br /><p>{calculatePercentage(proyecto)}%</p></div>
        </div>
      </Card>
      <EditProjectDatesModal visible={isEditDatesModalVisible} onHide={() => setIsEditDatesModalVisible(false)} proyecto={proyecto} />
      <CambiarEstadoAprobadoModal visible={isEstadoModalVisible} onHide={() => setIsEstadoModalVisible(false)} proyecto={proyecto} />
      <ConfirmationModal
        visible={isConfirmActaCierreVisible}
        onHide={() => setIsConfirmActaCierreVisible(false)}
        onConfirm={handleRegistrarActaCierre}
        header="Confirmar Registro de Acta de Cierre"
        loading={loading}
      >
        <p>¿Confirma registrar el acta de cierre del proyecto <strong>{proyecto.titulo}</strong>?</p>
        <p className="text-danger">
          Esta acción es <strong>irreversible</strong>: el proyecto se cerrará definitivamente (estado = inactivo) y no podrá volver a modificarse.
        </p>
      </ConfirmationModal>
    </>
  );
};

export default ProyectoInfo;