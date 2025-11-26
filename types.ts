export interface Country {
  id: string;
  name_es: string;
  name_en: string;
  continent: string;
  currency: string;
  flag: string;
}

export interface Operator {
  id: string;
  name: string;
  country_id: string;
  technologies: string[]; // 4G, 5G, etc.
  website: string;
  coverage: string;
}

export interface SimPlan {
  id: string;
  operator_id: string;
  name: string;
  data_gb: number; // -1 for unlimited
  price: number;
  currency: string;
  validity_days: number;
  sim_type: 'Physical' | 'eSIM' | 'Hybrid';
  speed_5g: boolean;
  features: string[];
}

export interface Review {
  id: string;
  planId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  name: string;
  points: number;
  level: 'Novice' | 'Explorer' | 'Expert' | 'Master' | 'Legend';
  badges: string[];
  contributions: number;
}

export type Language = 'en' | 'es';

export interface AIResponse {
  recommendation: string;
  reasoning: string;
}