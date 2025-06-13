import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const chartCategories = [
  { name: 'Food & Dining', color: '#EF4444', icon: 'UtensilsCrossed' },
  { name: 'Transportation', color: '#F59E0B', icon: 'Car' },
  { name: 'Entertainment', color: '#8B5CF6', icon: 'Gamepad2' },
  { name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag' },
  { name: 'Bills & Utilities', color: '#06B6D4', icon: 'Receipt' },
  { name: 'Healthcare', color: '#10B981', icon: 'Heart' },
  { name: 'Salary', color: '#22C55E', icon: 'Briefcase' },
  { name: 'Freelance', color: '#3B82F6', icon: 'Laptop' }
];

function CategoryBreakdownTable({ expensesByCategory, totalExpenses, className = '', ...props }) {
  if (Object.keys(expensesByCategory).length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`bg-white rounded-xl p-6 shadow-md ${className}`}
      {...props}
    >
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        Category Breakdown
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount], index) => {
                const percentage = (amount / totalExpenses) * 100;
                const categoryData = chartCategories.find(c => c.name === category);

                return (
                  <motion.tr
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${categoryData?.color}20` }}
                        >
                          <ApperIcon
                            name={categoryData?.icon || 'Circle'}
                            className="w-4 h-4"
                            style={{ color: categoryData?.color }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">{category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      ${amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default CategoryBreakdownTable;