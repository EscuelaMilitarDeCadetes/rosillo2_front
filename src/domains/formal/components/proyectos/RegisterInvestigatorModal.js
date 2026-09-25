// src/domains/formal/components/proyectos/RegisterInvestigatorModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { createInvestigadorCompleto } from '../../../../features/proyectos/investigadoresSlice';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const CAMPOS_OBLIGATORIOS = [
  'grado', 'nombre', 'apellido', 'documento', 'celular', 'correo', 'grupo', 'rolGrupo', 'rolInvestigador',
];


const RegisterInvestigatorModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { grados, grupos, rolesGrupo, rolesInvestigador } = useSelector((state) => state.metadata);
  const { loading, error } = useSelector((state) => state.investigadores);
  const [formData, setFormData] = useState({});
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFormData({});
      setValidationError('');
    }
  }, [visible]);

  useEffect(() => {
    if (visible && grados.length === 0) {
      dispatch(fetchMetadata());
    }
  }, [visible, dispatch, grados.length]);

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => !formData[campo]);
    if (faltantes.length > 0) {
      setValidationError('Todos los campos obligatorios deben ser llenados.');
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

  const handleConfirmRegister = () => {
    const payload = {
      proyecto: proyectoId,
      grado: formData.grado,
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: formData.documento,
      celular: formData.celular,
      correo: formData.correo,
      cvlac: formData.cvlac || undefined,
      grupo: formData.grupo,
      rol_grupo: formData.rolGrupo,
      rol_investigador: formData.rolInvestigador,
      vinculacion: formData.vinculacion ? formData.vinculacion.toISOString().split('T')[0] : undefined,
    };
    dispatch(createInvestigadorCompleto(payload)).then((result) => {
      if (createInvestigadorCompleto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Registrar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  const nombreGrado = grados.find((g) => g.id === formData.grado)?.descripcion;
  const nombreGrupo = grupos.find((g) => g.id === formData.grupo)?.nombre_grupo;
  const nombreRolGrupo = rolesGrupo.find((r) => r.id === formData.rolGrupo)?.cargo;
  const nombreRolInvestigador = rolesInvestigador.find((r) => r.id === formData.rolInvestigador)?.nombre_rol_investigador;

  return (
    <>
      <Dialog header="Registrar Nuevo Investigador Completo" visible={visible} style={{ width: '60vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12 md:col-6">
            <span className="p-float-label">
              <Dropdown inputId="grado" value={formData.grado} options={grados} onChange={(e) => handleInputChange(e, 'grado')} optionLabel="descripcion" optionValue="id" filter placeholder="Seleccione un Grado" />
              <label htmlFor="grado">Grado</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <InputText id="nombre" name="nombre" value={formData.nombre || ''} onChange={(e) => handleInputChange(e, 'nombre')} />
              <label htmlFor="nombre">Nombre</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <InputText id="apellido" name="apellido" value={formData.apellido || ''} onChange={(e) => handleInputChange(e, 'apellido')} />
              <label htmlFor="apellido">Apellido</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <InputText id="documento" name="documento" value={formData.documento || ''} onChange={(e) => handleInputChange(e, 'documento')} />
              <label htmlFor="documento">Documento</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <InputText id="celular" name="celular" value={formData.celular || ''} onChange={(e) => handleInputChange(e, 'celular')} />
              <label htmlFor="celular">Celular</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <InputText id="correo" name="correo" type="email" value={formData.correo || ''} onChange={(e) => handleInputChange(e, 'correo')} />
              <label htmlFor="correo">Correo Institucional</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <InputText id="cvlac" name="cvlac" value={formData.cvlac || ''} onChange={(e) => handleInputChange(e, 'cvlac')} />
              <label htmlFor="cvlac">CvLAC (opcional)</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Dropdown inputId="grupo" value={formData.grupo} options={grupos} onChange={(e) => handleInputChange(e, 'grupo')} optionLabel="nombre_grupo" optionValue="id" filter placeholder="Seleccione un Grupo" />
              <label htmlFor="grupo">Grupo de Investigación</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Dropdown inputId="rolGrupo" value={formData.rolGrupo} options={rolesGrupo} onChange={(e) => handleInputChange(e, 'rolGrupo')} optionLabel="cargo" optionValue="id" filter placeholder="Seleccione Rol en Equipo" />
              <label htmlFor="rolGrupo">Rol en el Equipo</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Dropdown inputId="rolInvestigador" value={formData.rolInvestigador} options={rolesInvestigador} onChange={(e) => handleInputChange(e, 'rolInvestigador')} optionLabel="nombre_rol_investigador" optionValue="id" filter placeholder="Seleccione Rol en Investigación" />
              <label htmlFor="rolInvestigador">Rol en la Investigación</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label mt-4">
              <Calendar inputId="vinculacion" value={formData.vinculacion} onChange={(e) => handleInputChange(e, 'vinculacion')} dateFormat="yy-mm-dd" />
              <label htmlFor="vinculacion">Fecha de Vinculación (opcional, hoy por defecto)</label>
            </span>
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </Dialog>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmRegister}
        header="Confirmar Registro de Investigador"
        loading={loading}
      >
        <h6>Resumen de datos del nuevo investigador:</h6>
        <ul>
          <li><strong>Grado:</strong> {nombreGrado || 'N/A'}</li>
          <li><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</li>
          <li><strong>Documento:</strong> {formData.documento}</li>
          <li><strong>Celular:</strong> {formData.celular}</li>
          <li><strong>Correo:</strong> {formData.correo}</li>
          {formData.cvlac && <li><strong>CvLAC:</strong> {formData.cvlac}</li>}
          <li><strong>Grupo de Investigación:</strong> {nombreGrupo || 'N/A'}</li>
          <li><strong>Rol en el Equipo:</strong> {nombreRolGrupo || 'N/A'}</li>
          <li><strong>Rol en la Investigación:</strong> {nombreRolInvestigador || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default RegisterInvestigatorModal;