import { motion } from 'framer-motion';

function Button({ children, className = '', whileHover = { scale: 1.02 }, whileTap = { scale: 0.98 }, ...props }) {
  const isMotionButton = props.onClick || props.type === 'submit' || props.type === 'button'; // Simple heuristic

  const Component = isMotionButton ? motion.button : 'button';

  return (
    <Component
      className={`px-4 py-2 rounded-lg font-medium transition-all ${className}`}
      whileHover={isMotionButton ? whileHover : undefined}
      whileTap={isMotionButton ? whileTap : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;