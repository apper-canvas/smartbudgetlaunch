import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';
import goalService from '../services/api/goalService';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      setError(err.message || 'Failed to load goals');
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      toast.error('Target amount must be greater than 0');
      return;
    }

    if (new Date(formData.deadline) <= new Date()) {
      toast.error('Deadline must be in the future');
      return;
    }

    try {
      const goalData = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        deadline: formData.deadline
      };

      if (editingGoal) {
        const updated = await goalService.update(editingGoal.id, goalData);
        setGoals(prev => prev.map(g => g.id === editingGoal.id ? updated : g));
        toast.success('Goal updated successfully!');
        setEditingGoal(null);
      } else {
        const newGoal = await goalService.create(goalData);
        setGoals(prev => [...prev, newGoal]);
        toast.success('Goal created successfully!');
      }
      
      resetForm();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid contribution amount');
      return;
    }

    try {
      const newAmount = selectedGoal.currentAmount + parseFloat(contributionAmount);
      const updated = await goalService.update(selectedGoal.id, {
        ...selectedGoal,
        currentAmount: newAmount
      });
      
      setGoals(prev => prev.map(g => g.id === selectedGoal.id ? updated : g));
      toast.success(`$${parseFloat(contributionAmount).toLocaleString()} contributed to ${selectedGoal.name}!`);
      setShowContributeModal(false);
      setSelectedGoal(null);
      setContributionAmount('');
    } catch (error) {
      toast.error('Failed to add contribution');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: format(new Date(goal.deadline), 'yyyy-MM-dd')
    });
    setShowAddForm(true);
  };

  const handleDelete = async (goal) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalService.delete(goal.id);
      setGoals(prev => prev.filter(g => g.id !== goal.id));
      toast.success('Goal deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const openContributeModal = (goal) => {
    setSelectedGoal(goal);
    setShowContributeModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    });
    setShowAddForm(false);
    setEditingGoal(null);
  };

  // Calculate goal statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const goalsWithProgress = goals.map(goal => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
    const isCompleted = goal.currentAmount >= goal.targetAmount;
    const isOverdue = daysLeft < 0 && !isCompleted;
    
    return {
      ...goal,
      progress,
      daysLeft,
      isCompleted,
      isOverdue,
      status: isCompleted ? 'completed' : isOverdue ? 'overdue' : daysLeft <= 30 ? 'urgent' : 'on-track'
    };
  });

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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load goals</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadGoals}
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
            Savings Goals
          </h1>
          <p className="text-gray-600 mt-1">
            Track your progress towards financial objectives
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span className="font-medium">Add Goal</span>
        </motion.button>
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
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-primary">{totalGoals}</p>
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
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-success">{completedGoals}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="w-6 h-6 text-success" />
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
              <p className="text-sm text-gray-600">Total Target</p>
              <p className="text-2xl font-bold text-secondary">${totalTargetAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Flag" className="w-6 h-6 text-secondary" />
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
              <p className="text-sm text-gray-600">Total Saved</p>
              <p className="text-2xl font-bold text-accent">${totalSaved.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="PiggyBank" className="w-6 h-6 text-accent" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Goal Form */}
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
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-all"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
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

      {/* Goals List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-heading font-semibold text-gray-900">
            Your Goals ({goals.length})
          </h3>
        </div>
        
        {goalsWithProgress.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ApperIcon name="Target" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals created yet</h3>
            <p className="text-gray-500 mb-4">Start by creating your first savings goal</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your First Goal
            </motion.button>
          </motion.div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goalsWithProgress.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-200 border-l-4 ${
                  goal.status === 'completed' ? 'border-success' :
                  goal.status === 'overdue' ? 'border-error' :
                  goal.status === 'urgent' ? 'border-warning' : 'border-primary'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 break-words mb-1">
                      {goal.name}
                    </h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        goal.status === 'completed' ? 'bg-success/20 text-success' :
                        goal.status === 'overdue' ? 'bg-error/20 text-error' :
                        goal.status === 'urgent' ? 'bg-warning/20 text-warning' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {goal.status === 'completed' ? 'Completed' :
                         goal.status === 'overdue' ? 'Overdue' :
                         goal.status === 'urgent' ? 'Urgent' : 'On Track'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {goal.isCompleted ? 'Goal achieved!' : 
                         goal.isOverdue ? `${Math.abs(goal.daysLeft)} days overdue` :
                         `${goal.daysLeft} days left`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!goal.isCompleted && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openContributeModal(goal)}
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all"
                        title="Add contribution"
                      >
                        <ApperIcon name="Plus" className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(goal)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Current</p>
                    <p className="text-xl font-bold text-accent">${goal.currentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="text-xl font-bold text-secondary">${goal.targetAmount.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className={`text-sm font-medium ${
                      goal.isCompleted ? 'text-success' : 'text-gray-900'
                    }`}>
                      {Math.min(goal.progress, 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(goal.progress, 100)}%` }}
                      transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                      className={`h-3 rounded-full ${
                        goal.isCompleted ? 'bg-success' :
                        goal.status === 'overdue' ? 'bg-error' :
                        goal.status === 'urgent' ? 'bg-warning' : 'bg-accent'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Target Date</span>
                    <span>{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                  </div>
                  {goal.isCompleted && (
                    <div className="mt-2 flex items-center text-success text-sm">
                      <ApperIcon name="CheckCircle" className="w-4 h-4 mr-1" />
                      Goal achieved! 🎉
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Contribute Modal */}
      <AnimatePresence>
        {showContributeModal && selectedGoal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowContributeModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading font-semibold text-gray-900">
                    Add Contribution
                  </h3>
                  <button
                    onClick={() => setShowContributeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 break-words">{selectedGoal.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Current: ${selectedGoal.currentAmount.toLocaleString()} / ${selectedGoal.targetAmount.toLocaleString()}
                  </p>
                </div>
                
                <form onSubmit={handleContribute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contribution Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="0.00"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-all"
                    >
                      Add Contribution
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowContributeModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Goals;