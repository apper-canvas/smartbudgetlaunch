function Input({ type = 'text', className = '', label, id, ...props }) {
  const inputClass = `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`;

  if (label) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input id={id} type={type} className={inputClass} {...props} />
      </div>
    );
  }

  return <input type={type} className={inputClass} {...props} />;
}

export default Input;