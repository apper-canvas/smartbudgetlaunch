import StatCard from '@/components/molecules/StatCard';

const FinancialSummaryCards = ({
  income,
  expenses,
  netAmount,
  totalTransactions,
  timeRangeLabel = 'Current Month',
  className = '',
  ...props
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${className}`} {...props}>
      <StatCard
        title={`${timeRangeLabel} Income`}
        value={`$${income.toLocaleString()}`}
        icon="TrendingUp"
        iconBgColor="#10B981"
        iconColor="#10B981"
        valueColor="text-success"
        delay={0}
      />
      <StatCard
        title={`${timeRangeLabel} Expenses`}
        value={`$${expenses.toLocaleString()}`}
        icon="TrendingDown"
        iconBgColor="#EF4444"
        iconColor="#EF4444"
        valueColor="text-error"
        delay={0.1}
      />
      <StatCard
        title="Net Amount"
        value={`$${Math.abs(netAmount).toLocaleString()}`}
        icon={netAmount >= 0 ? "PiggyBank" : "AlertTriangle"}
        iconBgColor={netAmount >= 0 ? "#10B981" : "#EF4444"}
        iconColor={netAmount >= 0 ? "#10B981" : "#EF4444"}
        valueColor={netAmount >= 0 ? 'text-success' : 'text-error'}
        delay={0.2}
      />
      {totalTransactions !== undefined && (
        <StatCard
          title="Total Transactions"
          value={totalTransactions}
          icon="Receipt"
          iconBgColor="#6366F1"
          iconColor="#6366F1"
          valueColor="text-info"
          delay={0.3}
        />
      )}
    </div>
  );
};

export default FinancialSummaryCards;