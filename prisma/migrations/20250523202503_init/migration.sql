-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `settings_language` VARCHAR(191) NOT NULL DEFAULT 'en',
    `settings_theme` VARCHAR(191) NOT NULL DEFAULT 'light',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `learning_plan_start_date` DATETIME(3) NULL,
    `learning_plan_end_date` DATETIME(3) NULL,
    `learning_plan_study_days_of_week` JSON NULL,
    `learning_plan_preferred_exam_target` VARCHAR(191) NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `article_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `translated_content` TEXT NULL,
    `source_url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`article_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `tag_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tags_name_key`(`name`),
    PRIMARY KEY (`tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_tags_junction` (
    `article_id` VARCHAR(191) NOT NULL,
    `tag_id` VARCHAR(191) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`article_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_new_words` (
    `new_word_id` VARCHAR(191) NOT NULL,
    `article_id` VARCHAR(191) NOT NULL,
    `word` VARCHAR(191) NOT NULL,
    `definition` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`new_word_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_phrases` (
    `phrase_id` VARCHAR(191) NOT NULL,
    `article_id` VARCHAR(191) NOT NULL,
    `phrase` VARCHAR(191) NOT NULL,
    `meaning` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`phrase_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_reading_comprehension_questions` (
    `question_id` VARCHAR(191) NOT NULL,
    `article_id` VARCHAR(191) NOT NULL,
    `question_text` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`question_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_reading_comprehension_options` (
    `option_id` VARCHAR(191) NOT NULL,
    `question_id` VARCHAR(191) NOT NULL,
    `option_text` VARCHAR(191) NOT NULL,
    `is_correct` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_learning_records` (
    `record_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `article_id` VARCHAR(191) NOT NULL,
    `article_title_cache` VARCHAR(191) NOT NULL,
    `word_id` VARCHAR(191) NULL,
    `phrase_id` VARCHAR(191) NULL,
    `activity_type` VARCHAR(191) NOT NULL,
    `score` INTEGER NULL,
    `timer_skimming` INTEGER NOT NULL DEFAULT 0,
    `timer_intensive_reading` INTEGER NOT NULL DEFAULT 0,
    `total_learning_time_for_article` INTEGER NOT NULL DEFAULT 0,
    `is_first_time_learning` BOOLEAN NOT NULL DEFAULT true,
    `date_learned` DATETIME(3) NULL,
    `review_next_date` DATETIME(3) NULL,
    `review_current_level` INTEGER NOT NULL DEFAULT 0,
    `review_total_times` INTEGER NOT NULL DEFAULT 0,
    `review_total_duration_for_article` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_studied_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_learning_records_user_id_article_id_key`(`user_id`, `article_id`),
    PRIMARY KEY (`record_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_review_history` (
    `review_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `record_id` VARCHAR(191) NOT NULL,
    `duration_seconds` INTEGER NOT NULL,
    `level_reviewed_at` INTEGER NOT NULL,
    `reviewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_tags_junction` ADD CONSTRAINT `article_tags_junction_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_tags_junction` ADD CONSTRAINT `article_tags_junction_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`tag_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_new_words` ADD CONSTRAINT `article_new_words_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_phrases` ADD CONSTRAINT `article_phrases_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_reading_comprehension_questions` ADD CONSTRAINT `article_reading_comprehension_questions_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_reading_comprehension_options` ADD CONSTRAINT `article_reading_comprehension_options_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `article_reading_comprehension_questions`(`question_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_learning_records` ADD CONSTRAINT `user_learning_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_learning_records` ADD CONSTRAINT `user_learning_records_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`article_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_review_history` ADD CONSTRAINT `user_review_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_review_history` ADD CONSTRAINT `user_review_history_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `user_learning_records`(`record_id`) ON DELETE CASCADE ON UPDATE CASCADE;
