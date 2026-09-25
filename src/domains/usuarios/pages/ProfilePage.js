// src/domains/usuarios/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import axiosInstance from '../../../api/axiosInstance';
import { fetchGrados } from '../../../features/metadata/metadataSlice';
import { Link } from 'react-router-dom';

const CAMPOS_EDITABLES = ['grado', 'nombre', 'apellido', 'celular', 'cvlac'];


const ProfilePage = () => {
  const dispatch = useDispatch();
  const { grados } = useSelector((state) => state.metadata);

  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cargarPerfil = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('institucional/mi-perfil/');
      setProfileData(data);
      setFormData(data);
    } catch (err) {
      setError('No se pudieron cargar los datos del perfil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  useEffect(() => {
    if (grados.length === 0) {
      dispatch(fetchGrados());
    }
  }, [dispatch, grados.length]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(profileData);
    setError('');
    setIsEditMode(false);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = CAMPOS_EDITABLES.reduce((acc, campo) => {
        acc[campo] = formData[campo];
        return acc;
      }, {});
      const { data } = await axiosInstance.patch('institucional/mi-perfil/', payload);
      setProfileData(data);
      setFormData(data);
      setIsEditMode(false);
      setSuccessMsg('Datos actualizados correctamente.');
    } catch (err) {
      const detalle = err.response?.data;
      setError(
        detalle && typeof detalle === 'object'
          ? Object.values(detalle).flat().join(' ')
          : 'Error al guardar los cambios.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Cargando perfil...</div>;
  }

  if (error && !profileData) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <span>Mi Perfil</span>
      {!isEditMode && (
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info"
          onClick={() => setIsEditMode(true)}
        />
      )}
    </div>
  );

  return (
    <div className="container mt-5">
      <Card title={header}>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="p-fluid formgrid grid">
          <div className="field col-12 md:col-6">
            <label htmlFor="documento">Documento</label>
            <InputText id="documento" value={formData?.documento || ''} disabled />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="correo">Correo Institucional</label>
            <InputText id="correo" value={formData?.correo || ''} disabled />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="grado">Grado</label>
            <Dropdown
              inputId="grado"
              value={formData?.grado}
              options={grados}
              optionLabel="descripcion"
              optionValue="id"
              filter
              placeholder="Seleccione un grado"
              onChange={(e) => handleInputChange('grado', e.value)}
              disabled={!isEditMode}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="nombre">Nombres</label>
            <InputText
              id="nombre"
              value={formData?.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              disabled={!isEditMode}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="apellido">Apellidos</label>
            <InputText
              id="apellido"
              value={formData?.apellido || ''}
              onChange={(e) => handleInputChange('apellido', e.target.value)}
              disabled={!isEditMode}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="celular">Celular</label>
            <InputText
              id="celular"
              value={formData?.celular || ''}
              onChange={(e) => handleInputChange('celular', e.target.value)}
              disabled={!isEditMode}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="cvlac">CVLAC</label>
            <InputText
              id="cvlac"
              value={formData?.cvlac || ''}
              onChange={(e) => handleInputChange('cvlac', e.target.value)}
              disabled={!isEditMode}
              placeholder="No se encuentra disponible"
            />
          </div>
        </div>

        {isEditMode && (
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button label="Cancelar" className="p-button-secondary" onClick={handleCancel} disabled={saving} />
            <Button label="Guardar Cambios" className="p-button-success" onClick={handleSaveChanges} loading={saving} />
          </div>
        )}
        
        <div className="text-end mt-3">
          <Link to="/cambiar-password">Cambiar contraseña</Link>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;