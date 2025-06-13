import ApperIcon from '@/components/ApperIcon';

function IconContainer({ name, iconClassName = '', containerClassName = 'w-12 h-12', backgroundColor, color, ...props }) {
  const style = {
    backgroundColor: backgroundColor ? `${backgroundColor}20` : undefined,
  };
  const iconStyle = {
    color: color || undefined,
  };

  return (
    <div
      className={`${containerClassName} rounded-lg flex items-center justify-center`}
      style={style}
      {...props}
    >
      <ApperIcon name={name} className={`${iconClassName}`} style={iconStyle} />
    </div>
  );
}

export default IconContainer;