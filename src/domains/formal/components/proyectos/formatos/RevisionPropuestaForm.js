// src/domains/formal/components/proyectos/formatos/RevisionPropuestaForm.js
// Muestra lo que el sistema extrajo del .docx de la propuesta para que el
// usuario lo corrija ANTES de guardarlo en el proyecto.
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import ListaEditable from './ListaEditable';

const TIPOS_PROYECTO = [
  { label: 'Sin definir', value: '' },
  { label: 'Investigación Científica', value: 'INVESTIGACION_CIENTIFICA' },
  { label: 'Desarrollo Tecnológico', value: 'DESARROLLO_TECNOLOGICO' },
];
const ENFOQUES = [
  { label: '1. Supervivencia, protección y preservación del Soldado', value: 1 },
  { label: '2. TIC, comunicaciones y simulación', value: 2 },
  { label: '3. Sistemas, plataformas e infraestructura de movilidad', value: 3 },
  { label: '4. Procesos logísticos y desarrollo organizacional', value: 4 },
  { label: '5. Sistemas de armamento y misiles', value: 5 },
  { label: '6. Otro enfoque', value: 6 },
];
const OPCIONES_ETICA = [
  { label: 'Sin definir', value: null },
  { label: 'Sí', value: true },
  { label: 'No', value: false },
];

const LISTAS = {
  objetivos_especificos: 'objetivo',
  equipo: 'nombre',
  riesgos: 'descripcion',
  productos: 'producto',
  cronograma: 'nombre',
  integrantes_externos: 'nombre',
  fuentes: 'nombre',
};

// Quita las filas que el usuario dejó completamente vacías.
const limpiar = (datos) => {
  const copia = { ...datos };
  Object.entries(LISTAS).forEach(([lista]) => {
    copia[lista] = (copia[lista] || []).filter((fila) =>
      Object.values(fila).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
    );
  });
  delete copia.advertencias;
  return copia;
};

const RevisionPropuestaForm = ({
  datosIniciales, objetivosRegistrados = 0, tituloProyecto, confirmando, onConfirmar, onDescartar,
}) => {
  const [datos, setDatos] = useState({});
  const [reemplazarObjetivos, setReemplazarObjetivos] = useState(false);

  useEffect(() => {
    setDatos({
      integrantes_externos: [],
      fuentes: [],
      ...(datosIniciales || {}),
    });
    setReemplazarObjetivos(false);
  }, [datosIniciales]);

  const set = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }));
  const setEntidad = (campo, valor) =>
    setDatos((d) => ({ ...d, entidad_participante: { ...(d.entidad_participante || {}), [campo]: valor } }));

  const texto = (campo, etiqueta, { filas = 0, col = 'col-12', ayuda } = {}) => (
    <div className={`field ${col}`}>
      <label htmlFor={campo}>{etiqueta}</label>
      {filas ? (
        <InputTextarea id={campo} value={datos[campo] || ''} rows={filas} autoResize
          onChange={(e) => set(campo, e.target.value)} />
      ) : (
        <InputText id={campo} value={datos[campo] || ''} onChange={(e) => set(campo, e.target.value)} />
      )}
      {ayuda && <small className="p-text-secondary">{ayuda}</small>}
    </div>
  );

  const moneda = (campo, etiqueta) => (
    <div className="field col-12 md:col-4">
      <label htmlFor={campo}>{etiqueta}</label>
      <InputNumber inputId={campo} value={datos[campo] ?? null} mode="currency" currency="COP" locale="es-CO"
        minFractionDigits={0} onValueChange={(e) => set(campo, e.value)} />
    </div>
  );

  const entidad = datos.entidad_participante || {};
  const campoEntidad = (campo, etiqueta, col = 'col-12 md:col-6') => (
    <div className={`field ${col}`}>
      <label htmlFor={`entidad_${campo}`}>{etiqueta}</label>
      <InputText id={`entidad_${campo}`} value={entidad[campo] || ''} onChange={(e) => setEntidad(campo, e.target.value)} />
    </div>
  );

  const tituloDistinto = datos.titulo && tituloProyecto
    && datos.titulo.trim().toLowerCase() !== tituloProyecto.trim().toLowerCase();

  return (
    <div>
      {(datosIniciales?.advertencias || []).length > 0 && (
        <div className="alert alert-warning">
          <strong>Revise:</strong>
          <ul className="mb-0">
            {datosIniciales.advertencias.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      )}
      {tituloDistinto && (
        <div className="alert alert-info">
          El título de la propuesta (<em>{datos.titulo}</em>) es distinto al registrado en el proyecto.
          El título del proyecto no se cambia desde aquí.
        </div>
      )}

      <Accordion multiple activeIndex={[0, 1]}>
        <AccordionTab header="Datos generales">
          <div className="p-fluid formgrid grid">
            {texto('convocatoria', 'Convocatoria', { col: 'col-12 md:col-6' })}
            <div className="field col-12 md:col-6">
              <label htmlFor="tipo_proyecto">Tipo de proyecto</label>
              <Dropdown inputId="tipo_proyecto" value={datos.tipo_proyecto || ''} options={TIPOS_PROYECTO}
                onChange={(e) => set('tipo_proyecto', e.value)} />
            </div>
            {texto('unidad_ejecutora', 'Unidad que presenta', { col: 'col-12 md:col-6' })}
            {texto('linea_investigacion', 'Línea de investigación', {
              col: 'col-12 md:col-6', ayuda: 'Solo se guarda si el proyecto aún no tiene línea registrada.',
            })}
            <div className="field col-12 md:col-4">
              <label htmlFor="duracion_meses">Duración (meses)</label>
              <InputNumber inputId="duracion_meses" value={datos.duracion_meses ?? null} min={0} max={240}
                onValueChange={(e) => set('duracion_meses', e.value)} />
            </div>
            {texto('palabras_clave', 'Palabras clave', { col: 'col-12 md:col-8' })}
            <div className="field col-12">
              <label htmlFor="enfoques">Enfoques de investigación</label>
              <MultiSelect inputId="enfoques" value={datos.enfoques || []} options={ENFOQUES} display="chip"
                onChange={(e) => set('enfoques', e.value)} />
            </div>
            {(datos.enfoques || []).includes(6) && texto('enfoque_otro', '¿Cuál otro enfoque?')}
            {texto('objetivo_estrategico', 'Objetivo(s) estratégico(s) de la Fuerza', { filas: 2 })}
            <div className="field col-12 md:col-4">
              <label htmlFor="requiere_comite_etica">¿Requiere comité de ética?</label>
              <Dropdown inputId="requiere_comite_etica" value={datos.requiere_comite_etica ?? null}
                options={OPCIONES_ETICA} onChange={(e) => set('requiere_comite_etica', e.value)} />
            </div>
            {datos.requiere_comite_etica && texto('comite_etica', 'Comité de ética que avala', { col: 'col-12 md:col-8' })}
          </div>
        </AccordionTab>

        <AccordionTab header="Montos">
          <div className="p-fluid formgrid grid">
            {moneda('monto_solicitado', 'Monto solicitado')}
            {moneda('contrapartida_dinero', 'Contrapartida en dinero')}
            {moneda('contrapartida_especie', 'Contrapartida en especie')}
          </div>
          <ListaEditable
            titulo="Fuentes de financiación (convenios)"
            filas={datos.fuentes || []}
            onChange={(v) => set('fuentes', v)}
            filaNueva={{ nombre: '', valor: '' }}
            columnas={[
              { campo: 'nombre', etiqueta: 'Convenio / fuente', ancho: 3 },
              { campo: 'valor', etiqueta: 'Valor', ancho: 1 },
            ]}
          />
        </AccordionTab>

        <AccordionTab header="Objetivos">
          <div className="p-fluid">
            {texto('objetivo_general', 'Objetivo general', { filas: 2 })}
          </div>
          <ListaEditable
            titulo="Objetivos específicos"
            ayuda="El entregable de cada objetivo se usa en el Acta de Inicio."
            filas={datos.objetivos_especificos || []}
            onChange={(v) => set('objetivos_especificos', v)}
            filaNueva={{ objetivo: '', entregable: '' }}
            columnas={[
              { campo: 'objetivo', etiqueta: 'Objetivo específico', ancho: 3, multilinea: true },
              { campo: 'entregable', etiqueta: 'Entregable', ancho: 2, multilinea: true },
            ]}
          />
          {objetivosRegistrados > 0 && (
            <div className="alert alert-secondary d-flex align-items-start gap-2">
              <Checkbox inputId="reemplazarObjetivos" checked={reemplazarObjetivos}
                onChange={(e) => setReemplazarObjetivos(e.checked)} />
              <label htmlFor="reemplazarObjetivos" className="mb-0">
                El proyecto ya tiene {objetivosRegistrados} objetivo(s) registrado(s). Márquelo para
                <strong> desactivarlos y registrar los de la propuesta</strong>. Si no lo marca, se conservan y
                solo se completan los entregables de los objetivos con el mismo texto.
              </label>
            </div>
          )}
        </AccordionTab>

        <AccordionTab header="Textos de la propuesta">
          <div className="p-fluid formgrid grid">
            {texto('resumen', 'Resumen ejecutivo', { filas: 4 })}
            {texto('metodologia', 'Metodología', { filas: 3 })}
            {texto('resultados_esperados', 'Resultados esperados por objetivo', { filas: 3 })}
            {texto('impactos_esperados', 'Impactos esperados', { filas: 3 })}
            {texto('consideraciones_eticas', 'Consideraciones ambientales y éticas', { filas: 3 })}
            {texto('propiedad_intelectual', 'Aspectos de propiedad intelectual', { filas: 3 })}
          </div>
        </AccordionTab>

        <AccordionTab header="Equipo investigador">
          <ListaEditable
            titulo="Equipo de la unidad ejecutora"
            ayuda="Si el correo coincide con una persona registrada en el sistema, se enlaza automáticamente."
            filas={datos.equipo || []}
            onChange={(v) => set('equipo', v)}
            filaNueva={{ nombre: '', rol: '', profesion: '', telefono: '', correo: '' }}
            columnas={[
              { campo: 'nombre', etiqueta: 'Nombre', ancho: 2 },
              { campo: 'rol', etiqueta: 'Rol', ancho: 1.5 },
              { campo: 'profesion', etiqueta: 'Profesión', ancho: 1.5 },
              { campo: 'telefono', etiqueta: 'Teléfono', ancho: 1 },
              { campo: 'correo', etiqueta: 'Correo', ancho: 2 },
            ]}
          />
        </AccordionTab>

        <AccordionTab header="Entidad externa participante">
          <div className="p-fluid formgrid grid">
            {campoEntidad('nombre', 'Nombre o razón social', 'col-12')}
            {campoEntidad('tipo_participacion', 'Tipo de participación')}
            {campoEntidad('representante_legal', 'Representante legal')}
            {campoEntidad('responsable', 'Responsable del proyecto')}
            {campoEntidad('cargo_responsable', 'Cargo del responsable')}
            {campoEntidad('telefono_responsable', 'Teléfono del responsable')}
            {campoEntidad('correo_responsable', 'Correo del responsable')}
          </div>
          <ListaEditable
            titulo="Otros integrantes de la entidad"
            filas={datos.integrantes_externos || []}
            onChange={(v) => set('integrantes_externos', v)}
            filaNueva={{ nombre: '', rol: '', profesion: '', correo: '' }}
            columnas={[
              { campo: 'nombre', etiqueta: 'Nombre', ancho: 2 },
              { campo: 'profesion', etiqueta: 'Profesión', ancho: 1.5 },
              { campo: 'rol', etiqueta: 'Rol', ancho: 1.5 },
              { campo: 'correo', etiqueta: 'Correo', ancho: 2 },
            ]}
          />
        </AccordionTab>

        <AccordionTab header="Riesgos y producción comprometida">
          <ListaEditable
            titulo="Riesgos"
            filas={datos.riesgos || []}
            onChange={(v) => set('riesgos', v)}
            filaNueva={{ tipo_riesgo: '', descripcion: '', causa: '', efectos: '', impacto: '', accion: '' }}
            columnas={[
              { campo: 'tipo_riesgo', etiqueta: 'Tipo', ancho: 1 },
              { campo: 'descripcion', etiqueta: 'Riesgo', ancho: 2, multilinea: true },
              { campo: 'causa', etiqueta: 'Causa', ancho: 1.5, multilinea: true },
              { campo: 'impacto', etiqueta: 'Impacto', ancho: 1 },
              { campo: 'accion', etiqueta: 'Acción', ancho: 2, multilinea: true },
            ]}
          />
          <ListaEditable
            titulo="Producción científica comprometida"
            filas={datos.productos || []}
            onChange={(v) => set('productos', v)}
            filaNueva={{ tipo_producto: '', producto: '', indicador: '', puntaje: '', criterio_aceptacion: '' }}
            columnas={[
              { campo: 'tipo_producto', etiqueta: 'Tipo', ancho: 1.5 },
              { campo: 'producto', etiqueta: 'Producto', ancho: 2, multilinea: true },
              { campo: 'indicador', etiqueta: 'Indicador', ancho: 1.5 },
              { campo: 'puntaje', etiqueta: 'Puntaje', ancho: 0.7 },
              { campo: 'criterio_aceptacion', etiqueta: 'Criterio de aceptación', ancho: 2, multilinea: true },
            ]}
          />
        </AccordionTab>

        <AccordionTab header="Cronograma">
          <ListaEditable
            titulo="Actividades"
            ayuda="'Obj.' es el número del objetivo específico al que pertenece la actividad."
            filas={datos.cronograma || []}
            onChange={(v) => set('cronograma', v)}
            filaNueva={{ objetivo_numero: '', numero: '', nombre: '', duracion_dias: '', predecesora: '' }}
            columnas={[
              { campo: 'objetivo_numero', etiqueta: 'Obj.', ancho: 0.5 },
              { campo: 'numero', etiqueta: 'N°', ancho: 0.5 },
              { campo: 'nombre', etiqueta: 'Actividad', ancho: 4, multilinea: true },
              { campo: 'duracion_dias', etiqueta: 'Días', ancho: 0.7 },
              { campo: 'predecesora', etiqueta: 'Predecesora', ancho: 1 },
            ]}
          />
        </AccordionTab>
      </Accordion>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button label="Descartar" icon="pi pi-times" className="p-button-text p-button-danger" onClick={onDescartar} />
        <Button label="Confirmar y guardar en el proyecto" icon="pi pi-check" loading={confirmando}
          onClick={() => onConfirmar(limpiar(datos), reemplazarObjetivos)} />
      </div>
    </div>
  );
};

export default RevisionPropuestaForm;
