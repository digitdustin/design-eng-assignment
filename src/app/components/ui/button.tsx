import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'icon';
}

const Button: React.FC<ButtonProps> = ({ onClick, variant, size = 'default', children, className = '', ...props }) => {
  const baseClasses = 'font-uber text-sm font-medium rounded-lg duration-200';

  const variantClasses = {
    primary: 'bg-black hover:opacity-80 text-white',
    secondary: 'bg-neutral-200 hover:bg-neutral-300 text-black',
    ghost: 'bg-transparent hover:bg-neutral-200 text-black',
  };

  const sizeClasses = size === 'icon' ? 'p-1 h-9 w-9 shrink-0 flex items-center justify-center' : 'px-4 py-2';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
