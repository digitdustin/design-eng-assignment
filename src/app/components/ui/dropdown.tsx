import React, { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  children: ReactNode;
  onChange?: (value: string) => void;
}

const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ children, onChange, className = '', ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event.target.value);
    };

    return (
      <select
        ref={ref}
        onChange={handleChange}
        className={`w-full text-sm bg-neutral-200 rounded-lg px-3 h-9 appearance-none ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1em 1em',
          paddingRight: '2.5rem',
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

interface DropdownOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: ReactNode;
}

const DropdownOption: React.FC<DropdownOptionProps> = ({ children, ...props }) => {
  return <option {...props}>{children}</option>;
};

export { Dropdown, DropdownOption };
