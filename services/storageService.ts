import { INITIAL_COUNTRIES, INITIAL_OPERATORS, INITIAL_PLANS, MOCK_USER } from '../constants';
import { Country, Operator, SimPlan, User, Review } from '../types';

const STORAGE_KEYS = {
  COUNTRIES: 'gsc_countries',
  OPERATORS: 'gsc_operators',
  PLANS: 'gsc_plans',
  reviews: 'gsc_reviews',
  USER: 'gsc_user',
};

export const storageService = {
  init: () => {
    // Check if countries need to be updated (if missing or if it's the old short list)
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

  getCountries: (): Country[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUNTRIES) || '[]');
  },

  getOperators: (countryId?: string): Operator[] => {
    const ops: Operator[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATORS) || '[]');
    if (countryId) {
      return ops.filter(op => op.country_id === countryId);
    }
    return ops;
  },

  getPlans: (operatorId?: string): SimPlan[] => {
    const plans: SimPlan[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '[]');
    if (operatorId) {
      return plans.filter(p => p.operator_id === operatorId);
    }
    return plans;
  },

  getReviews: (planId: string): Review[] => {
    const allReviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
    return allReviews.filter(r => r.planId === planId);
  },

  addReview: (review: Review) => {
    const allReviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
    allReviews.push(review);
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(allReviews));

    // Gamification: Add points for review
    const user = storageService.getUser();
    user.points += 2; // 2 points per review as per PDF
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: (): User => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
  },

  addOperator: (operator: Operator) => {
    const operators = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATORS) || '[]');
    operators.push(operator);
    localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(operators));
    
    // Gamification points for operator (10 pts)
    const user = storageService.getUser();
    user.points += 10;
    user.contributions += 1;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  addPlan: (plan: SimPlan) => {
    const plans = storageService.getPlans();
    plans.push(plan);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    
    // Gamification: Add points for plan (5 pts)
    const user = storageService.getUser();
    user.points += 5;
    user.contributions += 1;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};