// src/domains/usuarios/pages/ForgotPasswordPage.js
import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import ReCAPTCHA from 'react-google-recaptcha';
import axiosInstance from '../../../api/axiosInstance';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const recaptchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recaptcha = recaptchaRef.current?.getValue();
    if (!recaptcha) {
      setError('Por favor confirma que no eres un robot.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // ForgotPasswordSerializer exige 'email' y 'recaptcha'.
      const response = await axiosInstance.post('usuarios/password/forgot-password/', {
        email,
        recaptcha,
      });
      setMessage(response.data.message);
    } catch (err) {
      const detalle = err.response?.data;
      setError(
        detalle && typeof detalle === 'object'
          ? Object.values(detalle).flat().join(' ')
          : 'Ocurrió un error. Por favor, inténtalo de nuevo.'
      );
    } finally {
      recaptchaRef.current?.reset();
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="bg-white p-5 rounded-5 shadow" style={{ width: '25rem' }}>
        <h2 className="text-center fs-1 fw-bold">Recuperar Contraseña</h2>
        <p className="text-center text-muted">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="p-fluid">
            <div className="p-field mb-3">
              <span className="p-float-label">
                <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label htmlFor="email">Correo Institucional</label>
              </span>
            </div>
          </div>
          <div className="d-flex justify-content-center mb-3">
            <ReCAPTCHA ref={recaptchaRef} sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} />
          </div>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <Button type="submit" label="Enviar Enlace" className="w-100 mt-3" loading={loading} />
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;