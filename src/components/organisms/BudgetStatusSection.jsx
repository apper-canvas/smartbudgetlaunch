import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import ProgressItem from '@/components/molecules/ProgressItem';
import EmptyState from '@/components/molecules/EmptyState';

const categories = [
  { name: 'Food & Dining', color: '#EF4444', icon: 'UtensilsCrossed' },
  { name: 'Transportation', color: '#F59E0B', icon: 'Car' },
  { name: 'Entertainment', color: '#8B5CF6', icon: 'Gamepad2' },
  { name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Bills & Utilities', color: '#06B6D4', icon: 'Receipt' },
  { name: 'Healthcare', color: '#10B981', icon: 'Heart' }
];

function BudgetStatusSection({ budgets, onAddBudget, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`bg-white rounded-xl p-6 shadow-md ${className}`}
      {...props}
    >
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        Budget Status
      </h3>

      {budgets.length === 0 ? (
        <EmptyState
          icon="Target"
          title="No budgets set"
          message="Create budgets to track your spending"
          actionText="Add Budget"
          onAction={onAddBudget}
        />
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 4).map((budget, index) => {
            const categoryData = categories.find(c => c.name === budget.category);
            const statusColor =
              budget.percentage > 100 ? 'bg-error' :
              budget.percentage > 80 ? 'bg-warning' : 'bg-success';
            const statusTextColor =
              budget.percentage > 100 ? 'text-error' :
              budget.percentage > 80 ? 'text-warning' : 'text-success';
            const footerContent = budget.percentage > 100 && (
              <p className="text-xs text-error mt-1 flex items-center">
                <ApperIcon name="AlertTriangle" className="w-4 h-4 mr-1" />
                Over budget by ${(budget.spent - budget.amount).toLocaleString()}
              </p>
            );

            return (
              <ProgressItem
                key={budget.id}
                item={budget}
                index={index}
                title={budget.category}
                subtitle={`Budget: $${budget.amount.toLocaleString()}`}
                currentAmount={budget.spent}
                targetAmount={budget.amount}
                progress={budget.percentage}
                progressColorClass={statusColor}
                statusText={budget.period}
                statusTextColorClass={statusTextColor}
                icon={categoryData?.icon || 'Circle'}
                iconBgColor={categoryData?.color}
                iconColor={categoryData?.color}
                className="p-4 bg-gray-50 rounded-lg"
                actions={[]} // No actions needed in this summary view
                footerContent={footerContent}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default BudgetStatusSection;