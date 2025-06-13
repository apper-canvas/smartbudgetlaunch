import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

function ErrorState({
  message = 'Failed to load data',
  details = 'Something went wrong. Please try again.',
  onRetry,
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
      <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500 mb-4">{details}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white hover:bg-primary/90"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
}

export default ErrorState;