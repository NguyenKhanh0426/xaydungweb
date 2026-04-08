CREATE DATABASE IF NOT EXISTS english_growth_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE english_growth_system;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('learner','admin') NOT NULL DEFAULT 'learner',
  status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  date_of_birth DATE NULL,
  english_level ENUM('beginner','elementary','intermediate','upper_intermediate','advanced') NULL,
  target_exam ENUM('IELTS','TOEIC','COMMUNICATION','OTHER') NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  bio TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_goals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  goal_type ENUM('IELTS','TOEIC','COMMUNICATION','VOCABULARY','GRAMMAR','CUSTOM') NOT NULL,
  target_value DECIMAL(6,2) NULL,
  target_unit VARCHAR(50) NULL,
  start_date DATE NOT NULL,
  target_date DATE NULL,
  status ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE study_reminders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  reminder_time TIME NOT NULL,
  days_of_week VARCHAR(20) NOT NULL,
  channel ENUM('email','in_app') NOT NULL DEFAULT 'in_app',
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  message VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_stats (
  user_id BIGINT PRIMARY KEY,
  total_exp INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  total_study_minutes INT NOT NULL DEFAULT 0,
  total_words_learned INT NOT NULL DEFAULT 0,
  total_tests_taken INT NOT NULL DEFAULT 0,
  last_study_date DATE NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE vocabulary_sets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  visibility ENUM('private','public') NOT NULL DEFAULT 'private',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vocabsets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE vocabularies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  set_id BIGINT NOT NULL,
  word VARCHAR(120) NOT NULL,
  phonetic VARCHAR(120) NULL,
  part_of_speech VARCHAR(50) NULL,
  meaning_vi TEXT NOT NULL,
  meaning_en TEXT NULL,
  example_sentence TEXT NULL,
  synonyms TEXT NULL,
  antonyms TEXT NULL,
  audio_url VARCHAR(255) NULL,
  image_url VARCHAR(255) NULL,
  difficulty_level TINYINT NOT NULL DEFAULT 1,
  source ENUM('manual','imported','system') NOT NULL DEFAULT 'manual',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vocab_set FOREIGN KEY (set_id) REFERENCES vocabulary_sets(id) ON DELETE CASCADE,
  UNIQUE KEY uk_set_word (set_id, word)
);

CREATE TABLE flashcards (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  vocabulary_id BIGINT NOT NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  card_type ENUM('basic','reverse','cloze') NOT NULL DEFAULT 'basic',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_flashcards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_flashcards_vocab FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_vocab_card (user_id, vocabulary_id, card_type)
);

CREATE TABLE flashcard_learning_state (
  flashcard_id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  repetition_count INT NOT NULL DEFAULT 0,
  interval_days INT NOT NULL DEFAULT 0,
  ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.50,
  last_reviewed_at DATETIME NULL,
  next_review_at DATETIME NOT NULL,
  lapse_count INT NOT NULL DEFAULT 0,
  learning_status ENUM('new','learning','review','relearning','mastered') NOT NULL DEFAULT 'new',
  last_grade ENUM('again','hard','good','easy') NULL,
  consecutive_correct INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_learning_state_flashcard FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
  CONSTRAINT fk_learning_state_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_srs_due (user_id, next_review_at)
);

CREATE TABLE flashcard_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  flashcard_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  grade ENUM('again','hard','good','easy') NOT NULL,
  response_time_ms INT NULL,
  old_interval_days INT NULL,
  new_interval_days INT NULL,
  old_ease_factor DECIMAL(4,2) NULL,
  new_ease_factor DECIMAL(4,2) NULL,
  notes VARCHAR(255) NULL,
  CONSTRAINT fk_reviews_flashcard FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE skill_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_type ENUM('listening','speaking','reading','writing') NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  study_minutes INT NOT NULL DEFAULT 0,
  score DECIMAL(5,2) NULL,
  studied_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_skill_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE writing_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_log_id BIGINT NULL,
  title VARCHAR(150) NOT NULL,
  prompt TEXT NULL,
  content LONGTEXT NOT NULL,
  word_count INT NOT NULL DEFAULT 0,
  ai_feedback TEXT NULL,
  teacher_feedback TEXT NULL,
  band_score DECIMAL(4,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_writing_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_writing_skill_log FOREIGN KEY (skill_log_id) REFERENCES skill_logs(id) ON DELETE SET NULL
);

CREATE TABLE speaking_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_log_id BIGINT NULL,
  title VARCHAR(150) NOT NULL,
  audio_url VARCHAR(255) NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  transcript LONGTEXT NULL,
  pronunciation_score DECIMAL(5,2) NULL,
  fluency_score DECIMAL(5,2) NULL,
  feedback TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_speaking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_speaking_skill_log FOREIGN KEY (skill_log_id) REFERENCES skill_logs(id) ON DELETE SET NULL
);

CREATE TABLE reading_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_log_id BIGINT NULL,
  title VARCHAR(150) NOT NULL,
  source_text LONGTEXT NULL,
  summary_text LONGTEXT NULL,
  comprehension_score DECIMAL(5,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reading_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_skill_log FOREIGN KEY (skill_log_id) REFERENCES skill_logs(id) ON DELETE SET NULL
);

CREATE TABLE listening_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_log_id BIGINT NULL,
  title VARCHAR(150) NOT NULL,
  audio_source_url VARCHAR(255) NULL,
  transcript LONGTEXT NULL,
  dictation_text LONGTEXT NULL,
  comprehension_score DECIMAL(5,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listening_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_listening_skill_log FOREIGN KEY (skill_log_id) REFERENCES skill_logs(id) ON DELETE SET NULL
);

CREATE TABLE error_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  skill_type ENUM('listening','speaking','reading','writing','vocabulary','grammar','test') NOT NULL,
  source_type ENUM('writing','speaking','reading','listening','flashcard','test') NOT NULL,
  source_id BIGINT NOT NULL,
  error_text TEXT NOT NULL,
  correction_text TEXT NOT NULL,
  explanation TEXT NULL,
  severity ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  resolved TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_errors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  test_type ENUM('vocabulary','grammar','listening','reading','mixed','IELTS','TOEIC') NOT NULL,
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL DEFAULT 0,
  difficulty_level TINYINT NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tests_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE test_sections (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  test_id BIGINT NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  section_order INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sections_test FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  UNIQUE KEY uk_test_section_order (test_id, section_order)
);

CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  test_id BIGINT NOT NULL,
  section_id BIGINT NULL,
  question_type ENUM('single_choice','multiple_choice','true_false','fill_blank') NOT NULL,
  content LONGTEXT NOT NULL,
  explanation TEXT NULL,
  correct_text VARCHAR(255) NULL,
  difficulty_level TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_questions_test FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  CONSTRAINT fk_questions_section FOREIGN KEY (section_id) REFERENCES test_sections(id) ON DELETE SET NULL
);

CREATE TABLE question_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  option_label CHAR(1) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_question_option_label (question_id, option_label)
);

CREATE TABLE test_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  test_id BIGINT NOT NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  status ENUM('in_progress','submitted','graded','abandoned') NOT NULL DEFAULT 'in_progress',
  time_spent_seconds INT NOT NULL DEFAULT 0,
  raw_score DECIMAL(6,2) NULL,
  percentage_score DECIMAL(5,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempts_test FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

CREATE TABLE test_answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  selected_option_id BIGINT NULL,
  answer_text TEXT NULL,
  is_correct TINYINT(1) NULL,
  score_awarded DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_answers_attempt FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL,
  UNIQUE KEY uk_attempt_question (attempt_id, question_id)
);

CREATE TABLE test_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_id BIGINT NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  test_id BIGINT NOT NULL,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  blank_count INT NOT NULL DEFAULT 0,
  accuracy_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  strength_topics JSON NULL,
  weakness_topics JSON NULL,
  recommendations JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_attempt FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_test FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

CREATE TABLE exp_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  source_type ENUM('flashcard','test','writing','speaking','reading','listening','login_bonus','streak_bonus') NOT NULL,
  source_id BIGINT NULL,
  exp_gained INT NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE streak_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  study_date DATE NOT NULL,
  minutes_studied INT NOT NULL DEFAULT 0,
  qualified_for_streak TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_streak_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_study_date (user_id, study_date)
);

CREATE TABLE badges (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  rule_type ENUM('exp','streak','tests','flashcards','skills') NOT NULL,
  rule_value INT NOT NULL,
  icon_url VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_badges (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  badge_id BIGINT NOT NULL,
  earned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_badge (user_id, badge_id)
);

CREATE TABLE daily_study_summary (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  summary_date DATE NOT NULL,
  total_minutes INT NOT NULL DEFAULT 0,
  flashcards_reviewed INT NOT NULL DEFAULT 0,
  tests_completed INT NOT NULL DEFAULT 0,
  writing_entries_count INT NOT NULL DEFAULT 0,
  speaking_records_count INT NOT NULL DEFAULT 0,
  reading_entries_count INT NOT NULL DEFAULT 0,
  listening_entries_count INT NOT NULL DEFAULT 0,
  exp_gained INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_summary_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_summary_date (user_id, summary_date)
);
