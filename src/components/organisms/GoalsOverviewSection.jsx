import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import ProgressBar from '@/components/atoms/ProgressBar';
import EmptyState from '@/components/molecules/EmptyState';

function GoalsOverviewSection({ goals, onAddGoal, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={`bg-white rounded-xl p-6 shadow-md ${className}`}
      {...props}
    >
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        Savings Goals
      </h3>

      {goals.length === 0 ? (
        <EmptyState
          icon="Target"
          title="No savings goals set"
          message="Create goals to track your progress"
          actionText="Add Goal"
          onAction={onAddGoal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.slice(0, 3).map((goal, index) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 break-words">{goal.name}</h4>
                  <ApperIcon name="Target" className="w-5 h-5 text-accent" />
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>${goal.currentAmount.toLocaleString()}</span>
                    <span>${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <ProgressBar
                    progress={progress}
                    colorClass="bg-accent"
                    animationDelay={0.2 + index * 0.1}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-accent font-medium">{progress.toFixed(1)}%</span>
                  <span className={`${daysLeft > 0 ? 'text-gray-600' : 'text-error'}`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default GoalsOverviewSection;