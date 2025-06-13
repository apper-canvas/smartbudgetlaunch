import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routes, routeArray } from './config/routes';

function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const navItems = routeArray.filter(route => route.id !== 'notFound' && !route.hidden);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold text-gray-900">SmartBudget</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 z-40">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <ApperIcon name="DollarSign" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-gray-900">SmartBudget</h1>
                <p className="text-sm text-gray-500">Personal Finance</p>
              </div>
            </div>
          </div>
          
          <nav className="p-6 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <NavLink
to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-primary text-white shadow-md border-l-4 border-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-[1.02]'
                      }`
                    }
                  >
                    <ApperIcon 
                      name={item.icon} 
                      className="w-5 h-5 mr-3 flex-shrink-0" 
                    />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                      <ApperIcon name="DollarSign" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-heading font-bold text-gray-900">SmartBudget</h1>
                      <p className="text-sm text-gray-500">Personal Finance</p>
                    </div>
                  </div>
                </div>
                
                <nav className="p-6">
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.id}>
                        <NavLink
to={item.path}
                          className={({ isActive }) =>
                            `group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                              isActive
                                ? 'bg-primary text-white shadow-md border-l-4 border-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`
                          }
                        >
                          <ApperIcon 
                            name={item.icon} 
                            className="w-5 h-5 mr-3 flex-shrink-0" 
                          />
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden flex-shrink-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
        <div className="flex justify-around">
{navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <ApperIcon name={item.icon} className="w-5 h-5 mb-1" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Layout;