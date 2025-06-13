import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import CategoryChip from '@/components/molecules/CategoryChip';
import Button from '@/components/atoms/Button';
import { format } from 'date-fns';

function TransactionItem({ transaction, categories, index = 0, onEdit, onDelete, ...props }) {
  const category = categories.find(c => c.name === transaction.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="px-6 py-4 hover:bg-gray-50 transition-colors"
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${category?.color}20` }}
          >
            <ApperIcon
              name={category?.icon || 'Circle'}
              className="w-6 h-6"
              style={{ color: category?.color }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 break-words">
              {transaction.description || transaction.category}
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <CategoryChip category={transaction.category} categories={categories} />
              <span className="text-sm text-gray-500">
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="text-right">
            <p className={`text-lg font-semibold ${
              transaction.type === 'income' ? 'text-success' : 'text-error'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 capitalize">{transaction.type}</p>
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                onClick={() => onEdit(transaction)}
                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ApperIcon name="Edit" className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(transaction)}
                className="p-2 text-gray-400 hover:text-error hover:bg-error/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TransactionItem;