import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { startOfMonth, endOfMonth } from 'date-fns';

import budgetService from '@/services/api/budgetService';
import transactionService from '@/services/api/transactionService';

import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import ErrorState from '@/components/molecules/ErrorState';
import FinancialSummaryCards from '@/components/organisms/FinancialSummaryCards';
import BudgetForm from '@/components/organisms/BudgetForm';
import BudgetsList from '@/components/organisms/BudgetsList';

function BudgetsPage() {
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

  // These are the only categories applicable for budgeting in the original code.
  // Income categories are not typically budgeted against in the same way.
  const expenseCategories = [
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
    return <ErrorState message="Failed to load budgets" details={error} onRetry={loadData} />;
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
        <Button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 bg-primary text-white px-6 py-3 shadow-lg hover:shadow-xl duration-200 flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span className="font-medium">Add Budget</span>
        </Button>
      </div>

      <FinancialSummaryCards
        income={totalBudgetAmount} // Re-purposing income for total budget
        expenses={totalSpent}
        netAmount={totalRemaining}
        timeRangeLabel="Budget"
        iconMap={{
          income: "Target",
          expenses: "CreditCard",
          netAmount: totalRemaining >= 0 ? "PiggyBank" : "AlertTriangle"
        }}
        incomeColor="text-primary"
        incomeBgColor="#6366F1"
        expenseColor="text-error"
        expenseBgColor="#EF4444"
      />

      <BudgetForm
        isOpen={showAddForm}
        onClose={resetForm}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingBudget={editingBudget}
      />

      <BudgetsList
        budgetsWithSpent={budgetsWithSpent}
        onAddBudget={() => setShowAddForm(true)}
        onEditBudget={handleEdit}
        onDeleteBudget={handleDelete}
      />
    </div>
  );
}

export default BudgetsPage;