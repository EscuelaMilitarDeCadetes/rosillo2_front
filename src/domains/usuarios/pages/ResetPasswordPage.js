// src/domains/usuarios/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import axiosInstance from '../../../api/axiosInstance';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Token de restablecimiento no encontrado.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // ResetPasswordSerializer exige exactamente: token, password, confirm_password.
      await axiosInstance.post('usuarios/password/reset-password/', {
        token,
        password,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      const detalle = err.response?.data;
      setError(
        detalle && typeof detalle === 'object'
          ? Object.values(detalle).flat().join(' ')
          : 'El token es inválido o ha expirado.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-background">
        <div className="bg-white p-5 rounded-5 shadow text-center" style={{ width: '25rem' }}>
          <h2>Contraseña Restablecida</h2>
          <p>Tu contraseña ha sido actualizada exitosamente.</p>
          {/* No hay forma de saber a qué sistema pertenece el token,
              así que vuelve a la portada para que elija formal/formativa. */}
          <Button label="Ir a Iniciar Sesión" onClick={() => navigate('/')} />
        </div>
      </div>
    );
  }

  return (
    <div className="login-background">
      <div className="bg-white p-5 rounded-5 shadow" style={{ width: '25rem' }}>
        <h2 className="text-center fs-1 fw-bold">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="p-fluid">
            <div className="p-field mb-3">
              <span className="p-float-label">
                <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} toggleMask required />
                <label htmlFor="password">Nueva Contraseña</label>
              </span>
            </div>
            <div className="p-field mb-4">
              <span className="p-float-label">
                <Password id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} toggleMask feedback={false} required />
                <label htmlFor="confirmPassword">Repetir Contraseña</label>
              </span>
            </div>
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          <Button type="submit" label="Cambiar Contraseña" className="w-100 mt-3" loading={loading} />
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;