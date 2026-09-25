// src/domains/catalogos/pages/TipoCalificacionPage.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';
import {
  fetchTiposCalificacionEvaluables,
  limpiarTiposCalificacionEvaluables,
} from '../../../features/catalogos/tipoCalificacionFiltrosSlice';

const TipoCalificacionPage = () => {
  const dispatch = useDispatch();
  const { evaluables, loading, error } = useSelector((state) => state.tipoCalificacionFiltros);
  const [soloEvaluables, setSoloEvaluables] = useState(false);

  const handleToggle = (checked) => {
    setSoloEvaluables(checked);
    if (checked) {
      dispatch(fetchTiposCalificacionEvaluables());
    } else {
      dispatch(limpiarTiposCalificacionEvaluables());
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <div className="d-flex align-items-center gap-3">
          <InputSwitch checked={soloEvaluables} onChange={(e) => handleToggle(e.value)} />
          <label className="mb-0">Ver solo fases evaluables</label>
        </div>

        {soloEvaluables && (
          <>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <DataTable
              value={evaluables}
              loading={loading}
              responsiveLayout="scroll"
              className="mt-3"
              emptyMessage="No hay tipos de calificación marcados como evaluables."
            >
              <Column field="tipo_calificacion" header="Tipo de Calificación" sortable />
              <Column field="descripcion" header="Descripción" sortable />
              <Column field="ordenFase" header="Orden de Fase" sortable />
              <Column
                header="Evaluación"
                body={() => <Tag severity="success" value="Sí" />}
              />
            </DataTable>
          </>
        )}
      </Card>

      <CatalogPage config={CATALOGOS_CONFIG.tipo_calificacion} />
    </div>
  );
};

export default TipoCalificacionPage;