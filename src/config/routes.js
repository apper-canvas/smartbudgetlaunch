import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Budgets from '../pages/Budgets';
import Goals from '../pages/Goals';
import Charts from '../pages/Charts';
import NotFound from '../pages/NotFound';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  transactions: {
    id: 'transactions',
    label: 'Transactions',
    path: '/transactions',
    icon: 'Receipt',
    component: Transactions
  },
  budgets: {
    id: 'budgets',
    label: 'Budgets',
    path: '/budgets',
    icon: 'Target',
    component: Budgets
  },
  goals: {
    id: 'goals',
    label: 'Goals',
    path: '/goals',
    icon: 'TrendingUp',
    component: Goals
  },
  charts: {
    id: 'charts',
    label: 'Charts',
    path: '/charts',
    icon: 'PieChart',
    component: Charts
  },
  notFound: {
    id: 'notFound',
    label: 'Not Found',
    path: '*',
    component: NotFound
  }
};

export const routeArray = Object.values(routes);