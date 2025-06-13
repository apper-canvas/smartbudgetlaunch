import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import TransactionItem from '@/components/molecules/TransactionItem';
import EmptyState from '@/components/molecules/EmptyState';

const categories = [
  { name: 'Food & Dining', color: '#EF4444', icon: 'UtensilsCrossed' },
  { name: 'Transportation', color: '#F59E0B', icon: 'Car' },
  { name: 'Entertainment', color: '#8B5CF6', icon: 'Gamepad2' },
  { name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Bills & Utilities', color: '#06B6D4', icon: 'Receipt' },
  { name: 'Healthcare', color: '#10B981', icon: 'Heart' },
  { name: 'Salary', color: '#22C55E', icon: 'Briefcase' },
  { name: 'Freelance', color: '#3B82F6', icon: 'Laptop' }
];

function RecentTransactionsSection({ transactions, onAddTransaction, className = '', ...props }) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`bg-white rounded-xl p-6 shadow-md ${className}`}
      {...props}
    >
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        Recent Transactions
      </h3>

      {recentTransactions.length === 0 ? (
        <EmptyState
          icon="Receipt"
          title="No transactions yet"
          message="Add your first transaction to get started"
          actionText="Add Transaction"
          onAction={onAddTransaction}
        />
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${categories.find(c => c.name === transaction.category)?.color}20` }}
                >
                  <ApperIcon
                    name={categories.find(c => c.name === transaction.category)?.icon || 'Circle'}
                    className="w-5 h-5"
                    style={{ color: categories.find(c => c.name === transaction.category)?.color }}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 break-words">
                    {transaction.description || transaction.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-error'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                <span
                  className="inline-block px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: `${categories.find(c => c.name === transaction.category)?.color}20`,
                    color: categories.find(c => c.name === transaction.category)?.color
                  }}
                >
                  {transaction.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default RecentTransactionsSection;