import { AnimatePresence, motion } from 'framer-motion';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const expenseCategories = [
  { name: 'Food & Dining' },
  { name: 'Transportation' },
  { name: 'Entertainment' },
  { name: 'Shopping' },
  { name: 'Bills & Utilities' },
  { name: 'Healthcare' }
];

function BudgetForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingBudget,
  className = '',
  ...props
}) {
  const categoryOptions = [
    { value: '', label: 'Select Category', disabled: true },
    ...expenseCategories.map(cat => ({ value: cat.name, label: cat.name }))
  ];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              {editingBudget ? 'Edit Budget' : 'Add New Budget'}
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
                label="Budget Amount"
                id="amount"
                type="number"
                name="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleFormChange}
                placeholder="0.00"
                required
              />
            </div>

            <FormField
              label="Period"
              id="period"
              type="select"
              name="period"
              value={formData.period}
              onChange={handleFormChange}
              options={[{ value: 'monthly', label: 'Monthly' }]}
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                {editingBudget ? 'Update Budget' : 'Create Budget'}
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

export default BudgetForm;