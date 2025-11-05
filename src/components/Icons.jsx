export const Icon = ({ icon, size = 16, className = '' }) => {
  if (icon === 'pencil' || icon === 'edit') {
    return (
      <svg fill="currentColor" width={size} height={size} viewBox="0 0 528.899 528.899" className={className}>
        <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069L27.473,390.597L0.3,512.69z"/>
      </svg>
    );
  }
  
  if (icon === 'folder' || icon === 'folder-open') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
        <path d="M24 6.95323V20.1579C24 20.3812 23.9064 20.5954 23.7397 20.7534C23.573 20.9113 23.3469 21 23.1111 21H1C0.734784 21 0.48043 20.9002 0.292893 20.7225C0.105357 20.5449 0 20.3039 0 20.0526V3.94737C0 3.69611 0.105357 3.45514 0.292893 3.27748C0.48043 3.09981 0.734784 3 1 3H7.66667C7.88304 3 8.09357 3.06648 8.26667 3.18947L11.7333 5.81639C11.9064 5.93938 12.117 6.00586 12.3333 6.00586H23C23.2652 6.00586 23.5196 6.10567 23.7071 6.28334C23.8946 6.461 24 6.70197 24 6.95323Z" fill="currentColor"/>
      </svg>
    );
  }
  
  if (icon === 'grid-3x3') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
        <path d="M0 1.5H10.5V10.5H0V1.5Z" fill="currentColor"/>
        <path d="M13.5 1.5H24V10.5H13.5V1.5Z" fill="currentColor"/>
        <path d="M13.5 13.5H24V22.5H13.5V13.5Z" fill="currentColor"/>
        <path d="M0 13.5H10.5V22.5H0V13.5Z" fill="currentColor"/>
      </svg>
    );
  }
  
  const icons = {
    'plus': '+',
    'log-out': '↪',
    'chevron-down': '▼',
    'chevron-right': '▶',
    'trash-2': '×',
    'upload': '↑',
    'download': '↓',
    'x': '×'
  };
  
  return (
    <span className={className} style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
      {icons[icon] || '•'}
    </span>
  );
};