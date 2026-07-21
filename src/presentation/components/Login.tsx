import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Por favor ingresa tu correo corporativo arriba para enviarte el enlace de recuperación.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Se ha enviado un enlace a tu correo para restablecer la contraseña.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No hay ningún usuario registrado con este correo.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo es inválido.');
      } else {
        setError('Hubo un error al intentar enviar el correo. Por favor intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="/BREWMAN.jpeg" alt="Brewman Logo" className="login-logo" />
          <h2>Analytics Dashboard</h2>
          <p>Indicadores Estadísticos</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <div className="input-group">
            <label>Correo Corporativo</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brewman.com"
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Contraseña</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={!message} // No requerir contraseña si solo se intenta recuperar
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            <a href="#" className="forgot-password" onClick={handleResetPassword}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
