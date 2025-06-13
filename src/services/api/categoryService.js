const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CategoryService {
  constructor() {
    this.categories = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('smartbudget_categories');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Load initial mock data
    const mockData = require('../mockData/categories.json');
    this.saveToStorage(mockData);
    return mockData;
  }

  saveToStorage(data) {
    localStorage.setItem('smartbudget_categories', JSON.stringify(data));
  }

  async getAll() {
    await delay(200);
    return [...this.categories];
  }

  async getById(id) {
    await delay(150);
    const category = this.categories.find(c => c.id === id);
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category };
  }

  async getByType(type) {
    await delay(200);
    return this.categories.filter(c => c.type === type);
  }

  async create(categoryData) {
    await delay(300);
    const newCategory = {
      id: Date.now().toString(),
      ...categoryData
    };
    
    this.categories.push(newCategory);
    this.saveToStorage(this.categories);
    return { ...newCategory };
  }

  async update(id, categoryData) {
    await delay(250);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    this.categories[index] = {
      ...this.categories[index],
      ...categoryData
    };
    
    this.saveToStorage(this.categories);
    return { ...this.categories[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    this.categories.splice(index, 1);
    this.saveToStorage(this.categories);
    return true;
  }
}

export default new CategoryService();