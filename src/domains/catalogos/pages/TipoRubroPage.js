// src/domains/catalogos/pages/TipoRubroPage.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';
import {
  fetchTiposRubroAplicables,
  limpiarTiposRubroAplicables,
} from '../../../features/catalogos/tipoRubroFiltrosSlice';

const TipoRubroPage = () => {
  const dispatch = useDispatch();
  const { aplicables, loading, error } = useSelector((state) => state.tipoRubroFiltros);
  const [soloAplicables, setSoloAplicables] = useState(false);

  const handleToggle = (checked) => {
    setSoloAplicables(checked);
    if (checked) {
      dispatch(fetchTiposRubroAplicables());
    } else {
      dispatch(limpiarTiposRubroAplicables());
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <div className="d-flex align-items-center gap-3">
          <InputSwitch checked={soloAplicables} onChange={(e) => handleToggle(e.value)} />
          <label className="mb-0">Ver solo rubros aplicables</label>
        </div>
        {soloAplicables && (
          <>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <DataTable
              value={aplicables}
              loading={loading}
              responsiveLayout="scroll"
              className="mt-3"
              emptyMessage="No hay tipos de rubro marcados como aplicables."
            >
              <Column field="nombre_rubro" header="Nombre del Rubro" sortable />
            </DataTable>
          </>
        )}
      </Card>
      <CatalogPage config={CATALOGOS_CONFIG.tipo_rubro} />
    </div>
  );
};

export default TipoRubroPage;