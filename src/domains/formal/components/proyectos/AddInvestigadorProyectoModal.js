// src/domains/formal/components/proyectos/AddInvestigadorProyectoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { addInvestigadorProyecto, fetchInvestigadoresPorProyecto } from '../../../../features/proyectos/investigadoresSlice';
import ListaAsignados from './ListaAsignados';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';


const AddInvestigadorProyectoModal = ({ visible, onHide, proyectoId, onRegisterNewInvestigator, mostrarAsignados = false }) => {
  const dispatch = useDispatch();
  const { rolesInvestigador, personasXGrupo } = useSelector((state) => state.metadata); // Asumiendo que metadataSlice carga personasXGrupo
  const { investigadores, loading, error } = useSelector((state) => state.investigadores);
  const [asignadosListos, setAsignadosListos] = useState(false);

  const [selectedPersonaXGrupo, setSelectedPersonaXGrupo] = useState(null);
  const [selectedRolInvestigador, setSelectedRolInvestigador] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  

  useEffect(() => {
    if (!visible) {
      setSelectedPersonaXGrupo(null);
      setSelectedRolInvestigador(null);
      setValidationError('');
    }
  }, [visible]);

  useEffect(() => {
    if (visible && rolesInvestigador.length === 0) {
      dispatch(fetchMetadata());
    }
  }, [visible, dispatch, rolesInvestigador.length]);

  useEffect(() => {
    if (!visible) { 
      setAsignadosListos(false); return; 
    }
    if (!mostrarAsignados || !proyectoId) return;
    let cancelado = false;
    dispatch(fetchInvestigadoresPorProyecto(proyectoId)).finally(() => {
      if (!cancelado) setAsignadosListos(true);
    });
    return () => { cancelado = true; };
  }, [visible, mostrarAsignados, proyectoId, dispatch]);

  const validateForm = () => {
    if (!selectedPersonaXGrupo || !selectedRolInvestigador) {
      setValidationError('Debe seleccionar un investigador y un rol.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleShowConfirmation = () => {
    if (validateForm()) {
      setIsConfirmVisible(true);
    }
  };

  const handleConfirmAdd = () => {
    const payload = {
      proyecto: proyectoId,
      persona_x_grupo: selectedPersonaXGrupo,
      rol_investigador: selectedRolInvestigador,
      estado: true,
    };
    dispatch(addInvestigadorProyecto(payload)).then((result) => {
      if (addInvestigadorProyecto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Agregar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  // Opciones para el dropdown de investigadores (PersonaXGrupo)
  const investigatorOptions = personasXGrupo
    .filter((pxg) => pxg.persona_nombre && pxg.estado !== false)
    .map((pxg) => ({
      label: `${pxg.persona_nombre} (${pxg.grupo_nombre || pxg.facultad_nombre || 'N/A'})`,
      value: pxg.id,
  }));

  return (
    <>
      <Dialog header="Agregar Investigador al Proyecto" visible={visible} style={{ width: '50vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid">
          {mostrarAsignados && (
            <ListaAsignados
              titulo="Investigadores ya asignados a este proyecto"
              cargando={!asignadosListos}
              items={investigadores.filter((i) => i.estado !== false)}
              vacio="Este proyecto aún no tiene investigadores."
              renderItem={(i) => <><strong>{i.persona_nombre_completo}</strong> – {i.rol_nombre}</>}
            />
          )}
          <div className="field mb-3">
            <label htmlFor="investigador">Escoger Investigador</label>
            <Dropdown inputId="investigador" value={selectedPersonaXGrupo} options={investigatorOptions} onChange={(e) => setSelectedPersonaXGrupo(e.value)} optionLabel="label" optionValue="value" filter placeholder="Buscar investigador por nombre" />
          </div>
          <div className="field mb-3">
            <label htmlFor="rolInvestigador">Rol Investigador</label>
            <Dropdown inputId="rolInvestigador" value={selectedRolInvestigador} options={rolesInvestigador} onChange={(e) => setSelectedRolInvestigador(e.value)} optionLabel="nombre_rol_investigador" optionValue="id" filter placeholder="Seleccione el rol del investigador" />
          </div>
          <div className="text-center mt-4">
            <p className="fw-bold">Si el investigador no aparece, regístrelo:</p>
            <Button label="Registrar Nuevo Investigador" icon="pi pi-user-plus" className="p-button-secondary" onClick={onRegisterNewInvestigator} />
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Investigador"
        loading={loading}
      >
        <h6>Resumen del investigador a agregar:</h6>
        <ul>
          <li><strong>Investigador:</strong> {personasXGrupo.find(pxg => pxg.id === selectedPersonaXGrupo)?.persona_nombre || 'N/A'}</li>
          <li><strong>Rol:</strong> {rolesInvestigador.find(ri => ri.id === selectedRolInvestigador)?.nombre_rol_investigador || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddInvestigadorProyectoModal;
