import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(
  (
    {
      type = 'text',
      name,
      value,
      placeholder,
      disabled = false,
      readOnly = false,
      error = false,
      fullWidth = false,
      onChange,
      onBlur,
      onFocus,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputClasses = [
      styles.input,
      error && styles.error,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={inputClasses}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
