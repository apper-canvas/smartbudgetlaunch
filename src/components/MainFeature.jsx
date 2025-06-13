import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from './ApperIcon';
import transactionService from '../services/api/transactionService';
import budgetService from '../services/api/budgetService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function MainFeature() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionData, budgetData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);
      setTransactions(transactionData);
      setBudgets(budgetData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newTransaction = await transactionService.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      setTransactions(prev => [newTransaction, ...prev]);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setShowAddForm(false);
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const recentTransactions = transactions.slice(0, 5);
  const currentMonthTotal = transactions
    .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => t.type === 'expense' ? sum - t.amount : sum + t.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <motion.p
                key={currentMonthTotal}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-gray-900 animate-count-up"
              >
                ${Math.abs(currentMonthTotal).toLocaleString()}
              </motion.p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              currentMonthTotal >= 0 ? 'bg-success/10' : 'bg-error/10'
            }`}>
              <ApperIcon 
                name={currentMonthTotal >= 0 ? "TrendingUp" : "TrendingDown"} 
                className={`w-6 h-6 ${currentMonthTotal >= 0 ? 'text-success' : 'text-error'}`} 
              />
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
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Receipt" className="w-6 h-6 text-info" />
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
              <p className="text-sm text-gray-600">Active Budgets</p>
              <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Target" className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Transaction Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full bg-primary text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <ApperIcon name="Plus" className="w-5 h-5" />
        <span className="font-medium">Add New Transaction</span>
      </motion.button>

      {/* Add Transaction Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Category</option>
                  {categories
                    .filter(cat => formData.type === 'income' ? 
                      ['Salary', 'Freelance'].includes(cat.name) : 
                      !['Salary', 'Freelance'].includes(cat.name))
                    .map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Optional description"
              />
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-all"
              >
                Add Transaction
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <ApperIcon name="Receipt" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => {
              const category = categories.find(c => c.name === transaction.category);
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      <ApperIcon 
                        name={category?.icon || 'Circle'} 
                        className="w-5 h-5"
                        style={{ color: category?.color }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description || transaction.category}</p>
                      <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
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
                        backgroundColor: `${category?.color}20`,
                        color: category?.color 
                      }}
                    >
                      {transaction.category}
                    </span>
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

export default MainFeature;