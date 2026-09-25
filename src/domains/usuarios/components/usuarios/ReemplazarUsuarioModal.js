// src/domains/usuarios/components/usuarios/ReemplazarUsuarioModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { reemplazarUsuario } from '../../../../features/usuarios/usuarioLifecycleSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal.js';


const ReemplazarUsuarioModal = ({ visible, onHide, usuarioObjetivo }) => {
  const dispatch = useDispatch();
  const { grados, roles, facultades, grupos, rolesGrupo } = useSelector((state) => state.metadata);
  const { loading, error } = useSelector((state) => state.usuarioLifecycle);

  const [formData, setFormData] = useState({});
  const [rolPlataformaId, setRolPlataformaId] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!visible) {
      setFormData({});
      setRolPlataformaId(null);
      setValidationError('');
    }
  }, [visible]);

  const rolSeleccionado = useMemo(() => roles?.find((r) => r.id === rolPlataformaId) ?? null, [roles, rolPlataformaId]);
  const requiereFacultad = rolSeleccionado?.tipo_vinculacion === 'facultad';
  const requiereGrupo = rolSeleccionado?.tipo_vinculacion === 'grupo';

  const handleInputChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const validar = () => {
    const camposComunes = ['grado', 'nombre', 'apellido', 'documento', 'celular', 'correo'];
    for (const campo of camposComunes) {
      if (!formData[campo]) {
        setValidationError(`El campo '${campo}' es obligatorio.`);
        return false;
      }
    }
    if (requiereFacultad && (!formData.facultad || !formData.rolGrupo)) {
      setValidationError('El rol seleccionado requiere Facultad y Rol dentro de la facultad.');
      return false;
    }
    if (requiereGrupo && (!formData.grupo || !formData.rolGrupo)) {
      setValidationError('El rol seleccionado requiere Grupo y Rol dentro del grupo.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const construirPayload = () => {
    const payload = {
      usuario_id: usuarioObjetivo.usuario_id,
      grado_id: formData.grado,
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: formData.documento,
      celular: formData.celular,
      correo: formData.correo,
    };
    if (formData.cvlac) payload.cvlac = formData.cvlac;
    // rol_plataforma_id es OPCIONAL: si no se envía, el backend conserva el rol actual del usuario.
    if (rolPlataformaId) payload.rol_plataforma_id = rolPlataformaId;
    if (requiereFacultad) {
      payload.facultad_id = formData.facultad;
      payload.rol_grupo_id = formData.rolGrupo;
    }
    if (requiereGrupo) {
      payload.grupo_id = formData.grupo;
      payload.rol_grupo_id = formData.rolGrupo;
    }
    return payload;
  };

  const handleShowConfirmation = () => {
    if (!validar()) return;
    setIsConfirmVisible(true);
  };

  const handleConfirmar = () => {
    dispatch(reemplazarUsuario(construirPayload())).then((result) => {
      if (reemplazarUsuario.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Reemplazar" icon="pi pi-sync" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Reemplazar Persona del Usuario" visible={visible} style={{ width: '55vw' }} footer={footer} onHide={onHide}>
        {usuarioObjetivo && (
          <Message
            severity="info"
            className="mb-3 w-full"
            text={`La cuenta '${usuarioObjetivo.usuario_nombre}' se conserva. Actualmente pertenece a ${usuarioObjetivo.persona_nombre} ${usuarioObjetivo.persona_apellido}; se cerrará su vinculación y se creará una Persona nueva con los datos de abajo.`}
          />
        )}
        <div className="formgrid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="grado">Grado</label>
            <Dropdown id="grado" value={formData.grado} options={grados} onChange={(e) => handleInputChange(e, 'grado')} optionLabel="descripcion" optionValue="id" filter placeholder="Seleccione un Grado" />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="rolPlataforma">Rol de Plataforma (opcional — si se omite, conserva el actual)</label>
            <Dropdown id="rolPlataforma" value={rolPlataformaId} options={roles} onChange={(e) => setRolPlataformaId(e.value)} optionLabel="nombre_rol" optionValue="id" filter showClear placeholder="Conservar rol actual" />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" value={formData.nombre || ''} onChange={(e) => handleInputChange(e, 'nombre')} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="apellido">Apellido</label>
            <InputText id="apellido" value={formData.apellido || ''} onChange={(e) => handleInputChange(e, 'apellido')} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="documento">Documento</label>
            <InputText id="documento" value={formData.documento || ''} onChange={(e) => handleInputChange(e, 'documento')} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="celular">Celular</label>
            <InputText id="celular" value={formData.celular || ''} onChange={(e) => handleInputChange(e, 'celular')} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="correo">Correo</label>
            <InputText id="correo" type="email" value={formData.correo || ''} onChange={(e) => handleInputChange(e, 'correo')} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="cvlac">CvLAC (opcional)</label>
            <InputText id="cvlac" value={formData.cvlac || ''} onChange={(e) => handleInputChange(e, 'cvlac')} />
          </div>

          {requiereFacultad && (
            <>
              <div className="field col-12 md:col-6">
                <label htmlFor="facultad">Facultad</label>
                <Dropdown id="facultad" value={formData.facultad} options={facultades} onChange={(e) => handleInputChange(e, 'facultad')} optionLabel="nombre_facultad" optionValue="id" filter placeholder="Seleccione una Facultad" />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="rolGrupoFacultad">Rol dentro de la Facultad</label>
                <Dropdown id="rolGrupoFacultad" value={formData.rolGrupo} options={rolesGrupo} onChange={(e) => handleInputChange(e, 'rolGrupo')} optionLabel="cargo" optionValue="id" filter placeholder="Seleccione un Rol" />
              </div>
            </>
          )}
          {requiereGrupo && (
            <>
              <div className="field col-12 md:col-6">
                <label htmlFor="grupo">Grupo de Investigación</label>
                <Dropdown id="grupo" value={formData.grupo} options={grupos} onChange={(e) => handleInputChange(e, 'grupo')} optionLabel="nombre_grupo" optionValue="id" filter placeholder="Seleccione un Grupo" />
              </div>
              <div className="field col-12 md:col-6">
                <label htmlFor="rolGrupoGrupo">Rol dentro del Grupo</label>
                <Dropdown id="rolGrupoGrupo" value={formData.rolGrupo} options={rolesGrupo} onChange={(e) => handleInputChange(e, 'rolGrupo')} optionLabel="cargo" optionValue="id" filter placeholder="Seleccione un Rol" />
              </div>
            </>
          )}
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmar}
        header="Confirmar Reemplazo"
        loading={loading}
      >
        Se cerrará la vinculación actual de <strong>{usuarioObjetivo?.persona_nombre} {usuarioObjetivo?.persona_apellido}</strong> y
        se asignará a <strong>{formData.nombre} {formData.apellido}</strong> la cuenta <strong>{usuarioObjetivo?.usuario_nombre}</strong>.
        Esta acción no se puede deshacer automáticamente.
      </ConfirmationModal>
    </>
  );
};

export default ReemplazarUsuarioModal;