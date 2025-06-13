function CategoryChip({ category, categories, className = '' }) {
  const categoryData = categories.find(c => c.name === category);
  if (!categoryData) return null;

  return (
    <span
      className={`inline-block px-2 py-1 text-xs rounded-full ${className}`}
      style={{
        backgroundColor: `${categoryData.color}20`,
        color: categoryData.color
      }}
    >
      {category}
    </span>
  );
}

export default CategoryChip;