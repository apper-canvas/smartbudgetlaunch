const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class BudgetService {
  constructor() {
    this.budgets = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('smartbudget_budgets');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Load initial mock data
    const mockData = require('../mockData/budgets.json');
    this.saveToStorage(mockData);
    return mockData;
  }

  saveToStorage(data) {
    localStorage.setItem('smartbudget_budgets', JSON.stringify(data));
  }

  async getAll() {
    await delay(300);
    return [...this.budgets];
  }

  async getById(id) {
    await delay(200);
    const budget = this.budgets.find(b => b.id === id);
    if (!budget) {
      throw new Error('Budget not found');
    }
    return { ...budget };
  }

  async create(budgetData) {
    await delay(400);
    const newBudget = {
      id: Date.now().toString(),
      ...budgetData,
      spent: 0,
      createdAt: new Date().toISOString()
    };
    
    this.budgets.push(newBudget);
    this.saveToStorage(this.budgets);
    return { ...newBudget };
  }

  async update(id, budgetData) {
    await delay(350);
    const index = this.budgets.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Budget not found');
    }
    
    this.budgets[index] = {
      ...this.budgets[index],
      ...budgetData
    };
    
    this.saveToStorage(this.budgets);
    return { ...this.budgets[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.budgets.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Budget not found');
    }
    
    this.budgets.splice(index, 1);
    this.saveToStorage(this.budgets);
    return true;
  }

  async getByCategory(category) {
    await delay(250);
    return this.budgets.find(b => b.category === category) || null;
  }

  async updateSpent(category, amount) {
    await delay(200);
    const budget = this.budgets.find(b => b.category === category);
    if (budget) {
      budget.spent = amount;
      this.saveToStorage(this.budgets);
    }
    return budget;
  }
}

export default new BudgetService();