// src/domains/formal/components/proyectos/formatos/GenerarBorradorMenu.js
// Botón "Generar borrador" con la lista de formatos que tienen plantilla
// (.docx con marcadores). Para Control de Cambios pregunta primero a qué
// cambio corresponde.
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { descargarBorradorFormato, fetchTiposGenerables } from '../../../../../features/formatos/formatosSlice';
import { mostrarToast } from '../../../../../utils/notificador';
import SeleccionarControlCambiosModal from './SeleccionarControlCambiosModal';

const GenerarBorradorMenu = ({ proyectoId }) => {
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const { tiposGenerables } = useSelector((state) => state.formatos);
  const [generando, setGenerando] = useState(false);
  const [tipoControl, setTipoControl] = useState(null);

  useEffect(() => {
    dispatch(fetchTiposGenerables());
  }, [dispatch]);

  const generar = async (tipo) => {
    if (tipo.requiere_control_cambios) {
      setTipoControl(tipo.tipo_documento);
      return;
    }
    setGenerando(true);
    try {
      const nombre = await descargarBorradorFormato({ proyectoId, tipoDocumentoId: tipo.tipo_documento });
      mostrarToast({
        severity: 'success',
        summary: 'Borrador generado',
        detail: `${nombre}: complete lo que falte, fírmelo y cárguelo en PDF.`,
      });
    } catch (error) {
      let detalle = 'No fue posible generar el borrador.';
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const json = JSON.parse(await data.text());
          detalle = json.detail || Object.values(json).flat().join(' ') || detalle;
        } catch (e) { /* respuesta no JSON */ }
      }
      mostrarToast({ severity: 'error', summary: 'Error', detail: detalle });
    } finally {
      setGenerando(false);
    }
  };

  if (!tiposGenerables || tiposGenerables.length === 0) return null;

  const items = tiposGenerables.map((tipo) => ({
    label: tipo.nombre_documento,
    icon: 'pi pi-file-word',
    command: () => generar(tipo),
  }));

  return (
    <>
      <Menu model={items} popup ref={menuRef} />
      <Button
        label="Generar borrador"
        icon="pi pi-file-word"
        className="p-button-outlined"
        loading={generando}
        tooltip="Descarga el formato en Word ya diligenciado con los datos del proyecto"
        tooltipOptions={{ position: 'top' }}
        onClick={(e) => menuRef.current.toggle(e)}
      />
      <SeleccionarControlCambiosModal
        visible={!!tipoControl}
        onHide={() => setTipoControl(null)}
        proyectoId={proyectoId}
        tipoDocumentoId={tipoControl}
      />
    </>
  );
};

export default GenerarBorradorMenu;
