import DashboardPage from '@/components/pages/DashboardPage';
import TransactionsPage from '@/components/pages/TransactionsPage';
import BudgetsPage from '@/components/pages/BudgetsPage';
import GoalsPage from '@/components/pages/GoalsPage';
import ChartsPage from '@/components/pages/ChartsPage';
import NotFoundPage from '@/components/pages/NotFoundPage';
import HomePage from '@/components/pages/HomePage';

export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'Home',
    component: HomePage,
    hidden: true, // This page acts mostly as a redirect
  },
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '', // Index route for /dashboard
    icon: 'LayoutDashboard',
    component: DashboardPage
  },
  transactions: {
    id: 'transactions',
    label: 'Transactions',
    path: 'transactions', // Relative path for nested route
    icon: 'Receipt',
    component: TransactionsPage
  },
  budgets: {
    id: 'budgets',
    label: 'Budgets',
    path: 'budgets', // Relative path for nested route
    icon: 'Target',
    component: BudgetsPage
  },
  goals: {
    id: 'goals',
    label: 'Goals',
    path: 'goals', // Relative path for nested route
    icon: 'TrendingUp',
    component: GoalsPage
  },
  charts: {
    id: 'charts',
    label: 'Charts',
    path: 'charts', // Relative path for nested route
    icon: 'PieChart',
    component: ChartsPage
  },
  notFound: {
    id: 'notFound',
    label: 'Not Found',
    path: '*',
    component: NotFoundPage
  }
};

export const routeArray = Object.values(routes);