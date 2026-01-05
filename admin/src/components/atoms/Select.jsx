import { forwardRef } from 'react';
import styles from './Select.module.css';

const Select = forwardRef(
  (
    {
      name,
      value,
      options = [],
      placeholder,
      disabled = false,
      error = false,
      fullWidth = false,
      onChange,
      onBlur,
      className = '',
      ...props
    },
    ref
  ) => {
    const selectClasses = [
      styles.select,
      error && styles.error,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <select
        ref={ref}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;
