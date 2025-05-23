// Simulating database entities as TypeScript interfaces
// Based on the MySQL schema provided in the user prompt

export interface User {
  user_id: string; // UUID or INT
  email: string;
  password_hash?: string; // Only if using Credentials provider directly without NextAuth handling it fully
  name?: string | null; // Added for NextAuth User compatibility
  image?: string | null; // Added for NextAuth User compatibility
  role: 'user' | 'admin';
  created_at: Date;
  settings_language: 'zh' | 'en'; // Simplified for now
  settings_theme: 'light' | 'dark' | 'system';
  learning_plan_start_date?: Date | null;
  learning_plan_end_date?: Date | null;
  learning_plan_study_days_of_week?: number[] | null; // e.g., [1,2,3,4,5] for Mon-Fri
  learning_plan_preferred_exam_target?: string | null;
  stats_total_study_days: number;
  stats_extra_study_days: number;
  stats_extra_rest_days: number;
  stats_net_extra_study_days: number;
  stats_total_learning_time_overall: number; // in seconds
  stats_total_review_time_overall: number; // in seconds
}

export interface Article {
  article_id: string; // UUID or INT
  title: string;
  original_text: string;
  translation_text?: string | null;
  source_or_link?: string | null;
  created_by_user_id?: string | null; // FK to User
  created_at: Date;
  difficulty_level?: 'easy' | 'medium' | 'hard' | null;
  tags?: Tag[]; // populated via junction table
  // Processed content - might be stored separately or denormalized here if simple
  new_words?: ArticleNewWord[];
  phrases?: ArticlePhrase[];
  comprehension_questions?: ArticleReadingComprehensionQuestion[];
}

export interface Tag {
  tag_id: number;
  tag_name: string;
}

export interface ArticleTagJunction {
  article_id: string; // FK to Article
  tag_id: number; // FK to Tag
}

export interface ArticleNewWord {
  new_word_id: number;
  article_id: string; // FK to Article
  word: string;
  translation: string;
}

export interface ArticlePhrase {
  phrase_id: number;
  article_id: string; // FK to Article
  phrase: string;
  translation: string;
  example?: string | null;
}

export interface ArticleReadingComprehensionQuestion {
  question_id: number;
  article_id: string; // FK to Article
  question_text: string;
  explanation?: string | null;
  correct_answer_index: number; // 0-based index
  options: ArticleReadingComprehensionOption[];
}

export interface ArticleReadingComprehensionOption {
  option_id: number;
  question_id: number; // FK to Question
  option_text: string;
  option_index: number; // 0-based, for ordering
}

export interface UserLearningRecord {
  record_id: string; // UUID or INT
  user_id: string; // FK to User
  article_id: string; // FK to Article
  article_title_cache: string;
  date_learned: Date;
  last_studied_date: Date;
  is_first_time_learning: boolean;
  timer_skimming: number; // seconds
  timer_intensive_reading: number; // seconds
  timer_vocabulary_building: number; // seconds
  timer_phrase_learning: number; // seconds
  timer_translation_practice: number; // seconds
  timer_recitation: number; // seconds
  total_learning_time_for_article: number; // seconds
  review_next_date?: Date | null;
  review_current_level: number;
  review_total_times: number;
  review_total_duration_for_article: number; // seconds
}

export interface UserReviewHistory {
  review_history_id: number;
  record_id: string; // FK to UserLearningRecord
  review_date: Date;
  duration_seconds: number;
  level_reviewed_at: number;
}
