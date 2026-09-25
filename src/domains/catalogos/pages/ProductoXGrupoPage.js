// src/domains/catalogos/pages/ProductoXGrupoPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';
import { fetchMetadata } from '../../../features/metadata/metadataSlice';
import {
  fetchProductoXGrupoPorProductoMinciencias,
  fetchProductoXGrupoPorGrupoMinciencias,
  fetchProductoXGrupoPorTipoProducto,
  limpiarFiltroProductoXGrupo,
} from '../../../features/catalogos/productoXGrupoFiltrosSlice';

const TIPOS_FILTRO = [
  { label: 'Por Producto Minciencias', value: 'producto_minciencias', optionsSource: 'productosMinciencias', optionLabel: 'nombre_producto', thunk: fetchProductoXGrupoPorProductoMinciencias },
  { label: 'Por Grupo Minciencias', value: 'grupo_minciencias', optionsSource: 'gruposMinciencias', optionLabel: 'nombre_grupo_minciencias', thunk: fetchProductoXGrupoPorGrupoMinciencias },
  { label: 'Por Tipo de Producto', value: 'tipo_producto', optionsSource: 'tiposProducto', optionLabel: 'tipo_producto', thunk: fetchProductoXGrupoPorTipoProducto },
];

const ProductoXGrupoPage = () => {
  const dispatch = useDispatch();
  const metadata = useSelector((state) => state.metadata);
  const { resultados, loading, error } = useSelector((state) => state.productoXGrupoFiltros);

  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [valorFiltro, setValorFiltro] = useState(null);

  useEffect(() => {
    if (metadata.grados.length === 0) dispatch(fetchMetadata());
  }, [dispatch, metadata.grados.length]);

  const configFiltro = TIPOS_FILTRO.find((f) => f.value === tipoFiltro);
  const opcionesValor = configFiltro ? (metadata[configFiltro.optionsSource] || []) : [];

  const aplicarFiltro = () => {
    if (configFiltro && valorFiltro) {
      dispatch(configFiltro.thunk(valorFiltro));
    }
  };

  const limpiar = () => {
    setTipoFiltro(null);
    setValorFiltro(null);
    dispatch(limpiarFiltroProductoXGrupo());
  };

  return (
    <div>
      <Card title="Filtrar Productos por Grupo" className="mb-4">
        <div className="p-fluid formgrid grid align-items-end">
          <div className="field col-12 md:col-4">
            <label>Tipo de filtro</label>
            <Dropdown
              value={tipoFiltro}
              options={TIPOS_FILTRO}
              onChange={(e) => { setTipoFiltro(e.value); setValorFiltro(null); }}
              placeholder="Seleccione un filtro"
            />
          </div>
          <div className="field col-12 md:col-4">
            <label>Valor</label>
            <Dropdown
              value={valorFiltro}
              options={opcionesValor}
              onChange={(e) => setValorFiltro(e.value)}
              optionLabel={configFiltro?.optionLabel}
              optionValue="id"
              disabled={!tipoFiltro}
              filter
              placeholder={tipoFiltro ? 'Seleccione un valor' : 'Primero elija un tipo de filtro'}
            />
          </div>
          <div className="field col-12 md:col-4 d-flex gap-2">
            <Button label="Filtrar" icon="pi pi-filter" onClick={aplicarFiltro} disabled={!valorFiltro} />
            <Button label="Limpiar" icon="pi pi-times" className="p-button-text" onClick={limpiar} />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {(tipoFiltro || resultados.length > 0) && (
          <DataTable value={resultados} loading={loading} responsiveLayout="scroll" paginator rows={10}
            emptyMessage="No hay relaciones producto-grupo para el valor filtrado.">
            <Column field="producto_nombre" header="Producto Minciencias" sortable />
            <Column field="grupo_nombre" header="Grupo Minciencias" sortable />
            <Column field="tipo_producto_nombre" header="Tipo de Producto" sortable />
          </DataTable>
        )}
      </Card>

      <CatalogPage config={CATALOGOS_CONFIG.producto_x_grupo} />
    </div>
  );
};

export default ProductoXGrupoPage;