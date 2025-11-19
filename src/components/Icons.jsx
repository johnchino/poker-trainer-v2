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

  if (icon === 'brain') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    );
  }

  if (icon === 'clock') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    );
  }

  if (icon === 'trophy') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    );
  }

  if (icon === 'check') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    );
  }

  if (icon === 'refresh') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
      </svg>
    );
  }

  if (icon === 'lightbulb') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
      </svg>
    );
  }

  if (icon === 'check-circle') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    );
  }

  if (icon === 'x-circle') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="m15 9-6 6"/>
        <path d="m9 9 6 6"/>
      </svg>
    );
  }

  if (icon === 'alert-circle') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    );
  }

  if (icon === 'alert-triangle') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    );
  }

  if (icon === 'download' || icon === 'save') {
    return (
      <svg viewBox="0 0 512 391.737" fill="currentColor" fillRule="evenodd" width={size} height={size} className={className}>
        <path d="M189.953 0h181.91c14.127 0 20.464 12.563 25.685 25.685l19.328 48.584h33.657c33.807 0 61.467 27.662 61.467 61.467V330.27c0 33.805-27.662 61.467-61.467 61.467H61.467C27.662 391.737 0 364.077 0 330.27V135.736c0-33.807 27.66-61.467 61.467-61.467h81.057l21.744-48.584C170.039 12.79 175.826 0 189.953 0zm76.731 144.185c41.11 0 74.475 33.364 74.475 74.476 0 41.11-33.363 74.475-74.475 74.475-41.11 0-74.475-33.363-74.475-74.475.001-41.112 33.365-74.476 74.475-74.476zM442.75 115.57c13.577 0 24.573 10.996 24.573 24.574 0 13.578-10.996 24.574-24.573 24.574-13.579 0-24.575-10.996-24.575-24.574.041-13.578 11.038-24.574 24.575-24.574zM266.684 95.703c67.936 0 122.999 55.064 122.999 122.999 0 67.893-55.065 122.999-122.999 122.999-67.894 0-122.999-55.106-122.999-122.999.041-67.935 55.105-122.999 122.999-122.999z"/>
      </svg>
    );
  }


  if (icon === 'upload' || icon === 'export') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    );
  }

  if (icon === 'import' || icon === 'arrow-down') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    );
  }

  const icons = {
    'plus': '+',
    'log-out': '↪',
    'chevron-down': '▼',
    'chevron-right': '▶',
    'trash-2': '×',
    'x': '×'
  };
  
  return (
    <span className={className} style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
      {icons[icon] || '•'}
    </span>
  );
};