// src/components/auth/LoginForm.js
import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Formulario de login parametrizado por ámbito. Cada
 * dominio (formal/formativa) tiene su propia página/ruta y le pasa su
 * propio 'sistema', 'homeRoute', 'backgroundImage' y 'subtitulo' a este
 * componente compartido.
 *
 * `backgroundImage` permite que formal y formativa usen una imagen de
 * fondo distinta. Independientemente de la imagen, se aplica además una
 * clase `login-background--{sistema}` (ver App.css) que agrega un
 * degradado de color y un acento distinto por sistema, para que el
 * usuario identifique de un vistazo en qué plataforma está entrando
 * incluso si algún día ambas imágenes llegaran a parecerse.
 */
const LoginForm = ({ sistema, titulo, homeRoute, backgroundImage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(homeRoute);
    }
  }, [isAuthenticated, navigate, homeRoute]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(loginUser({ username, password, sistema }));
    }
  };

  return (
    <div
      className={`login-background login-background--${sistema}`}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div
        className={`bg-white p-5 rounded-5 shadow login-card login-card--${sistema}`}
        style={{ width: '25rem' }}
      >
        <div className="text-center mb-4">
          <img style={{ width: '50%' }} src="/image/logo_Cuerpo.png" alt="Logo ESMIC" />
        </div>
        <h2 className="text-center fs-1 fw-bold">Inicio de sesión</h2>
        <p className={`text-center mb-0 login-subtitulo login-subtitulo--${sistema}`}>
          {titulo}
        </p>
        <form onSubmit={handleLogin} className="mt-4">
          <div className="p-fluid">
            <div className="p-field mb-3">
              <span className="p-float-label">
                <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label htmlFor="username">Correo Institucional</label>
              </span>
            </div>
            <div className="p-field mb-4">
              <span className="p-float-label">
                <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask required />
                <label htmlFor="password">Contraseña</label>
              </span>
            </div>
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          <Button
            type="submit"
            label="Iniciar sesión"
            className={`w-100 mt-3 login-boton--${sistema}`}
            loading={loading}
          />
          <div className="text-center mt-3">
            <Link to="/forgot-password">¿Olvidaste la contraseña?</Link>
          </div>
          <div className="text-center mt-2">
            <Link to="/">&larr; Volver al inicio</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;