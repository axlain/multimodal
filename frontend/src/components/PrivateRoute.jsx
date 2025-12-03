import React from 'react';
import { Navigate, Route } from 'react-router-dom';

function PrivateRoute({ element, ...rest }) {
  const token = localStorage.getItem('token'); // Verifica si hay un token en localStorage

  // Si hay token, muestra el componente; si no, redirige a /login
  return token ? element : <Navigate to="/login" />;
}

export default PrivateRoute;
