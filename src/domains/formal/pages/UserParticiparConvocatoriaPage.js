// src/domains/formal/pages/UserParticiparConvocatoriaPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchConvocatoria, createProyecto } from '../../../features/convocatorias/convocatoriasSlice';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const UserParticiparConvocatoriaPage = () => {
  const { id } = useParams(); // Obtener el ID de la convocatoria de la URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { convocatoriaActual, loading, error } = useSelector((state) => state.convocatorias);
  const [formData, setFormData] = useState({
    titulo: '',
    unidadEjecutora: '',
    lineaInvestigacion: '',
    financiado: false,
    valorSolicitado: 0,
    alianza: false,
    docProyecto: null,
    docCarta: null,
    docAlianza: null,
  });
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchConvocatoria(id));
  }, [dispatch, id]);

  const handleInputChange = (e, name) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileUpload = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.files[0] }));
  };

  const validateForm = () => {
    if (!formData.titulo || !formData.docProyecto) {
      setValidationError('El título del proyecto y el documento del proyecto son obligatorios.');
      return false;
    }
    if (!formData.unidadEjecutora || !formData.lineaInvestigacion) {
      setValidationError('La unidad ejecutora y la línea de investigación son obligatorias.');
      return false;
    }
    if (formData.financiado && (!formData.valorSolicitado || formData.valorSolicitado <= 0)) {
      setValidationError('Si el proyecto es financiado, debe indicar el valor solicitado.');
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
    dispatch(createProyecto({ convocatoriaId: id, data: formData })).then((result) => {
      if (createProyecto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        navigate('/mis-proyectos');
      }
    });
  };

  const formatApiError = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err.detail) return err.detail;
    return Object.entries(err)
      .map(([campo, mensajes]) => {
        const texto = Array.isArray(mensajes) ? mensajes.join(' ') : mensajes;
        return `${campo}: ${texto}`;
      })
      .join(' | ');
  };

  const header = <h2>Participar en Convocatoria: {convocatoriaActual?.nombre_convocatoria}</h2>;

  if (loading && !convocatoriaActual) {
    return <div className="container mt-5 text-center"><ProgressSpinner /></div>;
  }

  return (
    <div className="container mt-5">
      <Card title={header}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12">
            <span className="p-float-label">
              <InputText id="titulo" value={formData.titulo} onChange={(e) => handleInputChange(e, 'titulo')} required />
              <label htmlFor="titulo">Título del Proyecto</label>
            </span>
          </div>
          <div className="field col-6">
            <span className="p-float-label">
              <InputText
                id="unidadEjecutora"
                value={formData.unidadEjecutora}
                onChange={(e) => handleInputChange(e, 'unidadEjecutora')}
                maxLength={10}
                required
              />
              <label htmlFor="unidadEjecutora">Unidad Ejecutora</label>
            </span>
            <small className="p-text-secondary">{formData.unidadEjecutora.length}/10 caracteres</small>
          </div>
          <div className="field col-6">
            <span className="p-float-label">
              <InputText
                id="lineaInvestigacion"
                value={formData.lineaInvestigacion}
                onChange={(e) => handleInputChange(e, 'lineaInvestigacion')}
                maxLength={100}
                required
              />
              <label htmlFor="lineaInvestigacion">Línea de Investigación</label>
            </span>
            <small className="p-text-secondary">{formData.lineaInvestigacion.length}/100 caracteres</small>
          </div>
          <div className="field col-6 flex align-items-center">
            <Checkbox
              inputId="alianza"
              checked={formData.alianza}
              onChange={(e) => setFormData((prev) => ({ ...prev, alianza: e.checked }))}
            />
            <label htmlFor="alianza" className="ms-2">¿Es un proyecto en alianza?</label>
          </div>
          <div className="field col-6 flex align-items-center">
            <Checkbox
              inputId="financiado"
              checked={formData.financiado}
              onChange={(e) => setFormData((prev) => ({ ...prev, financiado: e.checked, valorSolicitado: e.checked ? prev.valorSolicitado : 0 }))}
            />
            <label htmlFor="financiado" className="ms-2">¿Es un proyecto financiado?</label>
          </div>
          {formData.financiado && (
            <div className="field col-12">
              <span className="p-float-label">
                <InputNumber
                  id="valorSolicitado"
                  value={formData.valorSolicitado}
                  onValueChange={(e) => setFormData((prev) => ({ ...prev, valorSolicitado: e.value }))}
                  mode="currency"
                  currency="COP"
                  locale="es-CO"
                />
                <label htmlFor="valorSolicitado">Valor Solicitado</label>
              </span>
            </div>
          )}
          <div className="field col-12">
            <label htmlFor="docProyecto">Documento del Proyecto (obligatorio, solo PDF)</label>
            <FileUpload name="docProyecto" customUpload uploadHandler={(e) => handleFileUpload(e, 'docProyecto')} chooseLabel="Seleccionar Archivo" mode="basic" auto accept=".pdf" />
            {formData.docProyecto && <small className="p-text-secondary ms-2">{formData.docProyecto.name}</small>}
          </div>
          <div className="field col-12">
            <label htmlFor="docCarta">Carta de Compromiso (Opcional, solo PDF)</label>
            <FileUpload name="docCarta" customUpload uploadHandler={(e) => handleFileUpload(e, 'docCarta')} chooseLabel="Seleccionar Archivo" mode="basic" auto accept=".pdf" />
            {formData.docCarta && <small className="p-text-secondary ms-2">{formData.docCarta.name}</small>}
          </div>
          <div className="field col-12">
            <label htmlFor="docAlianza">Documento de Alianza (Opcional, solo PDF)</label>
            <FileUpload name="docAlianza" customUpload uploadHandler={(e) => handleFileUpload(e, 'docAlianza')} chooseLabel="Seleccionar Archivo" mode="basic" auto accept=".pdf" />
            {formData.docAlianza && <small className="p-text-secondary ms-2">{formData.docAlianza.name}</small>}
          </div>
        </div>
        {(validationError || error) && (
          <div className="alert alert-danger mt-3">{validationError || formatApiError(error)}</div>
        )}
        <div className="d-flex justify-content-end mt-4">
          <Button label="Participar" className="p-button-success" onClick={handleShowConfirmation} />
        </div>
      </Card>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmCreate}
        header="Confirmar Participación"
        loading={loading}
      >
        <h6>Resumen de la participación:</h6>
        <ul>
          <li><strong>Título del Proyecto:</strong> {formData.titulo}</li>
          <li><strong>Unidad Ejecutora:</strong> {formData.unidadEjecutora}</li>
          <li><strong>Línea de Investigación:</strong> {formData.lineaInvestigacion}</li>
          <li><strong>¿Alianza?:</strong> {formData.alianza ? 'Sí' : 'No'}</li>
          <li><strong>¿Financiado?:</strong> {formData.financiado ? 'Sí' : 'No'}</li>
          {formData.financiado && <li><strong>Valor Solicitado:</strong> {formData.valorSolicitado}</li>}
          <li><strong>Documento del Proyecto:</strong> {formData.docProyecto?.name || 'N/A'}</li>
          <li><strong>Carta de Compromiso:</strong> {formData.docCarta?.name || 'N/A'}</li>
          <li><strong>Documento de Alianza:</strong> {formData.docAlianza?.name || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </div>
  );
};

export default UserParticiparConvocatoriaPage;