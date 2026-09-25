// src/domains/integracion/components/vinculacionFacultad/CrearUsuarioFacultadModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchCatalogo } from '../../../../features/catalogos/catalogosSlice';

const ESTADO_INICIAL = {
  nombre: '',
  apellido: '',
  documento: '',
  celular: '',
  correo: '',
  cvlac: '',
  grado_id: null,
  rol_grupo_id: null,
};

/**
 * Formulario genérico para los 3 endpoints de creación que puede ejecutar
 * el rol FACULTAD: crear-estudiante/, crear-jurado/ y crear-tutor/.
 *
 * Props:
 * - crearThunk: el thunk de vinculacionFacultadSlice a disparar
 *   (crearEstudianteFacultad / crearJuradoFacultad / crearTutorFacultad).
 *
 * facultad_id se precarga desde el propio usuario Facultad logueado
 * (state.auth.facultadId) y se deja de solo lectura.
 */
const CrearUsuarioFacultadModal = ({ visible, onHide, tipo, crearThunk, titulo }) => {
  const dispatch = useDispatch();
  const { saving, error, ultimoResultado } = useSelector((state) => state.vinculacionFacultad);
  const { facultadId } = useSelector((state) => state.auth);
  const { items: gradosEstudio, loading: cargandoGrados } = useSelector((state) => state.catalogos.grado_estudios);
  const { items: rolesGrupo, loading: cargandoRolesGrupo } = useSelector((state) => state.catalogos.rol_grupo);
  const { items: rolesPlataforma, loading: cargandoRolesPlataforma } = useSelector(
    (state) => state.catalogos.rol_plataforma
  );
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      dispatch(fetchCatalogo({ catalogKey: 'grado_estudios', pageSize: 100 }));
      dispatch(fetchCatalogo({ catalogKey: 'rol_grupo', pageSize: 100 }));
      dispatch(fetchCatalogo({ catalogKey: 'rol_plataforma', pageSize: 100 }));
      setFormData(ESTADO_INICIAL);
      setValidationError('');
    }
  }, [visible, dispatch]);

  const rolPlataforma = rolesPlataforma.find((r) => r.nombre_rol === tipo);
  const cargandoCatalogos = cargandoGrados || cargandoRolesGrupo || cargandoRolesPlataforma;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!facultadId) {
      setValidationError('Tu usuario no tiene una facultad asociada; no puedes crear usuarios de este tipo.');
      return false;
    }
    if (!rolPlataforma) {
      setValidationError(
        `No se encontró el rol de plataforma '${tipo}' en el catálogo. Contacta a Soporte antes de continuar.`
      );
      return false;
    }
    if (!formData.grado_id) {
      setValidationError('El grado de estudios es obligatorio.');
      return false;
    }
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setValidationError('El nombre y el apellido son obligatorios.');
      return false;
    }
    if (!formData.documento.trim()) {
      setValidationError('El documento de identidad es obligatorio.');
      return false;
    }
    if (!formData.celular.trim()) {
      setValidationError('El celular es obligatorio.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      setValidationError('El correo no tiene un formato válido.');
      return false;
    }
    if (!formData.rol_grupo_id) {
      setValidationError('El rol dentro de la facultad es obligatorio.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    dispatch(
      crearThunk({
        grado_id: formData.grado_id,
        nombre: formData.nombre,
        apellido: formData.apellido,
        documento: formData.documento,
        celular: formData.celular,
        correo: formData.correo,
        cvlac: formData.cvlac || undefined,
        rol_plataforma_id: rolPlataforma.id,
        facultad_id: facultadId,
        rol_grupo_id: formData.rol_grupo_id,
      })
    );
  };

  const handleCerrar = () => {
    onHide();
  };

  const footer = (
    <div>
      <Button label={ultimoResultado ? 'Cerrar' : 'Cancelar'} icon="pi pi-times" onClick={handleCerrar} className="p-button-text" />
      {!ultimoResultado && (
        <Button label="Crear" icon="pi pi-check" onClick={handleSubmit} loading={saving} autoFocus />
      )}
    </div>
  );

  return (
    <Dialog header={titulo} visible={visible} style={{ width: '40vw' }} footer={footer} onHide={handleCerrar}>
      {ultimoResultado ? (
        <div className="p-fluid">
          <Message severity="success" className="mb-3 w-full" text="Usuario creado correctamente." />
          <ul>
            <li>
              <strong>Nombre:</strong> {ultimoResultado.persona?.nombre} {ultimoResultado.persona?.apellido}
            </li>
            <li><strong>Documento:</strong> {ultimoResultado.persona?.documento}</li>
            <li><strong>Usuario:</strong> {ultimoResultado.usuario?.username}</li>
            <li><strong>Correo:</strong> {ultimoResultado.usuario?.email}</li>
          </ul>
          <Message
            severity="info"
            className="w-full"
            text="Las credenciales de acceso se enviaron automáticamente al correo registrado."
          />
        </div>
      ) : cargandoCatalogos ? (
        <div className="flex justify-content-center p-4">
          <ProgressSpinner style={{ width: '40px', height: '40px' }} />
        </div>
      ) : (
        <div className="p-fluid">
          <div className="formgrid grid">
            <div className="field mb-3 col">
              <label htmlFor="nombre">Nombre *</label>
              <InputText id="nombre" value={formData.nombre} maxLength={100} onChange={(e) => handleChange('nombre', e.target.value)} />
            </div>
            <div className="field mb-3 col">
              <label htmlFor="apellido">Apellido *</label>
              <InputText id="apellido" value={formData.apellido} maxLength={100} onChange={(e) => handleChange('apellido', e.target.value)} />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field mb-3 col">
              <label htmlFor="documento">Documento *</label>
              <InputText id="documento" value={formData.documento} maxLength={20} onChange={(e) => handleChange('documento', e.target.value)} />
            </div>
            <div className="field mb-3 col">
              <label htmlFor="grado_id">Grado de Estudios *</label>
              <Dropdown
                inputId="grado_id"
                value={formData.grado_id}
                options={gradosEstudio}
                optionLabel="descripcion"
                optionValue="id"
                filter
                onChange={(e) => handleChange('grado_id', e.value)}
                placeholder="Seleccione"
              />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field mb-3 col">
              <label htmlFor="celular">Celular *</label>
              <InputText id="celular" value={formData.celular} maxLength={20} onChange={(e) => handleChange('celular', e.target.value)} />
            </div>
            <div className="field mb-3 col">
              <label htmlFor="correo">Correo *</label>
              <InputText id="correo" value={formData.correo} maxLength={150} onChange={(e) => handleChange('correo', e.target.value)} />
            </div>
          </div>
          <div className="field mb-3">
            <label htmlFor="cvlac">CvLAC (opcional)</label>
            <InputText id="cvlac" value={formData.cvlac} maxLength={255} onChange={(e) => handleChange('cvlac', e.target.value)} />
          </div>
          <div className="formgrid grid">
            <div className="field mb-3 col">
              <label htmlFor="facultad">Facultad</label>
              <InputText id="facultad" value={facultadId ? `ID ${facultadId} (tu facultad)` : 'Sin facultad asociada'} disabled />
            </div>
            <div className="field mb-3 col">
              <label htmlFor="rol_grupo_id">Rol dentro de la Facultad *</label>
              <Dropdown
                inputId="rol_grupo_id"
                value={formData.rol_grupo_id}
                options={rolesGrupo}
                optionLabel="cargo"
                optionValue="id"
                filter
                onChange={(e) => handleChange('rol_grupo_id', e.value)}
                placeholder="Seleccione"
              />
            </div>
          </div>
          {validationError && <Message severity="error" className="mt-3 w-full" text={validationError} />}
          {error && <Message severity="error" className="mt-3 w-full" text={error} />}
        </div>
      )}
    </Dialog>
  );
};

export default CrearUsuarioFacultadModal;