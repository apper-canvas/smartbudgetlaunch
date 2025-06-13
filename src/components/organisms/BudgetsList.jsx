import { motion } from 'framer-motion';
import ProgressItem from '@/components/molecules/ProgressItem';
import EmptyState from '@/components/molecules/EmptyState';
import ApperIcon from '@/components/ApperIcon';

const categories = [
  { name: 'Food & Dining', color: '#EF4444', icon: 'UtensilsCrossed' },
  { name: 'Transportation', color: '#F59E0B', icon: 'Car' },
  { name: 'Entertainment', color: '#8B5CF6', icon: 'Gamepad2' },
  { name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Bills & Utilities', color: '#06B6D4', icon: 'Receipt' },
  { name: 'Healthcare', color: '#10B981', icon: 'Heart' }
];

function BudgetsList({
  budgetsWithSpent,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
  className = '',
  ...props
}) {
  const progressItemActions = [
    {
      icon: 'Edit',
      className: 'text-gray-400 hover:text-primary hover:bg-primary/10',
      handler: onEditBudget,
      title: 'Edit Budget'
    },
    {
      icon: 'Trash2',
      className: 'text-gray-400 hover:text-error hover:bg-error/10',
      handler: onDeleteBudget,
      title: 'Delete Budget'
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`} {...props}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-heading font-semibold text-gray-900">
          Budget Categories ({budgetsWithSpent.length})
        </h3>
      </div>

      {budgetsWithSpent.length === 0 ? (
        <EmptyState
          icon="Target"
          title="No budgets created yet"
          message="Set up budgets to track your spending by category"
          actionText="Create Your First Budget"
          onAction={onAddBudget}
        />
      ) : (
        <div className="p-6 space-y-6">
          {budgetsWithSpent.map((budget, index) => {
            const categoryData = categories.find(c => c.name === budget.category);
            const progressColorClass =
              budget.status === 'over' ? 'bg-error' :
              budget.status === 'warning' ? 'bg-warning' : 'bg-success';
            const statusTextColorClass =
              budget.status === 'over' ? 'text-error' :
              budget.status === 'warning' ? 'text-warning' : 'text-success';

            const footerContent = (
              <>
                {budget.status === 'over' && (
                  <p className="text-sm text-error mt-2 flex items-center">
                    <ApperIcon name="AlertTriangle" className="w-4 h-4 mr-1" />
                    Over budget by ${(budget.spent - budget.amount).toLocaleString()}
                  </p>
                )}
                {budget.status === 'warning' && (
                  <p className="text-sm text-warning mt-2 flex items-center">
                    <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                    Approaching budget limit
                  </p>
                )}
              </>
            );

            return (
              <ProgressItem
                key={budget.id}
                item={budget}
                index={index}
                title={budget.category}
                subtitle={budget.period}
                currentAmount={budget.spent}
                targetAmount={budget.amount}
                progress={budget.percentage}
                progressColorClass={progressColorClass}
                statusText={`${budget.percentage.toFixed(1)}%`}
                statusTextColorClass={statusTextColorClass}
                icon={categoryData?.icon || 'Circle'}
                iconBgColor={categoryData?.color}
                iconColor={categoryData?.color}
                actions={progressItemActions}
                footerContent={footerContent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BudgetsList;