// src/domains/formal/components/proyectos/ProductosProyectoTable.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import { SelectButton } from 'primereact/selectbutton';
import {
  fetchProductosPorProyecto,
  fetchProductosPendientesPorProyecto,
  fetchProductosEntregadosPorProyecto,
  deleteProductoProyecto,
  uploadProductoToGruplac,
  descargarDocumentoEntregaProducto,
} from '../../../../features/proyectos/productosSlice';
import AddProductoProyectoModal from "./AddProductProjectModal";
import RegistrarEntregaProductoModal from "./RegistrarEntregaProductoModal";

const ROLES_PUEDEN_GESTIONAR = ['CINTERNO', 'CEXTERNO'];

const OPCIONES_VISTA = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'pendientes' },
  { label: 'Entregados', value: 'entregados' },
];


const ProductosProyectoTable = ({ proyectoId, readOnly = false }) => {
  const dispatch = useDispatch();
  const toast = useRef(null);
  const { roles } = useSelector((state) => state.auth);
  const { productos, loading, descargandoDocumentoId } = useSelector((state) => state.productos);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productoParaEntrega, setProductoParaEntrega] = useState(null);

  useEffect(() => {
    if (proyectoId) dispatch(fetchProductosPorProyecto(proyectoId));
  }, [dispatch, proyectoId]);

  const [vista, setVista] = useState('todos');

  const cargarProductos = useCallback((vistaSeleccionada) => {
    if (!proyectoId) return;
    if (vistaSeleccionada === 'pendientes') {
      dispatch(fetchProductosPendientesPorProyecto(proyectoId));
    } else if (vistaSeleccionada === 'entregados') {
      dispatch(fetchProductosEntregadosPorProyecto(proyectoId));
    } else {
      dispatch(fetchProductosPorProyecto(proyectoId));
    }
  }, [dispatch, proyectoId]);

  useEffect(() => {
    cargarProductos(vista);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  const handleCambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    cargarProductos(nuevaVista);
  };

  const hasAnyRole = (requiredRoles) => requiredRoles.some((rol) => roles.includes(rol));

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      dispatch(
        deleteProductoProyecto({ productoXProyectoId: productToDelete.id, proyectoId })
      ).then((result) => {
        if (deleteProductoProyecto.fulfilled.match(result)) {
          setIsDeleteConfirmVisible(false);
          setProductToDelete(null);
          cargarProductos(vista);
        }
      });
    }
  };

  const handleUploadToGruplac = (productId) => {
    dispatch(uploadProductoToGruplac(productId)).then((result) => {
      if (uploadProductoToGruplac.fulfilled.match(result)) {
        cargarProductos(vista);
      }
    });
  };

  const handleDownload = (rowData) => {
    dispatch(descargarDocumentoEntregaProducto(rowData.id)).then((result) => {
      if (!descargarDocumentoEntregaProducto.fulfilled.match(result)) {
        toast.current?.show({
          severity: 'warn',
          summary: 'No se pudo descargar',
          detail: result.payload || 'Este producto no tiene un documento de entrega registrado.',
          life: 5000,
        });
      }
    });
  };

  const entregadoBodyTemplate = (rowData) => (
    <Tag value={rowData.entregado ? 'SI' : 'NO'} severity={rowData.entregado ? 'success' : 'warning'} />
  );

  const gruplacBodyTemplate = (rowData) => (
    <Tag value={rowData.gruplac ? 'SI' : 'NO'} severity={rowData.gruplac ? 'success' : 'warning'} />
  );

  const actionBodyTemplate = (rowData) => {
    const canModify = hasAnyRole(ROLES_PUEDEN_GESTIONAR);
    return (
      <div className="d-flex gap-2">
        {rowData.entregado && (
          <Button
            icon="pi pi-download"
            className="p-button-rounded p-button-info p-button-sm"
            tooltip="Descargar / Ver documento"
            loading={descargandoDocumentoId === rowData.id}
            onClick={() => handleDownload(rowData)}
          />
        )}
        {canModify && !rowData.entregado && (
          <Button
            icon="pi pi-upload"
            className="p-button-rounded p-button-secondary p-button-sm"
            tooltip="Registrar Entrega"
            onClick={() => setProductoParaEntrega(rowData)}
          />
        )}
        {canModify && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-sm"
            tooltip="Borrar Producto"
            onClick={() => handleDeleteClick(rowData)}
          />
        )}
        {canModify && !rowData.gruplac && rowData.entregado && (
          <Button label="Subir a GrupLAC" className="p-button-sm p-button-secondary" onClick={() => handleUploadToGruplac(rowData.id)} />
        )}
        {rowData.gruplac && rowData.entregado && (
          <p className="fw-bold text-success mb-0">Producto Subido a GrupLAC</p>
        )}
      </div>
    );
  };

  const linkReadOnlyBodyTemplate = (rowData) =>
    rowData.entregado ? (
      <Button
        label="Descargar / Ver"
        className="p-button-text p-button-sm"
        loading={descargandoDocumentoId === rowData.id}
        onClick={() => handleDownload(rowData)}
      />
    ) : (
      <span className="text-muted">Link no disponible todavia</span>
    );

  const header = (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <h5 className="m-0">Productos Asociados al Proyecto</h5>
      <div className="d-flex align-items-center gap-3">
        <SelectButton
          value={vista}
          options={OPCIONES_VISTA}
          onChange={(e) => e.value && handleCambiarVista(e.value)}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      {!readOnly && (
        <div className="d-flex justify-content-end mb-3">
          {hasAnyRole(ROLES_PUEDEN_GESTIONAR) && (
            <Button label="Agregar Producto" icon="pi pi-plus" onClick={() => setIsAddProductModalVisible(true)} />
          )}
        </div>
      )}
      <DataTable
        value={productos}
        header={header}
        loading={loading}
        paginator
        rows={10}
        globalFilter={globalFilter}
        emptyMessage="No se encontraron productos vinculados a este proyecto."
        responsiveLayout="scroll"
      >
        <Column field="grupo_nombre" header="Tipo de Producto" sortable />
        <Column field="producto_nomenclatura" header="Categoría" sortable />
        <Column field="puntaje" header="Puntaje" sortable />
        <Column field="entregado" header="Entregado" body={entregadoBodyTemplate} sortable />
        <Column field="gruplac" header="grupLAC" body={gruplacBodyTemplate} sortable />
        <Column header="Link" body={readOnly ? linkReadOnlyBodyTemplate : actionBodyTemplate} />
      </DataTable>
      {!readOnly && (
        <>
          <AddProductoProyectoModal
            visible={isAddProductModalVisible}
            onHide={() => setIsAddProductModalVisible(false)}
            proyectoId={proyectoId}
          />
          <RegistrarEntregaProductoModal
            visible={!!productoParaEntrega}
            onHide={() => setProductoParaEntrega(null)}
            proyectoId={proyectoId}
            producto={productoParaEntrega}
          />
          <ConfirmationModal
            visible={isDeleteConfirmVisible}
            onHide={() => setIsDeleteConfirmVisible(false)}
            onConfirm={handleConfirmDelete}
            header="Confirmar Eliminación del Producto"
            loading={loading}
          >
            <p>¿Estás seguro de que quieres borrar el producto <strong>{productToDelete?.producto_nombre}</strong>?</p>
          </ConfirmationModal>
        </>
      )}
    </>
  );
};

export default ProductosProyectoTable;