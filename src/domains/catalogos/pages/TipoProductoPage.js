// src/domains/catalogos/pages/TipoProductoPage.js
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import CatalogPage from '../components/catalogos/CatalogPage';
import { CATALOGOS_CONFIG } from '../../../features/catalogos/catalogosConfig';
import axiosInstance from '../../../api/axiosInstance';

const descargarArchivo = async (formato) => {
  const extension = formato === 'excel' ? 'xlsx' : 'pdf';
  const response = await axiosInstance.get(`investigacion-formal/tipos-producto/export/${formato}/`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `tipos_producto.${extension}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const TipoProductoPage = () => (
  <div>
    <Card className="mb-4">
      <div className="d-flex gap-2">
        <Button label="Exportar a Excel" icon="pi pi-file-excel" className="p-button-success" onClick={() => descargarArchivo('excel')} />
        <Button label="Exportar a PDF" icon="pi pi-file-pdf" className="p-button-danger" onClick={() => descargarArchivo('pdf')} />
      </div>
    </Card>
    <CatalogPage config={CATALOGOS_CONFIG.tipo_producto} />
  </div>
);

export default TipoProductoPage;