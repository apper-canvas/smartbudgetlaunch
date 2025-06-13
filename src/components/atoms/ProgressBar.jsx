import { motion } from 'framer-motion';

function ProgressBar({ progress, colorClass = 'bg-primary', className = '', animationDelay = 0, ...props }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`} {...props}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 1, delay: animationDelay }}
        className={`h-3 rounded-full ${colorClass}`}
      />
    </div>
  );
}

export default ProgressBar;