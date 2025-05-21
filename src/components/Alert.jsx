// src/components/Alert.js
import React from 'react';

const Alert = ({ alert }) => {
  return (
    alert && (
      <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
        {alert.message}
      </div>
    )
  );
};

export default Alert;
