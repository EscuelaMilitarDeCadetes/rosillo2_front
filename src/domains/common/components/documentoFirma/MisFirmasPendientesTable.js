// src/domains/common/components/documentoFirma/MisFirmasPendientesTable.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { fetchFirmasPendientesPorUsuario } from '../../../../features/documentoFirmante/documentoFirmanteSlice';
import FirmarDocumentoModal from './FirmarDocumentoModal';

// usuarioId: si se recibe, consulta las firmas pendientes de ESE usuario en
// lugar de las propias. El propio backend decide si el solicitante tiene
// permiso para verlas (roles SOPORTE, CINTERNO, FACULTAD, GRUPO, CEXTERNO,
// o si es el mismo usuario), devolviendo 403 en caso contrario.
// soloLectura oculta el botón de firmar/rechazar (consulta administrativa).
const MisFirmasPendientesTable = ({ usuarioId, soloLectura = false }) => {
  const dispatch = useDispatch();
  const { pendientes, loadingPendientes, errorPendientes } = useSelector((state) => state.documentoFirmante);
  const { user } = useSelector((state) => state.auth);
  const [firmanteSeleccionado, setFirmanteSeleccionado] = useState(null);

  const idEfectivo = usuarioId ?? user?.id;

  useEffect(() => {
    if (idEfectivo) dispatch(fetchFirmasPendientesPorUsuario(idEfectivo));
  }, [dispatch, idEfectivo]);

  const documentoTemplate = (rowData) => rowData.documento_firma_hash ? `Documento (hash ${rowData.documento_firma_hash.slice(0, 10)}…)` : `Documento #${rowData.documento_firma}`;

  const accionesTemplate = (rowData) => (
    <Button label="Firmar / Rechazar" icon="pi pi-pencil" className="p-button-sm" onClick={() => setFirmanteSeleccionado(rowData)} />
  );

  return (
    <>
      {errorPendientes && <Message severity="error" className="mb-3 w-full" text={errorPendientes} />}
      <DataTable
        value={pendientes}
        loading={loadingPendientes}
        emptyMessage={soloLectura ? 'Este usuario no tiene firmas pendientes.' : 'No tiene documentos pendientes de firma.'}
        responsiveLayout="scroll"
      >
        <Column header="Documento" body={documentoTemplate} />
        <Column header="Turno" body={(r) => `#${r.orden}`} style={{ width: '6rem' }} />
        <Column header="Estado" body={(r) => <Tag value={r.estado} severity="warning" />} />
        <Column field="fecha_creacion" header="Asignado el" body={(r) => new Date(r.fecha_creacion).toLocaleString('es-CO')} />
        {!soloLectura && <Column header="Acciones" body={accionesTemplate} />}
      </DataTable>
      {!soloLectura && (
        <FirmarDocumentoModal
          visible={!!firmanteSeleccionado}
          onHide={() => setFirmanteSeleccionado(null)}
          firmante={firmanteSeleccionado}
        />
      )}
    </>
  );
};

export default MisFirmasPendientesTable;