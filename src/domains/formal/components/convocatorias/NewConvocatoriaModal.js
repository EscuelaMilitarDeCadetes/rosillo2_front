// src/domains/formal/components/convocatorias/NewConvocatoriaModal.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { createConvocatoria } from '../../../../features/convocatorias/convocatoriasSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const NewConvocatoriaModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { adminLoading, adminError } = useSelector((state) => state.convocatorias);
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    nombre_convocatoria: '',
    anio_convocatoria: new Date().getFullYear(),
    inicio: null,
    cierre: null,
    estado: true, // Por defecto activa
    interno: true, // Se puede cambiar si hay convocatorias externas
    documento_file: null, // Para el archivo
  });
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFormData({
        nombre_convocatoria: '',
        anio_convocatoria: new Date().getFullYear(),
        inicio: null,
        cierre: null,
        estado: true,
        interno: false,
        documento_file: null,
      });
      setValidationError('');
    }
  }, [visible]);

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleDateChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.value }));
  };

  const handleFileUpload = (e) => {
    setFormData((prev) => ({ ...prev, documento_file: e.files[0] }));
  };

  const validateForm = () => {
    if (!formData.nombre_convocatoria || !formData.inicio || !formData.cierre || !formData.documento_file) {
      setValidationError('Todos los campos obligatorios (Nombre, Fechas, Documento) deben ser llenados.');
      return false;
    }
    if (formData.inicio && formData.cierre && formData.inicio > formData.cierre) {
      setValidationError('La fecha de cierre no puede ser anterior a la fecha de inicio.');
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

  const handleConfirmCreate = () => {
    const nombreCreado = formData.nombre_convocatoria;
    dispatch(createConvocatoria(formData)).then((result) => {
      setIsConfirmVisible(false);
      onHide(); // Llamar a onHide después de crear la convocatoria
      if (createConvocatoria.fulfilled.match(result)) {
        toast.current?.show({
          severity: 'success',
          summary: 'Convocatoria creada',
          detail: `Se registró la convocatoria "${nombreCreado}" correctamente.`,
          life: 5000,
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error al crear la convocatoria',
          detail: result.payload || 'Ocurrió un error inesperado.',
          life: 6000,
        });
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Crear" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  const getFormattedDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog header="Nueva Convocatoria" visible={visible} style={{ width: '50vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12">
            <span className="p-float-label">
              <InputText id="nombre_convocatoria" value={formData.nombre_convocatoria} onChange={(e) => handleInputChange(e, 'nombre_convocatoria')} required />
              <label htmlFor="nombre_convocatoria">Nombre de la Convocatoria</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label">
              <Calendar id="inicio" value={formData.inicio} onChange={(e) => handleDateChange(e, 'inicio')} dateFormat="yy-mm-dd" showIcon required />
              <label htmlFor="inicio">Fecha de Inicio</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label">
              <Calendar id="cierre" value={formData.cierre} onChange={(e) => handleDateChange(e, 'cierre')} dateFormat="yy-mm-dd" showIcon required />
              <label htmlFor="cierre">Fecha de Cierre</label>
            </span>
          </div>
          <div className="field col-12 md:col-6">
            <span className="p-float-label">
              <InputText id="anio_convocatoria" value={formData.anio_convocatoria} onChange={(e) => handleInputChange(e, 'anio_convocatoria')} keyfilter="int" required />
              <label htmlFor="anio_convocatoria">Año de la Convocatoria</label>
            </span>
          </div>
          <div className="field col-12">
            <label htmlFor="documento_file">Documento Principal de la Convocatoria</label>
            <FileUpload
              name="documento_file"
              customUpload
              uploadHandler={handleFileUpload}
              chooseLabel="Seleccionar Archivo"
              mode="basic"
              auto
              accept="application/pdf"
              maxFileSize={15000000}
            />
            {formData.documento_file && <small className="p-text-secondary ms-2">{formData.documento_file.name}</small>}
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {adminError && <div className="alert alert-danger mt-3">{adminError}</div>}
      </Dialog>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmCreate}
        header="Confirmar Creación de Convocatoria"
        loading={adminLoading}
      >
        <h6>Resumen de la nueva convocatoria:</h6>
        <ul>
          <li><strong>Nombre:</strong> {formData.nombre_convocatoria}</li>
          <li><strong>Año:</strong> {formData.anio_convocatoria}</li>
          <li><strong>Inicio:</strong> {getFormattedDate(formData.inicio)}</li>
          <li><strong>Cierre:</strong> {getFormattedDate(formData.cierre)}</li>
          <li><strong>Estado:</strong> {formData.estado ? 'Activa' : 'Inactiva'}</li>
          <li><strong>Tipo:</strong> {formData.interno ? 'Interna' : 'Externa'}</li>
          <li><strong>Documento:</strong> {formData.documento_file?.name || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default NewConvocatoriaModal;