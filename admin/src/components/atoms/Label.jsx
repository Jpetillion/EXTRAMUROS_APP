import styles from './Label.module.css';

const Label = ({ htmlFor, children, required = false, className = '', ...props }) => {
  return (
    <label htmlFor={htmlFor} className={`${styles.label} ${className}`} {...props}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
};

export default Label;
