import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';

import goalService from '@/services/api/goalService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import Modal from '@/components/molecules/Modal';
import ErrorState from '@/components/molecules/ErrorState';
import GoalsList from '@/components/organisms/GoalsList';
import GoalForm from '@/components/organisms/GoalForm';

function GoalsPage() {
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

  const totalGoals = goals.length;
  const completedGoals = goalsWithProgress.filter(g => g.isCompleted).length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

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
    return <ErrorState message="Failed to load goals" details={error} onRetry={loadGoals} />;
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
        <Button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 bg-primary text-white px-6 py-3 shadow-lg hover:shadow-xl duration-200 flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span className="font-medium">Add Goal</span>
        </Button>
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

      <GoalForm
        isOpen={showAddForm}
        onClose={resetForm}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingGoal={editingGoal}
      />

      <GoalsList
        goalsWithProgress={goalsWithProgress}
        onAddGoal={() => setShowAddForm(true)}
        onEditGoal={handleEdit}
        onDeleteGoal={handleDelete}
        onContribute={openContributeModal}
      />

      <Modal isOpen={showContributeModal && !!selectedGoal} onClose={() => setShowContributeModal(false)} title="Add Contribution">
        {selectedGoal && (
          <form onSubmit={handleContribute} className="space-y-4">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 break-words">{selectedGoal.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Current: ${selectedGoal.currentAmount.toLocaleString()} / ${selectedGoal.targetAmount.toLocaleString()}
              </p>
            </div>
            <FormField
              label="Contribution Amount"
              id="contributionAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              placeholder="0.00"
              required
              autoFocus
            />
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-accent text-white hover:bg-accent/90"
              >
                Add Contribution
              </Button>
              <Button
                type="button"
                onClick={() => setShowContributeModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default GoalsPage;