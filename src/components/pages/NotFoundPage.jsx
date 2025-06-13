import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ApperIcon name="Search" className="w-24 h-24 text-gray-300 mx-auto" />
        </motion.div>

        <div>
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-white hover:bg-primary/90 flex items-center justify-center space-x-2 px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Home" className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </Button>

          <Button
            onClick={() => navigate(-1)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center space-x-2 px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            <span>Go Back</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;