import styles from './Spinner.module.css';

const Spinner = ({ size = 'medium', color = 'primary', className = '' }) => {
  const spinnerClasses = [styles.spinner, styles[size], styles[color], className]
    .filter(Boolean)
    .join(' ');

  return <div className={spinnerClasses}></div>;
};

export default Spinner;
