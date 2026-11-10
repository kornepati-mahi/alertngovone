-- Database Schema for ALERT NGO (alertngo_db)
-- Character set: utf8mb4, Collation: utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS `alertngo_db`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `alertngo_db`;

-- 1. Site Settings (Key-value store)
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` LONGTEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Flash News & Announcements (Live Ticker)
CREATE TABLE IF NOT EXISTS `flash_news` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `text` VARCHAR(500) NOT NULL,
    `link` VARCHAR(255) DEFAULT '/news-views',
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Governing Body & Leadership Team
CREATE TABLE IF NOT EXISTS `team_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `role` VARCHAR(150) NOT NULL,
    `qualification` VARCHAR(150) NULL,
    `category` ENUM('governing_body', 'advisory', 'staff', 'volunteer') DEFAULT 'governing_body',
    `image` VARCHAR(255) DEFAULT '/uploads/team/placeholder.png',
    `bio` TEXT NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Polavaram Video Reels & Multimedia
CREATE TABLE IF NOT EXISTS `reels` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `video_url` VARCHAR(500) NOT NULL,
    `thumbnail` VARCHAR(500) NULL,
    `caption` TEXT NULL,
    `category` VARCHAR(100) DEFAULT 'Polavaram',
    `duration` VARCHAR(50) DEFAULT '0:30',
    `views_count` INT DEFAULT 0,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Field Testimonials & Beneficiary Voices
CREATE TABLE IF NOT EXISTS `testimonials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `author` VARCHAR(150) NOT NULL,
    `community` VARCHAR(150) NOT NULL,
    `quote` TEXT NOT NULL,
    `avatar` VARCHAR(255) DEFAULT '/uploads/testimonials/placeholder.png',
    `category` VARCHAR(100) DEFAULT 'General',
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Contact Inquiries & Grievances
CREATE TABLE IF NOT EXISTS `contacts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('new', 'read', 'in_progress', 'resolved') DEFAULT 'new',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Donations & Pledges Record
CREATE TABLE IF NOT EXISTS `donations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `donor_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `cause` VARCHAR(150) DEFAULT 'General Support',
    `payment_status` ENUM('pledged', 'pending', 'completed', 'failed') DEFAULT 'pledged',
    `payment_id` VARCHAR(100) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Activity Log for Administrative Operations
CREATE TABLE IF NOT EXISTS `activity_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `action` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `performed_by` VARCHAR(100) DEFAULT 'Admin',
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Dynamic Scraped Pages Content (About, Vision, Core Values, etc.)
CREATE TABLE IF NOT EXISTS `pages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `content_json` LONGTEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Polavaram R&R Statistics (Live Tracker Numbers)
CREATE TABLE IF NOT EXISTS `polavaram_stats` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `label` VARCHAR(150) NOT NULL,
    `value` VARCHAR(50) NOT NULL,
    `subtext` VARCHAR(255) NULL,
    `icon` VARCHAR(50) DEFAULT 'FaBalanceScale',
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Key Programs Cards (/programs overview)
CREATE TABLE IF NOT EXISTS `key_programs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `img` LONGTEXT NOT NULL,
    `details` LONGTEXT NULL,
    `link_url` VARCHAR(255) DEFAULT '/la-rr',
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Polavaram Project & Dropdown Pages (/legislative-acts-2, /submergence-area-map, etc.)
CREATE TABLE IF NOT EXISTS `polavaram_pages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(150) NOT NULL UNIQUE,
    `nav_label` VARCHAR(150) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) DEFAULT 'Polavaram Project',
    `badge` VARCHAR(100) DEFAULT 'Polavaram PIP',
    `subtitle` TEXT NULL,
    `content_json` LONGTEXT NOT NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. All Site Pages Repository (/all-pages, /page/:slug, /:slug)
CREATE TABLE IF NOT EXISTS `site_all_pages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(150) NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `nav_label` VARCHAR(150) NULL,
    `category` VARCHAR(100) DEFAULT 'General',
    `badge` VARCHAR(100) NULL,
    `subtitle` TEXT NULL,
    `content_json` LONGTEXT NOT NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Stories of Change (/stories) Table
CREATE TABLE IF NOT EXISTS `stories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `story_type` VARCHAR(50) DEFAULT 'featured',
    `tag` VARCHAR(100) NOT NULL,
    `place` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `outcome` VARCHAR(255) NULL,
    `media_type` ENUM('image', 'video') DEFAULT 'image',
    `img` VARCHAR(500) NULL,
    `video_url` VARCHAR(500) NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. News & Field Dispatches (/news, /news-views) Table
CREATE TABLE IF NOT EXISTS `news_articles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `date` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'relief',
    `tag` VARCHAR(100) NOT NULL DEFAULT 'Field Dispatch',
    `img` VARCHAR(500) NULL,
    `excerpt` TEXT NOT NULL,
    `details` LONGTEXT NULL,
    `link_url` VARCHAR(255) DEFAULT '/contact',
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Media Gallery (Videos & Images - /gallery-9, /gallery) Table
CREATE TABLE IF NOT EXISTS `gallery_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(20) NOT NULL DEFAULT 'image',
    `title` VARCHAR(255) NOT NULL,
    `cat` VARCHAR(100) NOT NULL DEFAULT 'Community',
    `src` VARCHAR(500) NOT NULL,
    `poster` VARCHAR(500) NULL,
    `duration` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Media Gallery Dropdowns (/gallery-9, /gallery Navbar Dropdowns) Table
CREATE TABLE IF NOT EXISTS `gallery_dropdowns` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `parent_label` VARCHAR(100) NOT NULL DEFAULT 'Videos & Images',
    `section` VARCHAR(100) NOT NULL DEFAULT 'Photos & Images',
    `label` VARCHAR(150) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Careers Page Settings & Content (/careers) Table
CREATE TABLE IF NOT EXISTS `careers_page` (
    `id` INT PRIMARY KEY DEFAULT 1,
    `badge` VARCHAR(100) DEFAULT 'Section 01',
    `title` VARCHAR(255) DEFAULT 'Working With ALERT',
    `subtitle` TEXT NULL,
    `intro_p1` TEXT NULL,
    `intro_p2` TEXT NULL,
    `hero_media_type` VARCHAR(20) DEFAULT 'image',
    `hero_media_url` VARCHAR(500) DEFAULT '/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg',
    `hero_poster` VARCHAR(500) NULL,
    `apply_email` VARCHAR(255) DEFAULT 'contact@alertngo.in',
    `partner_btn_text` VARCHAR(100) DEFAULT 'Partner With Us',
    `partner_btn_url` VARCHAR(255) DEFAULT '/partner',
    `openings_badge` VARCHAR(100) DEFAULT 'Section 02',
    `openings_title` VARCHAR(255) DEFAULT 'Roles We Recruit For',
    `openings_subtitle` TEXT NULL,
    `pathways_badge` VARCHAR(100) DEFAULT 'Section 03',
    `pathways_title` VARCHAR(255) DEFAULT 'Internships & Volunteer Pathways',
    `pathways_subtitle` TEXT NULL,
    `pathways_json` LONGTEXT NULL,
    `steps_badge` VARCHAR(100) DEFAULT 'Section 04',
    `steps_title` VARCHAR(255) DEFAULT 'How To Apply',
    `steps_subtitle` TEXT NULL,
    `steps_json` LONGTEXT NULL,
    `values_title` VARCHAR(255) DEFAULT 'What you can expect from us',
    `values_json` LONGTEXT NULL,
    `cta_badge` VARCHAR(100) DEFAULT 'Careers',
    `cta_title` VARCHAR(255) DEFAULT 'Do Work That Reaches the Last Hamlet',
    `cta_subtitle` TEXT NULL,
    `cta_email_subject` VARCHAR(255) DEFAULT 'Profile for ALERT talent pool',
    `cta_contact_url` VARCHAR(255) DEFAULT '/contact',
    `trust_strip_json` LONGTEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Careers Job Openings (/careers) Table
CREATE TABLE IF NOT EXISTS `careers_openings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role` VARCHAR(255) NOT NULL,
    `type` VARCHAR(100) NOT NULL DEFAULT 'Full-time',
    `place` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(50) DEFAULT 'FaBriefcase',
    `about` TEXT NOT NULL,
    `fit` TEXT NOT NULL,
    `apply_link` VARCHAR(500) NULL,
    `apply_email` VARCHAR(255) DEFAULT 'contact@alertngo.in',
    `media_type` VARCHAR(20) DEFAULT 'none',
    `media_url` VARCHAR(500) NULL,
    `jd_file` VARCHAR(500) NULL,
    `link_url` VARCHAR(500) NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. Careers Media & Attachments (/careers) Table
CREATE TABLE IF NOT EXISTS `careers_media` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'image',
    `url` VARCHAR(500) NOT NULL,
    `poster` VARCHAR(500) NULL,
    `tag` VARCHAR(100) DEFAULT 'Field Team',
    `description` TEXT NULL,
    `link_url` VARCHAR(500) NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. Partner with Us (/partner) Page Table
CREATE TABLE IF NOT EXISTS `partner_page` (
    `id` INT PRIMARY KEY DEFAULT 1,
    `badge` VARCHAR(100) DEFAULT 'Section 01',
    `title` VARCHAR(255) DEFAULT 'Why Partner With ALERT',
    `subtitle` TEXT NULL,
    `intro_p1` TEXT NULL,
    `intro_p2` TEXT NULL,
    `hero_media_type` VARCHAR(20) DEFAULT 'image',
    `hero_media_url` VARCHAR(500) DEFAULT '/uploads/reels/reel-4-women.jpg',
    `hero_poster` VARCHAR(500) NULL,
    `contact_email` VARCHAR(255) DEFAULT 'director@alertngo.in',
    `donate_btn_text` VARCHAR(100) DEFAULT 'Give Directly',
    `donate_btn_url` VARCHAR(255) DEFAULT '/donate',
    `routes_badge` VARCHAR(100) DEFAULT 'Section 02',
    `routes_title` VARCHAR(255) DEFAULT 'Four Ways to Partner',
    `routes_subtitle` TEXT NULL,
    `routes_json` LONGTEXT NULL,
    `missions_badge` VARCHAR(100) DEFAULT 'Section 03',
    `missions_title` VARCHAR(255) DEFAULT 'Where Support Goes',
    `missions_subtitle` TEXT NULL,
    `missions_json` LONGTEXT NULL,
    `diligence_badge` VARCHAR(100) DEFAULT 'Section 04',
    `diligence_title` VARCHAR(255) DEFAULT 'Due Diligence & Statutory Records',
    `diligence_subtitle` TEXT NULL,
    `diligence_json` LONGTEXT NULL,
    `commitments_title` VARCHAR(255) DEFAULT 'Our Institutional Commitments',
    `commitments_json` LONGTEXT NULL,
    `cta_badge` VARCHAR(100) DEFAULT 'Partnership',
    `cta_title` VARCHAR(255) DEFAULT 'Begin a Conversation With Us',
    `cta_subtitle` TEXT NULL,
    `cta_email_subject` VARCHAR(255) DEFAULT 'Partnership enquiry to ALERT',
    `cta_donate_url` VARCHAR(255) DEFAULT '/donate',
    `trust_strip_json` LONGTEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. Grievance Page & Portal (/grievances) Config Table
CREATE TABLE IF NOT EXISTS `grievance_page` (
    `id` INT PRIMARY KEY DEFAULT 1,
    `badge` VARCHAR(100) DEFAULT 'Community Assistance',
    `title` VARCHAR(255) DEFAULT 'ALERT Grievance Redressal Portal',
    `subtitle` TEXT NULL,
    `typewriter_json` LONGTEXT NULL,
    `form_title` VARCHAR(255) DEFAULT 'Submit Grievance Representation',
    `form_subtitle` TEXT NULL,
    `full_forms_json` LONGTEXT NULL,
    `guidelines_json` LONGTEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 23. Grievances Submissions Table
CREATE TABLE IF NOT EXISTS `grievances` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tracking_code` VARCHAR(50) UNIQUE NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `aadhaar` VARCHAR(20) NULL,
    `phone` VARCHAR(30) NOT NULL,
    `village` VARCHAR(100) NOT NULL,
    `mandal` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `grievance_type` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('registered', 'under_investigation', 'submitted_to_sdc', 'resolved') DEFAULT 'registered',
    `admin_remarks` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 24. Downloads & Legal Documents (/downloads) Table
CREATE TABLE IF NOT EXISTS `site_downloads` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category` VARCHAR(50) NOT NULL DEFAULT 'acts',
    `title` VARCHAR(255) NOT NULL,
    `file` VARCHAR(500) NOT NULL,
    `meta` VARCHAR(255) NULL,
    `desc` TEXT NOT NULL,
    `file_size` VARCHAR(100) DEFAULT 'Official PDF',
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 25. Frequently Asked Questions (/faqs) Table
CREATE TABLE IF NOT EXISTS `site_faqs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category` VARCHAR(100) DEFAULT 'General',
    `q` TEXT NOT NULL,
    `a` LONGTEXT NOT NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 26. Partner With Us Navbar Dropdowns Table
CREATE TABLE IF NOT EXISTS `partner_dropdowns` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `parent_label` VARCHAR(100) NOT NULL DEFAULT 'Partner with us',
    `section` VARCHAR(100) NOT NULL DEFAULT 'Main',
    `label` VARCHAR(150) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `sub_items_json` LONGTEXT NULL,
    `sort_order` INT DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 27. Chatbot AI API Keys & Configuration Table
CREATE TABLE IF NOT EXISTS `chatbot_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `provider` VARCHAR(50) NOT NULL DEFAULT 'groq',
    `api_key` VARCHAR(255) NOT NULL,
    `model_name` VARCHAR(100) NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    `label` VARCHAR(150) NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `status` VARCHAR(50) DEFAULT 'untested',
    `last_tested_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
