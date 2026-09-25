// src/domains/formal/components/proyectos/AddGastoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { addGasto } from '../../../../features/proyectos/gastoSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const AddGastoModal = ({ visible, onHide, proyectoId, montoId }) => {
  const dispatch = useDispatch();
  const { tiposRubro } = useSelector((state) => state.metadata); // Asumiendo que metadataSlice carga tiposRubro
  const { loading, error } = useSelector((state) => state.gastos);

  const [selectedTipoRubro, setSelectedTipoRubro] = useState(null);
  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedTipoRubro(null);
      setNombre('');
      setCosto(0);
      setDescripcion('');
      setFile(null);
      setValidationError('');
    }
  }, [visible]);

  const validateForm = () => {
    if (!selectedTipoRubro || !nombre || costo <= 0 || !file) {
      setValidationError('Todos los campos obligatorios (Tipo de Rubro, Nombre, Costo, Archivo) deben ser llenados.');
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
      proyectoId,
      data: {
        montoId,
        tipo_rubro: selectedTipoRubro,
        nombre,
        costo,
        descripcion,
        documento_file: file,
      },
    };
    dispatch(addGasto(payload)).then((result) => {
      if (addGasto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Cargar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Nuevo Gasto" visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="tipoRubro">Tipo de Rubro</label>
            <Dropdown inputId="tipoRubro" value={selectedTipoRubro} options={tiposRubro} onChange={(e) => setSelectedTipoRubro(e.value)} optionLabel="nombre_rubro" optionValue="id" filter placeholder="Seleccione un tipo de rubro" />
          </div>
          <div className="field mb-3">
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="field mb-3">
            <label htmlFor="costo">Costo</label>
            <InputNumber id="costo" value={costo} onValueChange={(e) => setCosto(e.value)} mode="currency" currency="COP" locale="es-CO" min={0} />
          </div>
          <div className="field mb-3">
            <label htmlFor="descripcion">Descripción</label>
            <InputTextarea id="descripcion" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="field mb-3">
            <label>Documento</label>
            <FileUpload name="doc" customUpload uploadHandler={(e) => setFile(e.files[0])} chooseLabel="Seleccionar" mode="basic" auto accept=".pdf,.doc,.docx" maxFileSize={10000000} />
            {file && <small className="p-text-secondary ms-2">{file.name}</small>}
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Gasto"
        loading={loading}
      >
        <h6>Resumen del gasto a agregar:</h6>
        <ul>
          <li><strong>Tipo de Rubro:</strong> {tiposRubro.find(tr => tr.id === selectedTipoRubro)?.nombre_rubro || 'N/A'}</li>
          <li><strong>Nombre:</strong> {nombre}</li>
          <li><strong>Costo:</strong> {costo.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</li>
          <li><strong>Descripción:</strong> {descripcion}</li>
          <li><strong>Documento:</strong> {file?.name || 'N/A'}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddGastoModal;
