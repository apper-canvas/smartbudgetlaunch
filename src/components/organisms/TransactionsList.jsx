import { motion } from 'framer-motion';
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

function TransactionsList({
  transactions,
  searchTerm,
  filterType,
  filterCategory,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  className = '',
  ...props
}) {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`} {...props}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-heading font-semibold text-gray-900">
          All Transactions ({transactions.length})
        </h3>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon="Receipt"
          title="No transactions found"
          message={
            searchTerm || filterType !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first transaction to get started'
          }
          actionText="Add Transaction"
          onAction={onAddTransaction}
        />
      ) : (
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {transactions.map((transaction, index) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              index={index}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionsList;