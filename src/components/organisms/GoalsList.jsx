import { motion } from 'framer-motion';
import ProgressItem from '@/components/molecules/ProgressItem';
import EmptyState from '@/components/molecules/EmptyState';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';

function GoalsList({
  goalsWithProgress,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onContribute,
  className = '',
  ...props
}) {
  const progressItemActions = (goal) => [
    !goal.isCompleted && {
      icon: 'Plus',
      className: 'text-accent hover:bg-accent/10',
      handler: onContribute,
      title: 'Add contribution'
    },
    {
      icon: 'Edit',
      className: 'text-gray-400 hover:text-primary hover:bg-primary/10',
      handler: onEditGoal,
      title: 'Edit Goal'
    },
    {
      icon: 'Trash2',
      className: 'text-gray-400 hover:text-error hover:bg-error/10',
      handler: onDeleteGoal,
      title: 'Delete Goal'
    }
  ].filter(Boolean); // Filter out false values

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`} {...props}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-heading font-semibold text-gray-900">
          Your Goals ({goalsWithProgress.length})
        </h3>
      </div>

      {goalsWithProgress.length === 0 ? (
        <EmptyState
          icon="Target"
          title="No goals created yet"
          message="Start by creating your first savings goal"
          actionText="Create Your First Goal"
          onAction={onAddGoal}
        />
      ) : (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goalsWithProgress.map((goal, index) => {
            const progressColorClass =
              goal.status === 'completed' ? 'bg-success' :
              goal.status === 'overdue' ? 'bg-error' :
              goal.status === 'urgent' ? 'bg-warning' : 'bg-accent';
            const statusTextColorClass =
              goal.status === 'completed' ? 'text-success' :
              goal.status === 'overdue' ? 'text-error' :
              goal.status === 'urgent' ? 'text-warning' : 'text-primary';

            const statusText =
              goal.status === 'completed' ? 'Completed' :
              goal.status === 'overdue' ? 'Overdue' :
              goal.status === 'urgent' ? 'Urgent' : 'On Track';

            const daysLeftText =
              goal.isCompleted ? 'Goal achieved!' :
              goal.isOverdue ? `${Math.abs(goal.daysLeft)} days overdue` :
              `${goal.daysLeft} days left`;

            const footerContent = (
              <>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Target Date</span>
                  <span>{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                </div>
                {goal.isCompleted && (
                  <div className="mt-2 flex items-center text-success text-sm">
                    <ApperIcon name="CheckCircle" className="w-4 h-4 mr-1" />
                    Goal achieved! 🎉
                  </div>
                )}
              </>
            );

            return (
              <ProgressItem
                key={goal.id}
                item={goal}
                index={index}
                className={`border-l-4 ${
                  goal.status === 'completed' ? 'border-success' :
                  goal.status === 'overdue' ? 'border-error' :
                  goal.status === 'urgent' ? 'border-warning' : 'border-primary'
                }`}
                title={goal.name}
                currentAmount={goal.currentAmount}
                targetAmount={goal.targetAmount}
                progress={goal.progress}
                progressColorClass={progressColorClass}
                statusText={statusText}
                statusTextColorClass={statusTextColorClass}
                subtitle={daysLeftText}
                actions={progressItemActions(goal)}
                footerContent={footerContent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GoalsList;