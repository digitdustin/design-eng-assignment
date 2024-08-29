import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input className={`w-full text-sm bg-neutral-200 rounded-lg px-3 h-9 ${className}`} {...props} />
);

export default Input;
