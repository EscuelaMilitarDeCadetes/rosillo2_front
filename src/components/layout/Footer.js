// src/components/layout/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ marginTop: '120px' }}>
      <section>
        <main className="container-fluid">
          <div className="row p-5 pb-2 text-white" style={{ backgroundColor: '#162749' }}>
            {/* ... (Copia aquí el contenido HTML de tu footer de plantilla.html) ... */}
            <div className="col-xs-12 col-md-6 col-lg-3 mt-4">
              <p className="h3 mb-6">GINSI</p>
              <p className="copyright fw-bold">ESMIC-CIDSI-GINSI 2022</p>
              <p className="text-secondary">ESMIC - Bogotá D.C.</p>
            </div>
            {/* ... resto de las columnas ... */}
            <div className="col-xs-12 pt-4" style={{ fontSize: '0.8rem' }}>
              <p className="text-white text-center">
                Escuela Militar de Cadetes General José María Córdova / VIGILADA MINEDUCACIÓN...
              </p>
            </div>
          </div>
        </main>
      </section>
    </footer>
  );
};

export default Footer;
