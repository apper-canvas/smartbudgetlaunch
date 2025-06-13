import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

function FormField({ label, id, type = 'text', options, required = false, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      {type === 'select' ? (
        <Select id={id} options={options} required={required} {...props} />
      ) : (
        <Input id={id} type={type} required={required} {...props} />
      )}
    </div>
  );
}

export default FormField;