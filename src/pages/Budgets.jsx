import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';
import budgetService from '../services/api/budgetService';
import transactionService from '../services/api/transactionService';
import { toast } from 'react-toastify';
import { startOfMonth, endOfMonth } from 'date-fns';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  const categories = [
    { name: 'Food & Dining', color: '#EF4444', icon: 'UtensilsCrossed' },
    { name: 'Transportation', color: '#F59E0B', icon: 'Car' },
    { name: 'Entertainment', color: '#8B5CF6', icon: 'Gamepad2' },
    { name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag' },
    { name: 'Bills & Utilities', color: '#06B6D4', icon: 'Receipt' },
    { name: 'Healthcare', color: '#10B981', icon: 'Heart' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [budgetData, transactionData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);
      setBudgets(budgetData);
      setTransactions(transactionData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.category === formData.category && b.id !== editingBudget?.id);
    if (existingBudget) {
      toast.error('Budget already exists for this category');
      return;
    }

    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        spent: 0
      };

      if (editingBudget) {
        const updated = await budgetService.update(editingBudget.id, budgetData);
        setBudgets(prev => prev.map(b => b.id === editingBudget.id ? updated : b));
        toast.success('Budget updated successfully!');
        setEditingBudget(null);
      } else {
        const newBudget = await budgetService.create(budgetData);
        setBudgets(prev => [...prev, newBudget]);
        toast.success('Budget created successfully!');
      }
      
      resetForm();
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setShowAddForm(true);
  };

  const handleDelete = async (budget) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await budgetService.delete(budget.id);
      setBudgets(prev => prev.filter(b => b.id !== budget.id));
      toast.success('Budget deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      period: 'monthly'
    });
    setShowAddForm(false);
    setEditingBudget(null);
  };

  // Calculate current month spending for each budget
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd && t.type === 'expense';
  });

  const budgetsWithSpent = budgets.map(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      spent,
      percentage,
      remaining: budget.amount - spent,
      status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
    };
  });

  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgetAmount - totalSpent;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load budgets</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Budget Management
          </h1>
          <p className="text-gray-600 mt-1">
            Set and track your spending limits by category
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span className="font-medium">Add Budget</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-primary">${totalBudgetAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Target" className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-error">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="CreditCard" className="w-6 h-6 text-error" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${
                totalRemaining >= 0 ? 'text-success' : 'text-error'
              }`}>
                ${Math.abs(totalRemaining).toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              totalRemaining >= 0 ? 'bg-success/10' : 'bg-error/10'
            }`}>
              <ApperIcon 
                name={totalRemaining >= 0 ? "PiggyBank" : "AlertTriangle"} 
                className={`w-6 h-6 ${totalRemaining >= 0 ? 'text-success' : 'text-error'}`} 
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Budget Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-gray-900">
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-all"
                >
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Cards */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-heading font-semibold text-gray-900">
            Budget Categories ({budgets.length})
          </h3>
        </div>
        
        {budgetsWithSpent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ApperIcon name="Target" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets created yet</h3>
            <p className="text-gray-500 mb-4">Set up budgets to track your spending by category</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your First Budget
            </motion.button>
          </motion.div>
        ) : (
          <div className="p-6 space-y-6">
            {budgetsWithSpent.map((budget, index) => {
              const category = categories.find(c => c.name === budget.category);
              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        <ApperIcon 
                          name={category?.icon || 'Circle'} 
                          className="w-6 h-6"
                          style={{ color: category?.color }}
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{budget.category}</h4>
                        <p className="text-sm text-gray-600 capitalize">{budget.period}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(budget)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(budget)}
                        className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center md:text-left">
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="text-xl font-bold text-primary">${budget.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-sm text-gray-600">Spent</p>
                      <p className="text-xl font-bold text-error">${budget.spent.toLocaleString()}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className={`text-xl font-bold ${
                        budget.remaining >= 0 ? 'text-success' : 'text-error'
                      }`}>
                        ${Math.abs(budget.remaining).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className={`text-sm font-medium ${
                        budget.status === 'over' ? 'text-error' :
                        budget.status === 'warning' ? 'text-warning' : 'text-success'
                      }`}>
                        {budget.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        className={`h-3 rounded-full transition-all duration-300 ${
                          budget.status === 'over' ? 'bg-error' :
                          budget.status === 'warning' ? 'bg-warning' : 'bg-success'
                        }`}
                      />
                    </div>
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
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Budgets;