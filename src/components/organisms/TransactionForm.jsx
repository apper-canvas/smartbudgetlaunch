import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const allCategories = [
  { name: 'Food & Dining', type: 'expense' },
  { name: 'Transportation', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Bills & Utilities', type: 'expense' },
  { name: 'Healthcare', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Freelance', type: 'income' }
];

function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingTransaction,
  className = '',
  ...props
}) {
  const filteredCategories = allCategories
    .filter(cat => cat.type === formData.type)
    .map(cat => ({ value: cat.name, label: cat.name }));

  const categoryOptions = [{ value: '', label: 'Select Category', disabled: true }, ...filteredCategories];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'type' && !filteredCategories.some(cat => cat.value === prev.category)) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 ${className}`}
          {...props}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-gray-900">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            <Button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Amount"
                id="amount"
                type="number"
                name="amount"
                step="0.01"
                value={formData.amount}
                onChange={handleFormChange}
                placeholder="0.00"
                required
              />
              <FormField
                label="Type"
                id="type"
                type="select"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                options={[
                  { value: 'expense', label: 'Expense' },
                  { value: 'income', label: 'Income' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Category"
                id="category"
                type="select"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                options={categoryOptions}
                required
              />
              <FormField
                label="Date"
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                required
              />
            </div>

            <FormField
              label="Description"
              id="description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Optional description"
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TransactionForm;