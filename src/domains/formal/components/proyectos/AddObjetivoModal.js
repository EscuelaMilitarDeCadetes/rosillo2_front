// src/domains/formal/components/proyectos/AddObjetivoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import {
  createObjetivoGeneral,
  createObjetivoEspecifico,
  createPuntoControl,
  fetchObjetivosPorProyecto,
  fetchObjetivoXPuntoPorProyecto,
} from '../../../../features/proyectos/objetivosSlice';

const ListaPuntos = ({ puntos }) =>
  puntos.length === 0 ? (
    <small className="text-muted">Sin puntos de control registrados.</small>
  ) : (
    <ul className="mb-0 ps-3">
      {puntos.map((p) => (
        <li key={p.id}>
          {p.punto_control_control} <span className="badge bg-secondary">Peso {p.punto_control_peso}</span>
        </li>
      ))}
    </ul>
  );

const AddObjetivoModal = ({ visible, onHide, proyectoId }) => {
  const dispatch = useDispatch();
  const { objetivos, objetivoXPunto, loading, error } = useSelector((state) => state.objetivos);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [validationError, setValidationError] = useState('');

  // Tab 1: Objetivo General
  const [objetivoGeneralTexto, setObjetivoGeneralTexto] = useState('');

  // Tab 2: Objetivo Específico + Punto de Control (creados juntos)
  const [objetivoEspecificoTexto, setObjetivoEspecificoTexto] = useState('');
  const [controlNuevoTexto, setControlNuevoTexto] = useState('');
  const [pesoNuevo, setPesoNuevo] = useState(0);

  // Tab 3: Otro Punto de Control (para un objetivo específico ya existente)
  const [objetivoExistenteId, setObjetivoExistenteId] = useState(null);
  const [controlOtroTexto, setControlOtroTexto] = useState('');
  const [pesoOtro, setPesoOtro] = useState(0);

  const objetivoGeneral = objetivos.find((o) => o.clase === 'PRINCIPAL' && o.estado);
  const objetivoGeneralExiste = Boolean(objetivoGeneral);
  const objetivosEspecificos = objetivos.filter((o) => o.clase === 'ESPECIFICO' && o.estado);

  const puntosDe = (objetivoId) =>
    (Array.isArray(objetivoXPunto) ? objetivoXPunto : []).filter(
      (p) => p.objetivo === objetivoId && p.estado !== false
    );

  // Al abrir: cargar SIEMPRE lo del proyecto (evita ver datos de otro proyecto)
  useEffect(() => {
    if (!visible) {
      setObjetivoGeneralTexto('');
      setObjetivoEspecificoTexto('');
      setControlNuevoTexto('');
      setPesoNuevo(0);
      setObjetivoExistenteId(null);
      setControlOtroTexto('');
      setPesoOtro(0);
      setValidationError('');
      setCargandoInicial(true);
      return;
    }
    if (!proyectoId) return;

    let cancelado = false;
    setCargandoInicial(true);
    Promise.all([
      dispatch(fetchObjetivosPorProyecto(proyectoId)),
      dispatch(fetchObjetivoXPuntoPorProyecto(proyectoId)),
    ]).then(([resObjetivos]) => {
      if (cancelado) return;
      const lista = Array.isArray(resObjetivos.payload) ? resObjetivos.payload : [];
      const hayGeneral = lista.some((o) => o.clase === 'PRINCIPAL' && o.estado);
      setActiveIndex(hayGeneral ? 1 : 0);
      setCargandoInicial(false);
    });
    return () => { cancelado = true; };
  }, [visible, proyectoId, dispatch]);

  const handleSubmitObjetivoGeneral = () => {
    if (!objetivoGeneralTexto.trim()) {
      setValidationError('El objetivo general es obligatorio.');
      return;
    }
    setValidationError('');
    dispatch(
      createObjetivoGeneral({ proyecto: proyectoId, objetivo: objetivoGeneralTexto })
    ).then((result) => {
      if (createObjetivoGeneral.fulfilled.match(result)) onHide();
    });
  };

  const handleSubmitObjetivoEspecificoConControl = async () => {
    if (!objetivoEspecificoTexto.trim() || !controlNuevoTexto.trim() || !pesoNuevo) {
      setValidationError('Objetivo específico, punto de control y peso son obligatorios.');
      return;
    }
    setValidationError('');
    const resultadoObjetivo = await dispatch(
      createObjetivoEspecifico({ proyecto: proyectoId, objetivo: objetivoEspecificoTexto })
    );
    if (!createObjetivoEspecifico.fulfilled.match(resultadoObjetivo)) return;

    const nuevoObjetivoId = resultadoObjetivo.payload.id;
    const resultadoPunto = await dispatch(
      createPuntoControl({
        objetivo: nuevoObjetivoId,
        control: controlNuevoTexto,
        peso: pesoNuevo,
        proyectoId,
      })
    );
    if (createPuntoControl.fulfilled.match(resultadoPunto)) onHide();
  };

  const handleSubmitOtroPuntoControl = () => {
    if (!objetivoExistenteId || !controlOtroTexto.trim() || !pesoOtro) {
      setValidationError('Objetivo, punto de control y peso son obligatorios.');
      return;
    }
    setValidationError('');
    dispatch(
      createPuntoControl({
        objetivo: objetivoExistenteId,
        control: controlOtroTexto,
        peso: pesoOtro,
        proyectoId,
      })
    ).then((result) => {
      if (createPuntoControl.fulfilled.match(result)) onHide();
    });
  };

  return (
    <Dialog header="Agregar Objetivos" visible={visible} style={{ width: '55vw' }} onHide={onHide}>
      {cargandoInicial ? (
        <div className="text-center py-4">
          <i className="pi pi-spin pi-spinner me-2" />Cargando objetivos del proyecto…
        </div>
      ) : (
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Objetivo General">
            <div className="p-fluid">
              <div className="field mb-3">
                <label htmlFor="objetivoGeneral">Objetivo General</label>
                <InputTextarea
                  id="objetivoGeneral"
                  rows={4}
                  value={objetivoGeneralExiste ? objetivoGeneral.objetivo : objetivoGeneralTexto}
                  onChange={(e) => setObjetivoGeneralTexto(e.target.value)}
                  disabled={objetivoGeneralExiste}
                />
                {objetivoGeneralExiste && (
                  <small className="text-muted">Este proyecto ya tiene un objetivo general registrado.</small>
                )}
              </div>
              {!objetivoGeneralExiste && (
                <Button label="Registrar" icon="pi pi-check" onClick={handleSubmitObjetivoGeneral} loading={loading} />
              )}
            </div>
          </TabPanel>

          <TabPanel header="Objetivo Específico + Punto de Control" disabled={!objetivoGeneralExiste}>
            <div className="border rounded p-3 mb-3 bg-light">
              <h6 className="mb-2">
                Objetivos específicos ya registrados{' '}
                <span className="badge bg-secondary">{objetivosEspecificos.length}</span>
              </h6>
              {objetivosEspecificos.length === 0 ? (
                <small className="text-muted">Aún no hay objetivos específicos.</small>
              ) : (
                <div style={{ maxHeight: '12rem', overflowY: 'auto' }}>
                  {objetivosEspecificos.map((o) => (
                    <div key={o.id} className="mb-2">
                      <strong>{o.objetivo}</strong>
                      <ListaPuntos puntos={puntosDe(o.id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-fluid">
              <div className="field mb-3">
                <label htmlFor="objetivoEspecifico">Objetivo Específico</label>
                <InputTextarea id="objetivoEspecifico" rows={2} value={objetivoEspecificoTexto}
                  onChange={(e) => setObjetivoEspecificoTexto(e.target.value)} />
              </div>
              <div className="field mb-3">
                <label htmlFor="controlNuevo">Punto de Control</label>
                <InputTextarea id="controlNuevo" rows={2} value={controlNuevoTexto}
                  onChange={(e) => setControlNuevoTexto(e.target.value)} />
              </div>
              <div className="field mb-3">
                <label htmlFor="pesoNuevo">Peso</label>
                <InputNumber id="pesoNuevo" value={pesoNuevo} onValueChange={(e) => setPesoNuevo(e.value)} min={0} />
              </div>
              <Button label="Registrar" icon="pi pi-check" onClick={handleSubmitObjetivoEspecificoConControl} loading={loading} />
            </div>
          </TabPanel>

          <TabPanel header="Otro Punto de Control" disabled={objetivosEspecificos.length === 0}>
            <div className="p-fluid">
              <div className="field mb-3">
                <label htmlFor="objetivoExistente">Objetivo Específico</label>
                <Dropdown
                  inputId="objetivoExistente"
                  value={objetivoExistenteId}
                  options={objetivosEspecificos}
                  onChange={(e) => setObjetivoExistenteId(e.value)}
                  optionLabel="objetivo"
                  optionValue="id"
                  filter
                  placeholder="Seleccione un objetivo"
                />
              </div>
              {objetivoExistenteId && (
                <div className="border rounded p-3 mb-3 bg-light">
                  <h6 className="mb-2">Puntos de control ya registrados para este objetivo</h6>
                  <ListaPuntos puntos={puntosDe(objetivoExistenteId)} />
                </div>
              )}
              <div className="field mb-3">
                <label htmlFor="controlOtro">Punto de Control</label>
                <InputTextarea id="controlOtro" rows={2} value={controlOtroTexto}
                  onChange={(e) => setControlOtroTexto(e.target.value)} />
              </div>
              <div className="field mb-3">
                <label htmlFor="pesoOtro">Peso</label>
                <InputNumber id="pesoOtro" value={pesoOtro} onValueChange={(e) => setPesoOtro(e.value)} min={0} />
              </div>
              <Button label="Registrar" icon="pi pi-check" onClick={handleSubmitOtroPuntoControl} loading={loading} />
            </div>
          </TabPanel>
        </TabView>
      )}
      {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </Dialog>
  );
};

export default AddObjetivoModal;