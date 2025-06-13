import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import transactionService from '@/services/api/transactionService';
import budgetService from '@/services/api/budgetService';
import goalService from '@/services/api/goalService';

import ErrorState from '@/components/molecules/ErrorState';
import FinancialSummaryCards from '@/components/organisms/FinancialSummaryCards';
import RecentTransactionsSection from '@/components/organisms/RecentTransactionsSection';
import BudgetStatusSection from '@/components/organisms/BudgetStatusSection';
import GoalsOverviewSection from '@/components/organisms/GoalsOverviewSection';
import TransactionForm from '@/components/organisms/TransactionForm'; // For adding transactions from dashboard
import { allCategories } from '@/utils/constants'; // Assuming this constant will be created or used globally

function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false); // For "Add New Transaction" button

  const [newTransactionFormData, setNewTransactionFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

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

  const handleAddTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!newTransactionFormData.amount || !newTransactionFormData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newTransaction = await transactionService.create({
        ...newTransactionFormData,
        amount: parseFloat(newTransactionFormData.amount)
      });

      setTransactions(prev => [newTransaction, ...prev]);
      setNewTransactionFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setShowAddTransactionForm(false);
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const resetTransactionForm = () => {
    setNewTransactionFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowAddTransactionForm(false);
  };

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

  // Calculate budget progress for current month
  const budgetsWithSpent = budgets.map(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
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
    return <ErrorState message="Failed to load dashboard" details={error} onRetry={loadData} />;
  }

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

      <FinancialSummaryCards
        income={monthlyIncome}
        expenses={monthlyExpenses}
        netAmount={netAmount}
        totalTransactions={currentMonthTransactions.length}
        timeRangeLabel="Monthly"
      />

      {/* Add Transaction Button from MainFeature */}
      <Button
        onClick={() => setShowAddTransactionForm(!showAddTransactionForm)}
        className="w-full bg-primary text-white p-4 shadow-lg hover:shadow-xl duration-200 flex items-center justify-center space-x-2"
      >
        <ApperIcon name="Plus" className="w-5 h-5" />
        <span className="font-medium">Add New Transaction</span>
      </Button>

      {/* Add Transaction Form from MainFeature */}
      <TransactionForm
        isOpen={showAddTransactionForm}
        onClose={resetTransactionForm}
        onSubmit={handleAddTransactionSubmit}
        formData={newTransactionFormData}
        setFormData={setNewTransactionFormData}
        editingTransaction={null} // Always adding, not editing here
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetStatusSection budgets={budgetsWithSpent} onAddBudget={() => toast.info("Navigate to Budgets page to add new budgets")} />
        <RecentTransactionsSection transactions={transactions} onAddTransaction={() => setShowAddTransactionForm(true)} />
      </div>

      <GoalsOverviewSection goals={goals} onAddGoal={() => toast.info("Navigate to Goals page to add new goals")} />
    </div>
  );
}

export default DashboardPage;