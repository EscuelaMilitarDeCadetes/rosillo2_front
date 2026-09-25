// src/domains/common/pages/HelpPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import ModalContactarSoporte from '../components/soporte/ModalContactarSoporte';

// Datos de los videos tutoriales. Los IDs placeholder (VIDEO_ID_2, etc.) se
// reemplazan por el ID real de YouTube cuando cada video quede publicado
// (el ID es la parte final de la URL: youtube.com/watch?v=ESTE_ID).
const videos = [
  { id: 'th0hgA-qSLI', title: 'Introducción a la Plataforma ROSILLO', description: 'Un recorrido general por las funcionalidades principales de la plataforma.' },
  { id: 'VIDEO_ID_2', title: 'Cómo Crear un Nuevo Proyecto', description: 'Paso a paso para registrar un nuevo proyecto en una convocatoria abierta.' },
  { id: 'VIDEO_ID_3', title: 'Gestión de Documentos', description: 'Aprende a subir y hacer seguimiento a los documentos requeridos para tu proyecto.' },
  { id: 'VIDEO_ID_4', title: 'Registro de Avances', description: 'Cómo registrar los avances y cumplir con los puntos de control de tu investigación.' },
  // ... puedes añadir más videos aquí
];

// Un video sin ID real todavía no se publica (evita el iframe roto de
// youtube.com/embed/VIDEO_ID_2 mientras el ID sea el placeholder literal).
const esIdPendiente = (id) => id.startsWith('VIDEO_ID_');

const HelpPage = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1>Centro de Ayuda</h1>
        <p className="lead">Encuentra tutoriales en video para aprovechar al máximo la plataforma ROSILLO.</p>
        <Button
          label="Contactar a Soporte"
          className="p-button-primary mt-2"
          onClick={() => setModalVisible(true)}
        />
      </div>

      <div className="row g-4">
        {videos.map((video) => (
          <div className="col-12 col-md-6" key={video.id}>
            <Card title={video.title} className="h-100">
              {esIdPendiente(video.id) ? (
                <div
                  className="d-flex align-items-center justify-content-center bg-light text-muted mb-3"
                  style={{ aspectRatio: '16 / 9', borderRadius: 6 }}
                >
                  Video próximamente
                </div>
              ) : (
                <div className="ratio ratio-16x9 mb-3">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <p className="mb-0">{video.description}</p>
            </Card>
          </div>
        ))}
      </div>

      <ModalContactarSoporte visible={modalVisible} onHide={() => setModalVisible(false)} />
    </div>
  );
};

export default HelpPage;