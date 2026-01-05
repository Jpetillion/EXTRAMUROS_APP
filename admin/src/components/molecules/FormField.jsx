import Label from '../atoms/Label';
import Input from '../atoms/Input';
import Textarea from '../atoms/Textarea';
import Select from '../atoms/Select';
import styles from './FormField.module.css';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  options = [],
  rows,
  onChange,
  onBlur,
  className = '',
  ...props
}) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            name={name}
            value={value}
            placeholder={placeholder}
            error={!!error}
            disabled={disabled}
            rows={rows}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
        );
      case 'select':
        return (
          <Select
            name={name}
            value={value}
            placeholder={placeholder}
            error={!!error}
            disabled={disabled}
            options={options}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
        );
      default:
        return (
          <Input
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            error={!!error}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`${styles.formField} ${className}`}>
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}
      {renderInput()}
      {error && <span className={styles.error}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};

export default FormField;
