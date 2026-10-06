import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const normalized = status.toLowerCase();
  const label = status.replace('_', ' ');

  return (
    <span className={`badge badge-${normalized}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
