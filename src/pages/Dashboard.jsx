import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';
import transactionService from '../services/api/transactionService';
import budgetService from '../services/api/budgetService';
import goalService from '../services/api/goalService';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth } from 'date-fns';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setError(null);
    try {
      const [transactionData, budgetData, goalData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll()
      ]);
      setTransactions(transactionData);
      setBudgets(budgetData);
      setGoals(goalData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
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

  // Calculate current month data
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = monthlyIncome - monthlyExpenses;
  const recentTransactions = transactions.slice(0, 5);

  // Calculate budget progress
  const budgetProgress = budgets.map(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      ...budget,
      spent,
      percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {format(new Date(), 'MMMM yyyy')} Overview
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <motion.p
                key={monthlyIncome}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-success animate-count-up"
              >
                ${monthlyIncome.toLocaleString()}
              </motion.p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-success" />
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
              <p className="text-sm text-gray-600">Monthly Expenses</p>
              <motion.p
                key={monthlyExpenses}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-error animate-count-up"
              >
                ${monthlyExpenses.toLocaleString()}
              </motion.p>
            </div>
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingDown" className="w-6 h-6 text-error" />
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
              <p className="text-sm text-gray-600">Net Amount</p>
              <motion.p
                key={netAmount}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`text-2xl font-bold animate-count-up ${
                  netAmount >= 0 ? 'text-success' : 'text-error'
                }`}
              >
                ${Math.abs(netAmount).toLocaleString()}
              </motion.p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              netAmount >= 0 ? 'bg-success/10' : 'bg-error/10'
            }`}>
              <ApperIcon 
                name={netAmount >= 0 ? "PiggyBank" : "AlertTriangle"} 
                className={`w-6 h-6 ${netAmount >= 0 ? 'text-success' : 'text-error'}`} 
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-info">{currentMonthTransactions.length}</p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Receipt" className="w-6 h-6 text-info" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Budget Status
          </h3>
          
          {budgetProgress.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Target" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No budgets set</p>
              <p className="text-sm text-gray-400">Create budgets to track your spending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetProgress.slice(0, 4).map((budget, index) => {
                const category = categories.find(c => c.name === budget.category);
                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          <ApperIcon 
                            name={category?.icon || 'Circle'} 
                            className="w-4 h-4"
                            style={{ color: category?.color }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">{budget.category}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        className={`h-2 rounded-full ${
                          budget.percentage > 100 ? 'bg-error' :
                          budget.percentage > 80 ? 'bg-warning' : 'bg-success'
                        }`}
                      />
                    </div>
                    {budget.percentage > 100 && (
                      <p className="text-xs text-error mt-1">Over budget by ${(budget.spent - budget.amount).toLocaleString()}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
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
                    transition={{ delay: 0.1 * index }}
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
                        <p className="font-medium text-gray-900 break-words">
                          {transaction.description || transaction.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-error'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Goals Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Savings Goals
        </h3>
        
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <ApperIcon name="Target" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No savings goals set</p>
            <p className="text-sm text-gray-400">Create goals to track your progress</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.slice(0, 3).map((goal, index) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 break-words">{goal.name}</h4>
                    <ApperIcon name="Target" className="w-5 h-5 text-accent" />
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>${goal.currentAmount.toLocaleString()}</span>
                      <span>${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        className="bg-accent h-2 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-accent font-medium">{progress.toFixed(1)}%</span>
                    <span className={`${daysLeft > 0 ? 'text-gray-600' : 'text-error'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;