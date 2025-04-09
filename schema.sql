-- Update battle_invitations table to match existing schema
CREATE TABLE IF NOT EXISTS `battle_invitations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` varchar(128) DEFAULT NULL,
  `sender_username` varchar(255) NOT NULL,
  `sender_level` int(5) NOT NULL,
  `receiver_id` varchar(128) DEFAULT NULL,
  `receiver_username` varchar(255) NOT NULL,
  `receiver_level` int(5) NOT NULL,
  `lobby_code` varchar(6) NOT NULL,
  `status` enum('pending','accepted','declined','expired') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `question_types` text NOT NULL COMMENT 'JSON array of question types',
  `study_material_title` varchar(255) DEFAULT NULL,
  `host_ready` tinyint(1) DEFAULT 1,
  `guest_ready` tinyint(1) DEFAULT 0,
  `battle_started` tinyint(1) DEFAULT 0,
  `selected_difficulty` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `battle_invitations_ibfk_2` (`receiver_id`),
  CONSTRAINT `battle_invitations_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`firebase_uid`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `battle_invitations_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`firebase_uid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 