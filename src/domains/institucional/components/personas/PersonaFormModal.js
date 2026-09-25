// src/domains/institucional/components/personas/PersonaFormModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { crearPersona, actualizarPersona } from '../../../../features/personas/personasSlice';

const CAMPO_VACIO = { grado: null, nombre: '', apellido: '', documento: '', celular: '', correo: '', cvlac: '' };


const PersonaFormModal = ({ visible, onHide, persona }) => {
  const dispatch = useDispatch();
  const { grados } = useSelector((state) => state.metadata);
  const { saving, error } = useSelector((state) => state.personas);
  const [formData, setFormData] = useState(CAMPO_VACIO);
  const [erroresLocales, setErroresLocales] = useState({});

  const esEdicion = !!persona;

  useEffect(() => {
    if (visible) {
      setFormData(
        persona
          ? {
              grado: persona.grado,
              nombre: persona.nombre,
              apellido: persona.apellido,
              documento: persona.documento,
              celular: persona.celular,
              correo: persona.correo,
              cvlac: persona.cvlac || '',
            }
          : CAMPO_VACIO
      );
      setErroresLocales({});
    }
  }, [visible, persona]);

  const handleChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const validarLocal = () => {
    const errores = {};
    if (!formData.grado) errores.grado = 'El grado de estudios es obligatorio.';
    if (!formData.nombre?.trim()) errores.nombre = 'El nombre es obligatorio.';
    else if (formData.nombre.length > 80) errores.nombre = 'Máximo 80 caracteres.';
    if (!formData.apellido?.trim()) errores.apellido = 'El apellido es obligatorio.';
    else if (formData.apellido.length > 80) errores.apellido = 'Máximo 80 caracteres.';
    if (!formData.documento?.trim()) errores.documento = 'El documento es obligatorio.';
    else if (formData.documento.length > 20) errores.documento = 'Máximo 20 caracteres.';
    if (!formData.celular?.trim()) errores.celular = 'El celular es obligatorio.';
    else if (formData.celular.length > 20) errores.celular = 'Máximo 20 caracteres.';
    if (!formData.correo?.trim()) errores.correo = 'El correo es obligatorio.';
    else if (formData.correo.length > 150) errores.correo = 'Máximo 150 caracteres.';
    else if (!formData.correo.includes('@')) errores.correo = 'No es un correo electrónico válido.';
    if (formData.cvlac && formData.cvlac.length > 150) errores.cvlac = 'Máximo 150 caracteres.';
    setErroresLocales(errores);
    return Object.keys(errores).length === 0;
  };

  const handleGuardar = () => {
    if (!validarLocal()) return;
    const payload = { ...formData, cvlac: formData.cvlac || null };
    const accion = esEdicion ? actualizarPersona({ id: persona.id, ...payload }) : crearPersona(payload);
    dispatch(accion).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') onHide();
    });
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleGuardar} loading={saving} />
    </div>
  );

  return (
    <Dialog header={esEdicion ? 'Editar Persona' : 'Nueva Persona'} visible={visible} style={{ width: '45vw' }} footer={footer} onHide={onHide}>
      <div className="formgrid grid">
        <div className="field col-12 md:col-6">
          <label htmlFor="grado">Grado</label>
          <Dropdown
            id="grado"
            value={formData.grado}
            options={grados}
            onChange={(e) => handleChange(e, 'grado')}
            optionLabel="descripcion"
            optionValue="id"
            filter
            className={erroresLocales.grado ? 'p-invalid w-full' : 'w-full'}
            placeholder="Seleccione un Grado"
          />
          {erroresLocales.grado && <small className="p-error">{erroresLocales.grado}</small>}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="nombre">Nombre</label>
          <InputText id="nombre" value={formData.nombre} onChange={(e) => handleChange(e, 'nombre')} className={erroresLocales.nombre ? 'p-invalid w-full' : 'w-full'} />
          {erroresLocales.nombre && <small className="p-error">{erroresLocales.nombre}</small>}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="apellido">Apellido</label>
          <InputText id="apellido" value={formData.apellido} onChange={(e) => handleChange(e, 'apellido')} className={erroresLocales.apellido ? 'p-invalid w-full' : 'w-full'} />
          {erroresLocales.apellido && <small className="p-error">{erroresLocales.apellido}</small>}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="documento">Documento</label>
          <InputText id="documento" value={formData.documento} onChange={(e) => handleChange(e, 'documento')} className={erroresLocales.documento ? 'p-invalid w-full' : 'w-full'} />
          {erroresLocales.documento && <small className="p-error">{erroresLocales.documento}</small>}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="celular">Celular</label>
          <InputText id="celular" value={formData.celular} onChange={(e) => handleChange(e, 'celular')} className={erroresLocales.celular ? 'p-invalid w-full' : 'w-full'} />
          {erroresLocales.celular && <small className="p-error">{erroresLocales.celular}</small>}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="correo">Correo</label>
          <InputText id="correo" type="email" value={formData.correo} onChange={(e) => handleChange(e, 'correo')} className={erroresLocales.correo ? 'p-invalid w-full' : 'w-full'} />
          {erroresLocales.correo && <small className="p-error">{erroresLocales.correo}</small>}
        </div>
        <div className="field col-12">
          <label htmlFor="cvlac">CvLAC (opcional)</label>
          <InputText id="cvlac" value={formData.cvlac} onChange={(e) => handleChange(e, 'cvlac')} className={erroresLocales.cvlac ? 'p-invalid w-full' : 'w-full'} />
          {erroresLocales.cvlac && <small className="p-error">{erroresLocales.cvlac}</small>}
        </div>
      </div>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </Dialog>
  );
};

export default PersonaFormModal;