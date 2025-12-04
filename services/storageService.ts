import { INITIAL_COUNTRIES, INITIAL_OPERATORS, INITIAL_PLANS, MOCK_USER } from '../constants';
import { Country, Operator, SimPlan, User, Review } from '../types';

const STORAGE_KEYS = {
  COUNTRIES: 'gsc_countries',
  OPERATORS: 'gsc_operators',
  PLANS: 'gsc_plans',
  reviews: 'gsc_reviews',
  USER: 'gsc_user',
};

// Simulate network delay (300ms to 800ms)
const delay = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms > 0 ? ms : 300 + Math.random() * 500));

export const storageService = {
  init: () => {
    // Keep init synchronous for basic setup, but data access will be async
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    if (!storedCountries || JSON.parse(storedCountries).length < 10) {
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(INITIAL_COUNTRIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OPERATORS)) {
      localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(INITIAL_OPERATORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
      localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(MOCK_USER));
    }
  },

  getCountries: async (): Promise<Country[]> => {
    await delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUNTRIES) || '[]');
  },

  getOperators: async (countryId?: string): Promise<Operator[]> => {
    await delay();
    const ops: Operator[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATORS) || '[]');
    if (countryId) {
      return ops.filter(op => op.country_id === countryId);
    }
    return ops;
  },

  getPlans: async (operatorId?: string): Promise<SimPlan[]> => {
    await delay();
    const plans: SimPlan[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '[]');
    if (operatorId) {
      return plans.filter(p => p.operator_id === operatorId);
    }
    return plans;
  },

  getReviews: async (planId: string): Promise<Review[]> => {
    await delay();
    const allReviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
    return allReviews.filter(r => r.planId === planId);
  },

  addReview: async (review: Review): Promise<void> => {
    await delay(600); // Slower write
    const allReviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
    allReviews.push(review);
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(allReviews));

    // Gamification
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    user.points += 2;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: async (): Promise<User> => {
    await delay(200); // Faster read for user
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
  },

  addOperator: async (operator: Operator): Promise<void> => {
    await delay(800);
    const operators = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATORS) || '[]');
    operators.push(operator);
    localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(operators));
    
    // Gamification
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    user.points += 10;
    user.contributions += 1;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  addPlan: async (plan: SimPlan): Promise<void> => {
    await delay(800);
    const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '[]');
    plans.push(plan);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    
    // Gamification
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    user.points += 5;
    user.contributions += 1;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};