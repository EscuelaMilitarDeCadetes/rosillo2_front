// src/domains/formal/components/proyectos/formatos/DatosPropuestaPanel.js
// Pestaña "Datos de la Propuesta" del proyecto:
//   1. Se sube el .docx de la propuesta (el mismo formato institucional que
//      luego se entrega en PDF).
//   2. El sistema extrae los datos y los muestra para revisión.
//   3. Al confirmar, los datos quedan en el proyecto y se reutilizan para
//      generar los borradores de Acta de Inicio, Control de Cambios, Acta de
//      Cierre e Informe Final (botón "Generar borrador" en Documentos).
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import useHasRole from '../../../../../hooks/useHasRole';
import {
  confirmarImportacionPropuesta,
  descartarImportacionPropuesta,
  fetchImportacionesPropuesta,
  limpiarResumenImportacion,
  subirPropuestaDocx,
} from '../../../../../features/formatos/formatosSlice';
import { fetchProyecto } from '../../../../../features/proyectos/proyectosSlice';
import { fetchObjetivosPorProyecto } from '../../../../../features/proyectos/objetivosSlice';
import RevisionPropuestaForm from './RevisionPropuestaForm';

// Coincide con ROLES_CREACION_OPERATIVA del backend (formatos_viewset.py)
const ROLES_PUEDEN_IMPORTAR = ['FACULTAD', 'GRUPO', 'CINTERNO', 'CEXTERNO'];

const fechaLegible = (iso) => (iso ? new Date(iso).toLocaleString('es-CO') : '');

const DatosPropuestaPanel = ({ proyectoId, tituloProyecto }) => {
  const dispatch = useDispatch();
  const puedeImportar = useHasRole(ROLES_PUEDEN_IMPORTAR);
  const { importaciones, loading, subiendo, confirmando, error, ultimoResumen } = useSelector(
    (state) => state.formatos
  );
  const [uploaderKey, setUploaderKey] = useState(0);

  useEffect(() => {
    if (proyectoId) dispatch(fetchImportacionesPropuesta(proyectoId));
    return () => dispatch(limpiarResumenImportacion());
  }, [dispatch, proyectoId]);

  const pendiente = useMemo(() => importaciones.find((i) => i.estado === 'PENDIENTE'), [importaciones]);
  const confirmada = useMemo(() => importaciones.find((i) => i.estado === 'CONFIRMADA'), [importaciones]);

  const subir = (e) => {
    const archivo = e.files?.[0];
    if (!archivo) return;
    dispatch(subirPropuestaDocx({ proyectoId, archivo })).finally(() => setUploaderKey((k) => k + 1));
  };

  const confirmar = (datos, reemplazarObjetivos) => {
    dispatch(
      confirmarImportacionPropuesta({ importacionId: pendiente.id, proyectoId, datos, reemplazarObjetivos })
    ).then((result) => {
      if (confirmarImportacionPropuesta.fulfilled.match(result)) {
        dispatch(fetchProyecto(proyectoId));
        dispatch(fetchObjetivosPorProyecto(proyectoId));
      }
    });
  };

  const descartar = () => dispatch(descartarImportacionPropuesta({ importacionId: pendiente.id, proyectoId }));

  const cargador = puedeImportar && (
    <div className="d-flex align-items-center gap-2">
      <FileUpload
        key={uploaderKey}
        mode="basic"
        name="archivo"
        accept=".docx"
        maxFileSize={15 * 1024 * 1024}
        customUpload
        auto
        uploadHandler={subir}
        chooseLabel={confirmada || pendiente ? 'Cargar otra versión (.docx)' : 'Cargar propuesta (.docx)'}
        disabled={subiendo}
      />
      {subiendo && <ProgressSpinner style={{ width: '28px', height: '28px' }} strokeWidth="6" />}
    </div>
  );

  if (loading && importaciones.length === 0) {
    return <div className="d-flex justify-content-center p-4"><ProgressSpinner /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
        <div style={{ maxWidth: '60rem' }}>
          <h5 className="mb-1">Datos de la propuesta</h5>
          <small className="p-text-secondary">
            Cargue el <strong>Formato Propuesta Proyecto I+D+i en Word (.docx)</strong>. Los datos que ya
            escribió (objetivos, equipo, riesgos, productos, cronograma, montos...) se reutilizan para llenar
            automáticamente el Acta de Inicio, el Control de Cambios, el Acta de Cierre y el Informe Final.
            El PDF firmado se sigue cargando en la pestaña Documentos.
          </small>
        </div>
        {cargador}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {ultimoResumen && (
        <div className="alert alert-success">
          <strong>Datos guardados en el proyecto.</strong> Objetivos: {ultimoResumen.objetivos}.
          {(ultimoResumen.advertencias || []).length > 0 && (
            <ul className="mb-0 mt-1">
              {ultimoResumen.advertencias.map((a) => <li key={a}>{a}</li>)}
            </ul>
          )}
          <div className="mt-1">
            Ya puede generar los borradores desde la pestaña <strong>Documentos</strong> (botón{' '}
            <i className="pi pi-file-word" />).
          </div>
        </div>
      )}

      {pendiente ? (
        <>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Tag value="Pendiente de revisión" severity="warning" />
            <small className="p-text-secondary">
              {pendiente.nombre_archivo} · cargado el {fechaLegible(pendiente.fecha_creacion)}
              {pendiente.creado_por_username ? ` por ${pendiente.creado_por_username}` : ''}
            </small>
          </div>
          {puedeImportar ? (
            <RevisionPropuestaForm
              datosIniciales={pendiente.datos_extraidos}
              objetivosRegistrados={pendiente.objetivos_registrados}
              tituloProyecto={tituloProyecto}
              confirmando={confirmando}
              onConfirmar={confirmar}
              onDescartar={descartar}
            />
          ) : (
            <div className="alert alert-info">Los responsables del proyecto deben revisar y confirmar estos datos.</div>
          )}
        </>
      ) : confirmada ? (
        <div className="d-flex align-items-center gap-2">
          <Tag value="Confirmada" severity="success" />
          <small className="p-text-secondary">
            {confirmada.nombre_archivo} · confirmada el {fechaLegible(confirmada.fecha_confirmacion)}
          </small>
        </div>
      ) : (
        <div className="alert alert-secondary">
          Aún no se ha cargado la propuesta en Word para este proyecto.
        </div>
      )}
    </div>
  );
};

export default DatosPropuestaPanel;
