import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';
import transactionService from '../services/api/transactionService';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Chart from 'react-apexcharts';

function Charts() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('pie');
  const [timeRange, setTimeRange] = useState('current');

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
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on time range
  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'current':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last3':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case 'last6':
        startDate = startOfMonth(subMonths(now, 5));
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Prepare data for pie chart (expenses by category)
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieChartData = {
    series: Object.values(expensesByCategory),
    options: {
      chart: {
        type: 'pie',
        height: 400,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      labels: Object.keys(expensesByCategory),
      colors: Object.keys(expensesByCategory).map(category => {
        const cat = categories.find(c => c.name === category);
        return cat?.color || '#6B7280';
      }),
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      },
      tooltip: {
        y: {
          formatter: (value) => `$${value.toLocaleString()}`
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '45%'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + '%';
        }
      }
    }
  };

  // Prepare data for line chart (income vs expenses over time)
  const getMonthlyData = () => {
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    const monthsToShow = timeRange === 'last6' ? 6 : timeRange === 'last3' ? 3 : 1;
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push(format(monthDate, 'MMM yyyy'));
      incomeData.push(monthIncome);
      expenseData.push(monthExpenses);
    }
    
    return { months, incomeData, expenseData };
  };

  const { months, incomeData, expenseData } = getMonthlyData();

  const lineChartData = {
    series: [
      {
        name: 'Income',
        data: incomeData,
        color: '#10B981'
      },
      {
        name: 'Expenses',
        data: expenseData,
        color: '#EF4444'
      }
    ],
    options: {
      chart: {
        type: 'line',
        height: 400,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        toolbar: {
          show: false
        }
      },
      xaxis: {
        categories: months,
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => `$${value.toLocaleString()}`
        }
      },
      tooltip: {
        y: {
          formatter: (value) => `$${value.toLocaleString()}`
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 6,
        hover: {
          size: 8
        }
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 5
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      }
    }
  };

  // Calculate statistics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  const timeRangeLabel = {
    current: 'Current Month',
    last3: 'Last 3 Months',
    last6: 'Last 6 Months'
  };

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
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load charts</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadTransactions}
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
            Financial Charts
          </h1>
          <p className="text-gray-600 mt-1">
            Visual insights into your spending patterns
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    chartType === 'pie'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="PieChart" className="w-4 h-4 mr-2 inline" />
                  Pie Chart
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    chartType === 'line'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="TrendingUp" className="w-4 h-4 mr-2 inline" />
                  Line Chart
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="current">Current Month</option>
              <option value="last3">Last 3 Months</option>
              <option value="last6">Last 6 Months</option>
            </select>
          </div>
        </div>
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
              <p className="text-sm text-gray-600">{timeRangeLabel[timeRange]} Income</p>
              <p className="text-2xl font-bold text-success">${totalIncome.toLocaleString()}</p>
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
              <p className="text-sm text-gray-600">{timeRangeLabel[timeRange]} Expenses</p>
              <p className="text-2xl font-bold text-error">${totalExpenses.toLocaleString()}</p>
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
              <p className={`text-2xl font-bold ${
                netAmount >= 0 ? 'text-success' : 'text-error'
              }`}>
                ${Math.abs(netAmount).toLocaleString()}
              </p>
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
      </div>

      {/* Chart Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <div className="mb-6">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
            {chartType === 'pie' ? 'Expenses by Category' : 'Income vs Expenses Trend'}
          </h3>
          <p className="text-gray-600">
            {chartType === 'pie' 
              ? `Breakdown of your expenses by category for ${timeRangeLabel[timeRange].toLowerCase()}`
              : `Monthly comparison of income and expenses over ${timeRangeLabel[timeRange].toLowerCase()}`
            }
          </p>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="BarChart3" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">Add some transactions to see your charts</p>
          </div>
        ) : chartType === 'pie' && Object.keys(expensesByCategory).length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="PieChart" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses to display</h3>
            <p className="text-gray-500">Add some expense transactions to see the pie chart</p>
          </div>
        ) : (
          <div className="h-96">
            {chartType === 'pie' ? (
              <Chart
                options={pieChartData.options}
                series={pieChartData.series}
                type="pie"
                height="100%"
              />
            ) : (
              <Chart
                options={lineChartData.options}
                series={lineChartData.series}
                type="line"
                height="100%"
              />
            )}
          </div>
        )}
      </motion.div>

      {/* Category Breakdown Table */}
      {chartType === 'pie' && Object.keys(expensesByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Category Breakdown
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount], index) => {
                    const percentage = (amount / totalExpenses) * 100;
                    const categoryData = categories.find(c => c.name === category);
                    
                    return (
                      <motion.tr
                        key={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${categoryData?.color}20` }}
                            >
                              <ApperIcon 
                                name={categoryData?.icon || 'Circle'} 
                                className="w-4 h-4"
                                style={{ color: categoryData?.color }}
                              />
                            </div>
                            <span className="font-medium text-gray-900">{category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ${amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-gray-700">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Charts;