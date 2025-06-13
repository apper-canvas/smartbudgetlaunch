import { motion } from 'framer-motion';
import Chart from 'react-apexcharts'; // Keep this import as it's an existing dependency
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import EmptyState from '@/components/molecules/EmptyState';

function ChartPanel({
  chartType,
  setChartType,
  timeRange,
  setTimeRange,
  pieChartData,
  lineChartData,
  filteredTransactionsLength,
  expensesByCategoryLength,
  timeRangeLabel,
  className = '',
  ...props
}) {
  const chartTitle = chartType === 'pie' ? 'Expenses by Category' : 'Income vs Expenses Trend';
  const chartDescription =
    chartType === 'pie'
      ? `Breakdown of your expenses by category for ${timeRangeLabel.toLowerCase()}`
      : `Monthly comparison of income and expenses over ${timeRangeLabel.toLowerCase()}`;

  const chartContent = () => {
    if (filteredTransactionsLength === 0) {
      return (
        <EmptyState
          icon="BarChart3"
          title="No data available"
          message="Add some transactions to see your charts"
        />
      );
    }
    if (chartType === 'pie' && expensesByCategoryLength === 0) {
      return (
        <EmptyState
          icon="PieChart"
          title="No expenses to display"
          message="Add some expense transactions to see the pie chart"
        />
      );
    }
    return (
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
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`bg-white rounded-xl p-6 shadow-md ${className}`}
      {...props}
    >
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
          {chartTitle}
        </h3>
        <p className="text-gray-600">
          {chartDescription}
        </p>
      </div>

      <div className="bg-white rounded-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    chartType === 'pie'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="PieChart" className="w-4 h-4 mr-2 inline" />
                  Pie Chart
                </Button>
                <Button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    chartType === 'line'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="TrendingUp" className="w-4 h-4 mr-2 inline" />
                  Line Chart
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Select
              label="Time Range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={[
                { value: 'current', label: 'Current Month' },
                { value: 'last3', label: 'Last 3 Months' },
                { value: 'last6', label: 'Last 6 Months' }
              ]}
              className="px-4 py-2"
            />
          </div>
        </div>
      </div>

      {chartContent()}
    </motion.div>
  );
}

export default ChartPanel;