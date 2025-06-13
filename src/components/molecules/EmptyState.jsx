import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

function EmptyState({
  icon = 'Info',
  title = 'No data found',
  message = 'Add some items to get started',
  actionText,
  onAction,
  className = '',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 ${className}`}
      {...props}
    >
      <ApperIcon name={icon} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {onAction && actionText && (
        <Button
          onClick={onAction}
          className="px-4 py-2 bg-primary text-white hover:bg-primary/90"
        >
          {actionText}
        </Button>
      )}
    </motion.div>
  );
}

export default EmptyState;