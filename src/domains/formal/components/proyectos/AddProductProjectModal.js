// src/domains/formal/components/proyectos/AddProductoProyectoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { addProductoProyecto, fetchProductosPorProyecto } from '../../../../features/proyectos/productosSlice';
import ListaAsignados from './ListaAsignados';
import { fetchMetadata } from '../../../../features/metadata/metadataSlice';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';


const AddProductoProyectoModal = ({ visible, onHide, proyectoId, mostrarAsignados = false }) => {
  const dispatch = useDispatch();
  const { productosMinciencias } = useSelector((state) => state.metadata); 
  const { productos, loading, error } = useSelector((state) => state.productos);
  const [asignadosListos, setAsignadosListos] = useState(false);

  const [selectedProductoMinciencias, setSelectedProductoMinciencias] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [puntaje, setPuntaje] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedProductoMinciencias(null);
      setCategoria('');
      setPuntaje(0);
      setValidationError('');
    }
  }, [visible]);

  useEffect(() => {
    if (visible && productosMinciencias.length === 0) dispatch(fetchMetadata());
  }, [visible, dispatch, productosMinciencias.length]);

  useEffect(() => {
    if (!visible) { setAsignadosListos(false); return; }
    if (!mostrarAsignados || !proyectoId) return;
    let cancelado = false;
    dispatch(fetchProductosPorProyecto(proyectoId)).finally(() => {
      if (!cancelado) setAsignadosListos(true);
    });
    return () => { cancelado = true; };
  }, [visible, mostrarAsignados, proyectoId, dispatch]);

  const validateForm = () => {
    if (!selectedProductoMinciencias || !categoria || puntaje <= 0) {
      setValidationError('Debe seleccionar un producto, ingresar una categoría y un puntaje válido.');
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
    const payload = {
      proyectoId,
      data: {
        producto_x_grupo: selectedProductoMinciencias, 
        categoria,
        puntaje,
      },
    };
    dispatch(addProductoProyecto(payload)).then((result) => {
      if (addProductoProyecto.fulfilled.match(result)) {
        setIsConfirmVisible(false);
        onHide();
      }
    });
  };

  const renderFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleShowConfirmation} autoFocus />
    </div>
  );

  return (
    <>
      <Dialog header="Agregar Producto al Proyecto" visible={visible} style={{ width: '40vw' }} footer={renderFooter} onHide={onHide}>
        <div className="p-fluid">
          {mostrarAsignados && (
            <ListaAsignados
              titulo="Productos ya asignados a este proyecto"
              cargando={!asignadosListos}
              items={productos.filter((p) => p.estado !== false)}
              vacio="Este proyecto aún no tiene productos."
              renderItem={(p) => (
                <><strong>{p.producto_nombre}</strong> – {p.producto_nomenclatura} · {p.puntaje} pts</>
              )}
            />
          )}
          <div className="field mb-3">
            <label htmlFor="productoMinciencias">Producto Minciencias</label>
            <Dropdown inputId="productoMinciencias" value={selectedProductoMinciencias} options={productosMinciencias} onChange={(e) => setSelectedProductoMinciencias(e.value)} optionLabel="nombre_producto" optionValue="id" filter placeholder="Seleccione un producto" />
          </div>
          <div className="field mb-3">
            <label htmlFor="categoria">Categoría</label>
            <InputText id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          </div>
          <div className="field mb-3">
            <label htmlFor="puntaje">Puntaje</label>
            <InputNumber id="puntaje" value={puntaje} onValueChange={(e) => setPuntaje(e.value)} min={0} />
          </div>
          {validationError && <div className="alert alert-danger mt-3">{validationError}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </Dialog>

      <ConfirmationModal
        visible={isConfirmVisible}
        onHide={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmAdd}
        header="Confirmar Adición de Producto"
        loading={loading}
      >
        <h6>Resumen del producto a agregar:</h6>
        <ul>
          <li><strong>Producto:</strong> {productosMinciencias.find(pm => pm.id === selectedProductoMinciencias)?.nombre_producto || 'N/A'}</li>
          <li><strong>Categoría:</strong> {categoria}</li>
          <li><strong>Puntaje:</strong> {puntaje}</li>
        </ul>
      </ConfirmationModal>
    </>
  );
};

export default AddProductoProyectoModal;
