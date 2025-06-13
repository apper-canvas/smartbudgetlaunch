import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';

const allCategories = [
  { name: 'Food & Dining' }, { name: 'Transportation' }, { name: 'Entertainment' },
  { name: 'Shopping' }, { name: 'Bills & Utilities' }, { name: 'Healthcare' },
  { name: 'Salary' }, { name: 'Freelance' }
];

function TransactionFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  className = '',
  ...props
}) {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...allCategories.map(cat => ({ value: cat.name, label: cat.name }))
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'category', label: 'Category' }
  ];

  return (
    <div className={`bg-white rounded-xl p-6 shadow-md ${className}`} {...props}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2"
              placeholder="Search transactions..."
            />
          </div>
        </div>

        <Select
          label="Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={typeOptions}
          className="px-4 py-2"
        />

        <Select
          label="Category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={categoryOptions}
          className="px-4 py-2"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <div className="flex space-x-2">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              className="flex-1 px-4 py-2"
            />
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name={sortOrder === 'asc' ? "ArrowUp" : "ArrowDown"} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionFilters;