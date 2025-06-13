import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

function GoalForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingGoal,
  className = '',
  ...props
}) {
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
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
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
            <FormField
              label="Goal Name"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Target Amount"
                id="targetAmount"
                type="number"
                name="targetAmount"
                step="0.01"
                min="0"
                value={formData.targetAmount}
                onChange={handleFormChange}
                placeholder="0.00"
                required
              />
              <FormField
                label="Current Amount"
                id="currentAmount"
                type="number"
                name="currentAmount"
                step="0.01"
                min="0"
                value={formData.currentAmount}
                onChange={handleFormChange}
                placeholder="0.00"
              />
            </div>

            <FormField
              label="Target Date"
              id="deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleFormChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
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

export default GoalForm;