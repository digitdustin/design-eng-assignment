import React, { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = ({ className = '', children, ...props }) => (
  <label className={`font-uber text-[13px] font-medium ${className}`} {...props}>
    {children}
  </label>
);

export default Label;
