-- Job Portal schema generated from the Django model files in this project.
-- This file creates the custom application tables.
-- Django's internal tables (auth/admin/session/contenttypes) are normally created by migrations.

CREATE DATABASE IF NOT EXISTS `job_portal`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `job_portal`;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `accounts_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL DEFAULT 0,
  `email` varchar(254) NOT NULL,
  `first_name` varchar(150) NOT NULL DEFAULT '',
  `last_name` varchar(150) NOT NULL DEFAULT '',
  `role` varchar(20) NOT NULL DEFAULT 'job_seeker',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_staff` tinyint(1) NOT NULL DEFAULT 0,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_user_email_uniq` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `accounts_jobseekerprofile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `full_name` varchar(255) NOT NULL DEFAULT '',
  `city` varchar(120) NOT NULL DEFAULT '',
  `experience_years` smallint unsigned NOT NULL DEFAULT 0,
  `bio` longtext NOT NULL,
  `education` longtext NOT NULL,
  `desired_title` varchar(150) NOT NULL DEFAULT '',
  `preferred_location` varchar(150) NOT NULL DEFAULT '',
  `resume` varchar(100) DEFAULT NULL,
  `video_intro` varchar(200) NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_jobseekerprofile_user_id_uniq` (`user_id`),
  CONSTRAINT `accounts_jobseekerprofile_user_id_fk`
    FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `accounts_employerprofile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `industry` varchar(120) NOT NULL DEFAULT '',
  `location` varchar(120) NOT NULL DEFAULT '',
  `website` varchar(200) NOT NULL DEFAULT '',
  `logo` varchar(100) DEFAULT NULL,
  `about` longtext NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_employerprofile_user_id_uniq` (`user_id`),
  KEY `accounts_employerprofile_company_name_idx` (`company_name`),
  CONSTRAINT `accounts_employerprofile_user_id_fk`
    FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skills_skill` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `category` varchar(120) NOT NULL DEFAULT '',
  `description` longtext NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skills_skill_name_uniq` (`name`),
  UNIQUE KEY `skills_skill_slug_uniq` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skills_skillresource` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` varchar(200) NOT NULL,
  `provider` varchar(120) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `skills_skillresource_skill_id_idx` (`skill_id`),
  CONSTRAINT `skills_skillresource_skill_id_fk`
    FOREIGN KEY (`skill_id`) REFERENCES `skills_skill` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs_jobposting` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employer_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(280) NOT NULL,
  `description` longtext NOT NULL,
  `responsibilities` longtext NOT NULL,
  `location` varchar(120) NOT NULL,
  `industry` varchar(120) NOT NULL DEFAULT '',
  `salary_min` int unsigned DEFAULT NULL,
  `salary_max` int unsigned DEFAULT NULL,
  `work_mode` varchar(20) NOT NULL DEFAULT 'on_site',
  `job_type` varchar(20) NOT NULL DEFAULT 'full_time',
  `expires_at` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `blind_hiring` tinyint(1) NOT NULL DEFAULT 0,
  `views_count` int unsigned NOT NULL DEFAULT 0,
  `applications_count` int unsigned NOT NULL DEFAULT 0,
  `boosted_until` datetime(6) DEFAULT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  `approved_by_id` bigint DEFAULT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobs_jobposting_slug_uniq` (`slug`),
  KEY `jobs_jobposting_employer_id_idx` (`employer_id`),
  KEY `jobs_jobposting_approved_by_id_idx` (`approved_by_id`),
  CONSTRAINT `jobs_jobposting_employer_id_fk`
    FOREIGN KEY (`employer_id`) REFERENCES `accounts_employerprofile` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `jobs_jobposting_approved_by_id_fk`
    FOREIGN KEY (`approved_by_id`) REFERENCES `accounts_user` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `skills_seekerskill` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `seeker_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  `proficiency` smallint unsigned NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skills_seekerskill_seeker_skill_uniq` (`seeker_id`, `skill_id`),
  KEY `skills_seekerskill_skill_id_idx` (`skill_id`),
  CONSTRAINT `skills_seekerskill_seeker_id_fk`
    FOREIGN KEY (`seeker_id`) REFERENCES `accounts_jobseekerprofile` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `skills_seekerskill_skill_id_fk`
    FOREIGN KEY (`skill_id`) REFERENCES `skills_skill` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs_jobskillrequirement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  `importance` varchar(20) NOT NULL DEFAULT 'required',
  `minimum_proficiency` smallint unsigned NOT NULL DEFAULT 3,
  `weight` double NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobs_jobskillrequirement_job_skill_uniq` (`job_id`, `skill_id`),
  KEY `jobs_jobskillrequirement_skill_id_idx` (`skill_id`),
  CONSTRAINT `jobs_jobskillrequirement_job_id_fk`
    FOREIGN KEY (`job_id`) REFERENCES `jobs_jobposting` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `jobs_jobskillrequirement_skill_id_fk`
    FOREIGN KEY (`skill_id`) REFERENCES `skills_skill` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs_savedjob` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `seeker_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jobs_savedjob_seeker_job_uniq` (`seeker_id`, `job_id`),
  KEY `jobs_savedjob_job_id_idx` (`job_id`),
  CONSTRAINT `jobs_savedjob_seeker_id_fk`
    FOREIGN KEY (`seeker_id`) REFERENCES `accounts_jobseekerprofile` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `jobs_savedjob_job_id_fk`
    FOREIGN KEY (`job_id`) REFERENCES `jobs_jobposting` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs_jobalert` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `seeker_id` bigint NOT NULL,
  `keywords` varchar(255) NOT NULL DEFAULT '',
  `location` varchar(120) NOT NULL DEFAULT '',
  `salary_min` int unsigned DEFAULT NULL,
  `salary_max` int unsigned DEFAULT NULL,
  `job_type` varchar(20) NOT NULL DEFAULT '',
  `industry` varchar(120) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_jobalert_seeker_id_idx` (`seeker_id`),
  CONSTRAINT `jobs_jobalert_seeker_id_fk`
    FOREIGN KEY (`seeker_id`) REFERENCES `accounts_jobseekerprofile` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs_jobview` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_id` bigint NOT NULL,
  `seeker_id` bigint DEFAULT NULL,
  `viewer_city` varchar(120) NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_jobview_job_id_idx` (`job_id`),
  KEY `jobs_jobview_seeker_id_idx` (`seeker_id`),
  CONSTRAINT `jobs_jobview_job_id_fk`
    FOREIGN KEY (`job_id`) REFERENCES `jobs_jobposting` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `jobs_jobview_seeker_id_fk`
    FOREIGN KEY (`seeker_id`) REFERENCES `accounts_jobseekerprofile` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applications_application` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_id` bigint NOT NULL,
  `seeker_id` bigint NOT NULL,
  `cover_letter` longtext NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'applied',
  `match_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `skill_gap_summary` json NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_application_job_seeker_uniq` (`job_id`, `seeker_id`),
  KEY `applications_application_seeker_id_idx` (`seeker_id`),
  CONSTRAINT `applications_application_job_id_fk`
    FOREIGN KEY (`job_id`) REFERENCES `jobs_jobposting` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `applications_application_seeker_id_fk`
    FOREIGN KEY (`seeker_id`) REFERENCES `accounts_jobseekerprofile` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applications_interview` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `scheduled_at` datetime(6) NOT NULL,
  `mode` varchar(20) NOT NULL DEFAULT 'video',
  `meeting_link` varchar(200) NOT NULL DEFAULT '',
  `venue` varchar(255) NOT NULL DEFAULT '',
  `employer_notes` longtext NOT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `applications_interview_application_id_idx` (`application_id`),
  KEY `applications_interview_created_by_id_idx` (`created_by_id`),
  CONSTRAINT `applications_interview_application_id_fk`
    FOREIGN KEY (`application_id`) REFERENCES `applications_application` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `applications_interview_created_by_id_fk`
    FOREIGN KEY (`created_by_id`) REFERENCES `accounts_user` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applications_applicationtimeline` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `application_id` bigint NOT NULL,
  `from_status` varchar(30) NOT NULL DEFAULT '',
  `to_status` varchar(30) NOT NULL,
  `changed_by_id` bigint DEFAULT NULL,
  `note` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `applications_applicationtimeline_application_id_idx` (`application_id`),
  KEY `applications_applicationtimeline_changed_by_id_idx` (`changed_by_id`),
  CONSTRAINT `applications_applicationtimeline_application_id_fk`
    FOREIGN KEY (`application_id`) REFERENCES `applications_application` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `applications_applicationtimeline_changed_by_id_fk`
    FOREIGN KEY (`changed_by_id`) REFERENCES `accounts_user` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications_notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_id` bigint NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `payload` json NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notification_recipient_id_idx` (`recipient_id`),
  CONSTRAINT `notifications_notification_recipient_id_fk`
    FOREIGN KEY (`recipient_id`) REFERENCES `accounts_user` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
