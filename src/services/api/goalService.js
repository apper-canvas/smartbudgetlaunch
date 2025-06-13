import mockGoalsData from '@/services/mockData/goals.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GoalService {
  constructor() {
    this.goals = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('smartbudget_goals');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Load initial mock data
    const mockData = mockGoalsData || [];
    this.saveToStorage(mockData);
    return mockData;
  }

  saveToStorage(data) {
    localStorage.setItem('smartbudget_goals', JSON.stringify(data));
  }

  async getAll() {
    await delay(300);
    return [...this.goals].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  async getById(id) {
    await delay(200);
    const goal = this.goals.find(g => g.id === id);
    if (!goal) {
      throw new Error('Goal not found');
    }
    return { ...goal };
  }

  async create(goalData) {
    await delay(400);
    const newGoal = {
      id: Date.now().toString(),
      ...goalData,
      createdAt: new Date().toISOString()
    };
    
    this.goals.push(newGoal);
    this.saveToStorage(this.goals);
    return { ...newGoal };
  }

  async update(id, goalData) {
    await delay(350);
    const index = this.goals.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    this.goals[index] = {
      ...this.goals[index],
      ...goalData
    };
    
    this.saveToStorage(this.goals);
    return { ...this.goals[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.goals.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    this.goals.splice(index, 1);
    this.saveToStorage(this.goals);
    return true;
  }

  async addContribution(id, amount) {
    await delay(300);
    const goal = this.goals.find(g => g.id === id);
    if (!goal) {
      throw new Error('Goal not found');
    }
    
    goal.currentAmount += amount;
    this.saveToStorage(this.goals);
    return { ...goal };
  }

  async getCompleted() {
    await delay(250);
    return this.goals.filter(g => g.currentAmount >= g.targetAmount);
  }

  async getActive() {
    await delay(250);
    return this.goals.filter(g => g.currentAmount < g.targetAmount);
  }
}

export default new GoalService();