import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import transactionService from '@/services/api/transactionService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import ErrorState from '@/components/molecules/ErrorState';
import FinancialSummaryCards from '@/components/organisms/FinancialSummaryCards';
import TransactionForm from '@/components/organisms/TransactionForm';
import TransactionFilters from '@/components/organisms/TransactionFilters';
import TransactionsList from '@/components/organisms/TransactionsList';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const categories = [
    { name: 'Food & Dining', color: '#EF4444', icon: 'UtensilsCrossed', type: 'expense' },
    { name: 'Transportation', color: '#F59E0B', icon: 'Car', type: 'expense' },
    { name: 'Entertainment', color: '#8B5CF6', icon: 'Gamepad2', type: 'expense' },
    { name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag', type: 'expense' },
    { name: 'Bills & Utilities', color: '#06B6D4', icon: 'Receipt', type: 'expense' },
    { name: 'Healthcare', color: '#10B981', icon: 'Heart', type: 'expense' },
    { name: 'Salary', color: '#22C55E', icon: 'Briefcase', type: 'income' },
    { name: 'Freelance', color: '#3B82F6', icon: 'Laptop', type: 'income' }
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
      toast.error('Failed to load transactions');
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
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingTransaction) {
        const updated = await transactionService.update(editingTransaction.id, transactionData);
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updated : t));
        toast.success('Transaction updated successfully!');
        setEditingTransaction(null);
      } else {
        const newTransaction = await transactionService.create(transactionData);
        setTransactions(prev => [newTransaction, ...prev]);
        toast.success('Transaction added successfully!');
      }

      resetForm();
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd')
    });
    setShowAddForm(true);
  };

  const handleDelete = async (transaction) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await transactionService.delete(transaction.id);
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      toast.success('Transaction deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowAddForm(false);
    setEditingTransaction(null);
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        </div>

        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load transactions" details={error} onRetry={loadTransactions} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Transactions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your income and expenses
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 bg-primary text-white px-6 py-3 shadow-lg hover:shadow-xl duration-200 flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span className="font-medium">Add Transaction</span>
        </Button>
      </div>

      <FinancialSummaryCards
        income={totalIncome}
        expenses={totalExpenses}
        netAmount={netAmount}
        totalTransactions={filteredTransactions.length}
        timeRangeLabel="Total"
      />

      <TransactionForm
        isOpen={showAddForm}
        onClose={resetForm}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingTransaction={editingTransaction}
      />

      <TransactionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <TransactionsList
        transactions={filteredTransactions}
        searchTerm={searchTerm}
        filterType={filterType}
        filterCategory={filterCategory}
        onAddTransaction={() => setShowAddForm(true)}
        onEditTransaction={handleEdit}
        onDeleteTransaction={handleDelete}
      />
    </div>
  );
}

export default TransactionsPage;