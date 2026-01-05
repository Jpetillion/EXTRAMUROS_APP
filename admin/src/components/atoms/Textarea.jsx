import { forwardRef } from 'react';
import styles from './Textarea.module.css';

const Textarea = forwardRef(
  (
    {
      name,
      value,
      placeholder,
      rows = 4,
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
    const textareaClasses = [
      styles.textarea,
      error && styles.error,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <textarea
        ref={ref}
        name={name}
        value={value}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={textareaClasses}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
