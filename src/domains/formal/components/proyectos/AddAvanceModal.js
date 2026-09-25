// src/domains/formal/components/proyectos/AddAvanceModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { addAvance } from '../../../../features/proyectos/avanceSlice';
import {
  fetchObjetivoXPuntoPorObjetivo,
  limpiarObjetivoXPuntoPorObjetivo,
} from '../../../../features/proyectos/objetivosSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

/**
 *  1. Ofrece un único dropdown con las filas de
 *     objetivoXPunto ya cargadas, no dos catálogos independientes.
 *  2. Ya no aplica: el filtro ahora se hace sobre
 *     objetivoXPunto, no sobre objetivos sueltos.
 */
const AddAvanceModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { objetivos, objetivoXPuntoPorObjetivo, loading, error } = useSelector((state) => state.objetivos);

  const [selectedObjetivo, setSelectedObjetivo] = useState(null);
  const [selectedPuntoActivo, setSelectedPuntoActivo] = useState(null);
  const [descripcionAvance, setDescripcionAvance] = useState('');
  const [avance, setAvance] = useState(0);
  const [mesAvance, setMesAvance] = useState('');
  const [anioAvance, setAnioAvance] = useState(new Date().getFullYear());
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedObjetivo(null);
      setSelectedPuntoActivo(null);
      setDescripcionAvance('');
      setAvance(0);
      setMesAvance('');
      setAnioAvance(new Date().getFullYear());
      setValidationError('');
      dispatch(limpiarObjetivoXPuntoPorObjetivo());
    }
  }, [visible, dispatch]);

  // Al elegir un objetivo específico, cargamos SUS puntos de control vía
  // el endpoint real 'por-objetivo/'.
  useEffect(() => {
    if (selectedObjetivo) {
      dispatch(fetchObjetivoXPuntoPorObjetivo(selectedObjetivo));
      setSelectedPuntoActivo(null);
    }
  }, [dispatch, selectedObjetivo]);

  const objetivosOptions = (objetivos || [])
    .filter((o) => o.clase === 'ESPECIFICO' && o.estado)
    .map((o) => ({ label: o.objetivo, value: o.id }));

  const puntosActivos = (objetivoXPuntoPorObjetivo || []).filter((p) => p.estado);
  const puntoSeleccionado = puntosActivos.find((p) => p.id === selectedPuntoActivo);
  const puntoOptions = puntosActivos.map((p) => ({
    label: p.punto_control_control,
    value: p.id,
  }));

  const validateForm = () => {
    if (!selectedObjetivo || !selectedPuntoActivo || !descripcionAvance || avance <= 0 || !mesAvance || !anioAvance) {
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

  const handleConfirmAdd = () => {
    dispatch(
      addAvance({
        puntoControlId: puntoSeleccionado.punto_control,
        proyectoId,
        descripcion_avance: descripcionAvance,
        avance,
        mes_avance: mesAvance,
        anio_avance: anioAvance,
      })
    ).then((result) => {
      if (addAvance.fulfilled.match(result)) {
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

  const meses = [
    { label: 'Enero', value: 'ENERO' }, { label: 'Febrero', value: 'FEBRERO' }, { label: 'Marzo', value: 'MARZO' },
    { label: 'Abril', value: 'ABRIL' }, { label: 'Mayo', value: 'MAYO' }, { label: 'Junio', value: 'JUNIO' },
    { label: 'Julio', value: 'JULIO' }, { label: 'Agosto', value: 'AGOSTO' }, { label: 'Septiembre', value: 'SEPTIEMBRE' },
    { label: 'Octubre', value: 'OCTUBRE' }, { label: 'Noviembre', value: 'NOVIEMBRE' }, { label: 'Diciembre', value: 'DICIEMBRE' },
  ];

  return (
    <>
      <Dialog header="Agregar Avance a Punto de Control" visible={visible} style={{ width: '50vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid formgrid grid">
          <div className="field col-12">
            <label htmlFor="objetivoEspecifico">Objetivo Específico</label>
            <Dropdown inputId="objetivoEspecifico" value={selectedObjetivo} options={objetivosOptions} onChange={(e) => setSelectedObjetivo(e.value)} optionLabel="label" optionValue="value" filter placeholder="Seleccione un objetivo específico" />
          </div>
          <div className="field col-12">
            <label htmlFor="puntoActivo">Punto de Control</label>
            <Dropdown inputId="puntoActivo" value={selectedPuntoActivo} options={puntoOptions} onChange={(e) => setSelectedPuntoActivo(e.value)} optionLabel="label" optionValue="value" filter disabled={!selectedObjetivo} placeholder={selectedObjetivo ? 'Seleccione un punto de control' : 'Primero seleccione un objetivo'} />
          </div>
          <div className="field col-12">
            <label htmlFor="descripcionAvance">Descripción del Avance</label>
            <InputTextarea id="descripcionAvance" rows={3} value={descripcionAvance} onChange={(e) => setDescripcionAvance(e.target.value)} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="avance">Avance en %</label>
            <InputNumber id="avance" value={avance} onValueChange={(e) => setAvance(e.value)} min={0} max={100} suffix="%" />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="mesAvance">Mes de Avance</label>
            <Dropdown inputId="mesAvance" value={mesAvance} options={meses} onChange={(e) => setMesAvance(e.value)} optionLabel="label" optionValue="value" placeholder="Seleccione un mes" />
          </div>
          <div className="field col-12">
            <label htmlFor="anioAvance">Año del Avance</label>
            <InputNumber id="anioAvance" value={anioAvance} onValueChange={(e) => setAnioAvance(e.value)} mode="decimal" showButtons min={2000} max={new Date().getFullYear()} />
          </div>
        </div>
        {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </Dialog>
      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Avance"
        loading={loading}
      >
        <h6>Resumen del avance a agregar:</h6>
        <ul>
          <li><strong>Punto de control:</strong> {puntoSeleccionado?.punto_control_control}</li>
          <li><strong>Avance:</strong> {avance}%</li>
          <li><strong>Periodo:</strong> {mesAvance} {anioAvance}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddAvanceModal;