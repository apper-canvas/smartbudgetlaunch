import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

import transactionService from '@/services/api/transactionService';
import ErrorState from '@/components/molecules/ErrorState';
import FinancialSummaryCards from '@/components/organisms/FinancialSummaryCards';
import ChartPanel from '@/components/organisms/ChartPanel';
import CategoryBreakdownTable from '@/components/organisms/CategoryBreakdownTable';

function ChartsPage() {
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

  const timeRangeLabelMap = {
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
    return <ErrorState message="Failed to load charts" details={error} onRetry={loadTransactions} />;
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

      <FinancialSummaryCards
        income={totalIncome}
        expenses={totalExpenses}
        netAmount={netAmount}
        timeRangeLabel={timeRangeLabelMap[timeRange]}
      />

      <ChartPanel
        chartType={chartType}
        setChartType={setChartType}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        pieChartData={pieChartData}
        lineChartData={lineChartData}
        filteredTransactionsLength={filteredTransactions.length}
        expensesByCategoryLength={Object.keys(expensesByCategory).length}
        timeRangeLabel={timeRangeLabelMap[timeRange]}
      />

      {chartType === 'pie' && (
        <CategoryBreakdownTable
          expensesByCategory={expensesByCategory}
          totalExpenses={totalExpenses}
        />
      )}
    </div>
  );
}

export default ChartsPage;