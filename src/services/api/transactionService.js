import transactionsMockData from '../mockData/transactions.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class TransactionService {
  constructor() {
    this.transactions = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('smartbudget_transactions');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Load initial mock data
const mockData = transactionsMockData;
    this.saveToStorage(mockData);
    return mockData;
  }

  saveToStorage(data) {
    localStorage.setItem('smartbudget_transactions', JSON.stringify(data));
  }

  async getAll() {
    await delay(300);
    return [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    await delay(200);
    const transaction = this.transactions.find(t => t.id === id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return { ...transaction };
  }

  async create(transactionData) {
    await delay(400);
    const newTransaction = {
      id: Date.now().toString(),
      ...transactionData,
      createdAt: new Date().toISOString()
    };
    
    this.transactions.unshift(newTransaction);
    this.saveToStorage(this.transactions);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await delay(350);
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    this.transactions[index] = {
      ...this.transactions[index],
      ...transactionData
    };
    
    this.saveToStorage(this.transactions);
    return { ...this.transactions[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    this.transactions.splice(index, 1);
    this.saveToStorage(this.transactions);
    return true;
  }

  async getByDateRange(startDate, endDate) {
    await delay(300);
    return this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  async getByCategory(category) {
    await delay(250);
    return this.transactions.filter(t => t.category === category);
  }

  async getByType(type) {
    await delay(250);
    return this.transactions.filter(t => t.type === type);
  }
}

export default new TransactionService();