// src/domains/formal/components/calificaciones/CalificacionForm.js
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import {
  fetchCalificacionesPorProyecto,
  calificarFase,
  finalizarCalificacion,
  limpiarErrorCalificar,
} from '../../../../features/calificaciones/calificacionSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';


const CalificacionForm = () => {
  const { id: aplicarId } = useParams(); // id de ProyectoXConvocatoria
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { roles } = useSelector((state) => state.auth);
  const { fases, loadingFases, errorFases, calificandoFaseId, errorCalificar, finalizandoCalificacion } = useSelector(
    (state) => state.calificaciones
  );

  const puedeCalificar = roles?.includes('CINTERNO');

  const [faseSeleccionada, setFaseSeleccionada] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [aprobado, setAprobado] = useState(true);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const puedeGestionar = roles?.includes('CINTERNO') || roles?.includes('CEXTERNO');
  const [isFinalizarModalVisible, setIsFinalizarModalVisible] = useState(false);
  const [aprobadoFinal, setAprobadoFinal] = useState(true);
  const [isConfirmFinalizarVisible, setIsConfirmFinalizarVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchCalificacionesPorProyecto(aplicarId));
  }, [dispatch, aplicarId]);

  const estadoGlobal = useMemo(() => {
    if (fases.length === 0) return null;
    const faseRechazada = fases.find((f) => f.observacion && f.aprobado === false);
    if (faseRechazada) {
      return { tipo: 'no_aprobado', fase: faseRechazada };
    }
    const todasAprobadas = fases.every((f) => f.observacion && f.aprobado === true);
    if (todasAprobadas) {
      return { tipo: 'aprobado' };
    }
    return { tipo: 'en_progreso' };
  }, [fases]);

  const handleSeleccionarFase = (fase) => {
    setFaseSeleccionada(fase);
    setObservacion('');
    setAprobado(true);
    dispatch(limpiarErrorCalificar());
  };

  const handlePedirConfirmacion = () => {
    if (!faseSeleccionada) return;
    setIsConfirmVisible(true);
  };

  const handleGuardar = () => {
    dispatch(
      calificarFase({
        calificacionId: faseSeleccionada.id,
        aprobado,
        observacion,
        aplicarId,
      })
    ).then((result) => {
      if (calificarFase.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        setFaseSeleccionada(null);
      }
    });
  };

  const estadoBodyTemplate = (rowData) => {
    if (!rowData.observacion) {
      return <Tag severity="secondary" value="SIN CALIFICAR" />;
    }
    return (
      <Tag
        severity={rowData.aprobado ? 'success' : 'danger'}
        value={rowData.aprobado ? 'APROBADO' : 'NO APROBADO'}
      />
    );
  };

  const faseBodyTemplate = (rowData) => (
    rowData.fase_nombre
  );

  const opcionBodyTemplate = (rowData) => {
    if (rowData.observacion) {
      return <span className="text-success">Ya calificado</span>;
    }
    if (!puedeCalificar) {
      return <span className="text-muted">Sin permiso</span>;
    }
    return (
      <Button
        label="Calificar"
        className="p-button-primary p-button-sm"
        disabled={!rowData.primer_sin_observacion}
        onClick={() => handleSeleccionarFase(rowData)}
      />
    );
  };

  if (loadingFases && fases.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <ProgressSpinner />
      </div>
    );
  }

  if (errorFases) {
    return <div className="container mt-5 alert alert-danger">{errorFases}</div>;
  }

  const proyectoTitulo = fases[0]?.aplicar_proyecto_titulo;
  const convocatoriaNombre = fases[0]?.aplicar_convocatoria_nombre;

  const handleConfirmarFinalizar = () => {
    dispatch(finalizarCalificacion({ aplicarId, aprobado: aprobadoFinal })).then((result) => {
      if (finalizarCalificacion.fulfilled.match(result)) {
        setIsConfirmFinalizarVisible(false);
        setIsFinalizarModalVisible(false);
      }
    });
  };

  return (
    <div className="container mt-5">
      <h3>CALIFICAR PROYECTO SELECCIONADO</h3>
      <h5 className="text-muted">Calificación</h5>
      <p>
        Señor usuario, en este módulo tiene la posibilidad de calificar el
        proyecto seleccionado. Recuerde que una vez el proyecto no sea
        aprobado, este no se podrá habilitar de nuevo.
      </p>
      {proyectoTitulo && (
        <p>
          <strong>Proyecto:</strong> {proyectoTitulo} &nbsp;|&nbsp;
          <strong> Convocatoria:</strong> {convocatoriaNombre}
        </p>
      )}

      {estadoGlobal?.tipo === 'no_aprobado' && (
        <Message
          severity="error"
          className="w-100 mb-3"
          text={`Proyecto NO APROBADO en la fase "${estadoGlobal.fase.fase_nombre}". El proceso de calificación quedó cerrado y no puede reabrirse.`}
        />
      )}
      {estadoGlobal?.tipo === 'en_progreso' && puedeGestionar && (
        <div className="d-flex justify-content-end mb-3">
          <Button
            label="Forzar Finalización de Calificación"
            icon="pi pi-flag-fill"
            className="p-button-secondary"
            onClick={() => setIsFinalizarModalVisible(true)}
          />
        </div>
      )}
      {estadoGlobal?.tipo === 'aprobado' && (
        <Message severity="success" className="w-100 mb-3" text="Proyecto APROBADO en todas las fases de calificación." />
      )}

      <div className="row">
        <div className="col-lg-8">
          <DataTable value={fases} loading={loadingFases} responsiveLayout="scroll">
            <Column field="fase_orden" header="Orden" style={{ width: '5rem' }} sortable />
            <Column header="Fase" body={faseBodyTemplate} />
            <Column header="Estado" body={estadoBodyTemplate} />
            <Column field="observacion" header="Observación calificación" />
            <Column header="Opción" body={opcionBodyTemplate} />
          </DataTable>
        </div>

        <div className="col-lg-4">
          {faseSeleccionada && (
            <Card
              title={`Calificar fase ${faseSeleccionada.fase_nombre}`}
              className="mt-3 mt-lg-0"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              {errorCalificar && (
                <Message
                  severity="error"
                  text={
                    typeof errorCalificar === 'string'
                      ? errorCalificar
                      : errorCalificar.observacion || 'Error al calificar la fase.'
                  }
                  className="mb-3 w-100"
                />
              )}
              <div className="p-fluid formgrid grid">
                <div className="field col-12">
                  <label htmlFor="observacion">Observación*</label>
                  <InputTextarea
                    id="observacion"
                    rows={4}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Realice la descripción de la calificación"
                  />
                </div>
                <div className="field col-12 d-flex align-items-center">
                  <InputSwitch checked={aprobado} onChange={(e) => setAprobado(e.value)} />
                  <label className="ms-3 mb-0">Aprobado</label>
                </div>
              </div>
              {!aprobado && (
                <Message
                  severity="warn"
                  className="w-100 mb-3"
                  text="Al rechazar esta fase, el proyecto quedará NO APROBADO de forma permanente."
                />
              )}
              <div className="d-flex justify-content-end gap-2">
                <Button label="Cancelar" className="p-button-text" onClick={() => setFaseSeleccionada(null)} />
                <Button
                  label="Guardar"
                  className="p-button-success"
                  disabled={!aprobado && !observacion.trim()}
                  onClick={handlePedirConfirmacion}
                />
              </div>
            </Card>
          )}
          <div className="mt-3">
            <Link to="/calificar" onClick={() => navigate('/calificar')}>
              Volver a página de proyectos
            </Link>
          </div>
        </div>
      </div>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleGuardar}
        header="Confirmar calificación"
        loading={calificandoFaseId === faseSeleccionada?.id}
      >
        <p>
          ¿Confirma que la fase <strong>{faseSeleccionada?.fase_nombre}</strong> queda{' '}
          <strong>{aprobado ? 'APROBADA' : 'NO APROBADA'}</strong>?
        </p>
        {!aprobado && (
          <p className="text-danger">
            Esta acción es irreversible: el proyecto quedará cerrado en estado NO APROBADO y las
            fases restantes no podrán calificarse.
          </p>
        )}
      </ConfirmationModal>
      <Dialog
        header="Forzar Finalización de Calificación"
        visible={isFinalizarModalVisible}
        style={{ width: '30vw' }}
        onHide={() => setIsFinalizarModalVisible(false)}
        footer={
          <div>
            <Button label="Cancelar" className="p-button-text" onClick={() => setIsFinalizarModalVisible(false)} />
            <Button label="Continuar" className="p-button-danger" onClick={() => setIsConfirmFinalizarVisible(true)} />
          </div>
        }
      >
        <Message
          severity="warn"
          className="w-100 mb-3"
          text="Esta acción cierra oficialmente el proceso de calificación de las 6 fases, sin importar su estado individual actual."
        />
        <div className="field col-12 d-flex align-items-center">
          <InputSwitch checked={aprobadoFinal} onChange={(e) => setAprobadoFinal(e.value)} />
          <label className="ms-3 mb-0">Proyecto queda Aprobado</label>
        </div>
      </Dialog>
      <ConfirmationModal
        visible={isConfirmFinalizarVisible}
        onHide={() => setIsConfirmFinalizarVisible(false)}
        onConfirm={handleConfirmarFinalizar}
        header="Confirmar Finalización de Calificación"
        loading={finalizandoCalificacion}
      >
        <p>
          ¿Confirma finalizar oficialmente la calificación de este proyecto como{' '}
          <strong>{aprobadoFinal ? 'APROBADO' : 'NO APROBADO'}</strong>?
        </p>
        <p className="text-danger">Esta acción es irreversible.</p>
      </ConfirmationModal>
    </div>
  );
};

export default CalificacionForm;