import { motion } from 'framer-motion';
import IconContainer from '@/components/atoms/IconContainer';

function StatCard({ title, value, icon, iconColor, iconBgColor, valueColor, delay = 0, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`glass-card rounded-xl p-6 shadow-md ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <motion.p
            key={value} // Key prop ensures animation on value change
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold animate-count-up ${valueColor}`}
          >
            {value}
          </motion.p>
        </div>
        <IconContainer
          name={icon}
          iconClassName="w-6 h-6"
          containerClassName="w-12 h-12"
          backgroundColor={iconBgColor}
          color={iconColor}
        />
      </div>
    </motion.div>
  );
}

export default StatCard;