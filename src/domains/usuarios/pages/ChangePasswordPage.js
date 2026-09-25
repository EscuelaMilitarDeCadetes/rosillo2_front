// src/domains/usuarios/pages/ChangePasswordPage.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { changePassword } from '../../../features/auth/authSlice';

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { debeCambiarPassword, sistemaActivo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await dispatch(
        changePassword({ old_password: oldPassword, new_password: newPassword })
      ).unwrap();
      navigate(`/${sistemaActivo || 'formal'}`);
    } catch (err) {
      setError(
        err && typeof err === 'object'
          ? Object.values(err).flat().join(' ')
          : 'No se pudo cambiar la contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="bg-white p-5 rounded-5 shadow" style={{ width: '25rem' }}>
        <h2 className="text-center fs-1 fw-bold">Cambiar Contraseña</h2>
        {debeCambiarPassword && (
          <p className="text-center text-muted">
            Por seguridad, debes establecer una nueva contraseña antes de continuar.
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="p-fluid">
            <div className="p-field mb-3">
              <span className="p-float-label">
                <Password id="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} toggleMask feedback={false} required />
                <label htmlFor="oldPassword">Contraseña actual</label>
              </span>
            </div>
            <div className="p-field mb-3">
              <span className="p-float-label">
                <Password id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} toggleMask required />
                <label htmlFor="newPassword">Nueva contraseña</label>
              </span>
            </div>
            <div className="p-field mb-4">
              <span className="p-float-label">
                <Password id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} toggleMask feedback={false} required />
                <label htmlFor="confirmPassword">Repetir nueva contraseña</label>
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

export default ChangePasswordPage;