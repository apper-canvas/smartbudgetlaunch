import { motion } from 'framer-motion';
import ProgressBar from '@/components/atoms/ProgressBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

function ProgressItem({
  item,
  title,
  subtitle,
  currentAmount,
  targetAmount,
  progress,
  progressColorClass,
  statusText,
  statusTextColorClass,
  actions,
  icon,
  iconBgColor,
  iconColor,
  index = 0,
  className = '',
  footerContent,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200 ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            {icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${iconBgColor}20` }}
              >
                <ApperIcon name={icon} className="w-4 h-4" style={{ color: iconColor }} />
              </div>
            )}
            <h4 className="text-lg font-semibold text-gray-900 break-words">{title}</h4>
          </div>
          {subtitle && <p className="text-sm text-gray-600 capitalize">{subtitle}</p>}
          <div className="flex items-center space-x-2 mt-2">
            {statusText && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusTextColorClass}`}>
                {statusText}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          {actions && actions.map((action, actionIndex) => (
            <Button
              key={actionIndex}
              onClick={() => action.handler(item)}
              className={`p-2 rounded-lg transition-all ${action.className}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={action.title}
            >
              <ApperIcon name={action.icon} className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-600">Current</p>
          <p className="text-xl font-bold text-accent">${currentAmount.toLocaleString()}</p>
        </div>
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-600">Target</p>
          <p className="text-xl font-bold text-secondary">${targetAmount.toLocaleString()}</p>
        </div>
        {item.remaining !== undefined && (
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-xl font-bold ${item.remaining >= 0 ? 'text-success' : 'text-error'}`}>
              ${Math.abs(item.remaining).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Progress</span>
          <span className={`text-sm font-medium ${statusTextColorClass}`}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <ProgressBar
          progress={progress}
          colorClass={progressColorClass}
          animationDelay={0.2 + index * 0.1}
        />
        {footerContent}
      </div>
    </motion.div>
  );
}

export default ProgressItem;