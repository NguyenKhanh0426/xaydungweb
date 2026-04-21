CREATE DATABASE IF NOT EXISTS he_thong_hoc_tieng_anh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE he_thong_hoc_tieng_anh;
SET NAMES utf8mb4;

CREATE TABLE nguoi_dung (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL UNIQUE,
  mat_khau_ma_hoa VARCHAR(255) NOT NULL,
  vai_tro ENUM('learner','admin') NOT NULL DEFAULT 'learner',
  trang_thai ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  dang_nhap_cuoi_luc DATETIME NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE ho_so_nguoi_dung (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL UNIQUE,
  ho_ten VARCHAR(120) NOT NULL,
  anh_dai_dien VARCHAR(255) NULL,
  ngay_sinh DATE NULL,
  trinh_do_tieng_anh ENUM('beginner','elementary','intermediate','upper_intermediate','advanced') NULL,
  ky_thi_muc_tieu ENUM('IELTS','TOEIC','COMMUNICATION','OTHER') NULL,
  mui_gio VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  gioi_thieu TEXT NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE muc_tieu_nguoi_dung (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  loai_muc_tieu ENUM('IELTS','TOEIC','COMMUNICATION','VOCABULARY','GRAMMAR','CUSTOM') NOT NULL,
  gia_tri_muc_tieu DECIMAL(6,2) NULL,
  gia_tri_hien_tai DECIMAL(6,2) NOT NULL DEFAULT 0,
  don_vi_muc_tieu VARCHAR(50) NULL,
  ngay_bat_dau DATE NOT NULL,
  ngay_muc_tieu DATE NULL,
  trang_thai ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
  mo_ta TEXT NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE nhac_nho_hoc_tap (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  gio_nhac TIME NOT NULL,
  ngay_trong_tuan VARCHAR(20) NOT NULL,
  kenh_nhac ENUM('email','in_app') NOT NULL DEFAULT 'in_app',
  da_bat TINYINT(1) NOT NULL DEFAULT 1,
  noi_dung VARCHAR(255) NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reminders_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE thong_ke_nguoi_dung (
  nguoi_dung_id BIGINT PRIMARY KEY,
  tong_exp INT NOT NULL DEFAULT 0,
  chuoi_hien_tai INT NOT NULL DEFAULT 0,
  chuoi_dai_nhat INT NOT NULL DEFAULT 0,
  tong_phut_hoc INT NOT NULL DEFAULT 0,
  tong_tu_da_hoc INT NOT NULL DEFAULT 0,
  tong_bai_da_lam INT NOT NULL DEFAULT 0,
  ngay_hoc_cuoi DATE NULL,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stats_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE bo_tu_vung (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  tieu_de VARCHAR(150) NOT NULL,
  mo_ta TEXT NULL,
  danh_muc VARCHAR(100) NULL,
  che_do_hien_thi ENUM('private','public') NOT NULL DEFAULT 'private',
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vocabsets_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tu_vung (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bo_tu_vung_id BIGINT NOT NULL,
  tu VARCHAR(120) NOT NULL,
  phien_am VARCHAR(120) NULL,
  tu_loai VARCHAR(50) NULL,
  nghia_vi TEXT NOT NULL,
  nghia_en TEXT NULL,
  cau_vi_du TEXT NULL,
  tu_dong_nghia TEXT NULL,
  tu_trai_nghia TEXT NULL,
  duong_dan_audio VARCHAR(255) NULL,
  duong_dan_hinh VARCHAR(255) NULL,
  muc_do_kho TINYINT NOT NULL DEFAULT 1,
  nguon ENUM('manual','imported','system') NOT NULL DEFAULT 'manual',
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vocab_set FOREIGN KEY (bo_tu_vung_id) REFERENCES bo_tu_vung(id) ON DELETE CASCADE,
  UNIQUE KEY uk_set_word (bo_tu_vung_id, tu)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE the_ghi_nho (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  tu_vung_id BIGINT NOT NULL,
  mat_truoc TEXT NOT NULL,
  mat_sau TEXT NOT NULL,
  loai_the ENUM('basic','reverse','cloze') NOT NULL DEFAULT 'basic',
  dang_hoat_dong TINYINT(1) NOT NULL DEFAULT 1,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_flashcards_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_flashcards_vocab FOREIGN KEY (tu_vung_id) REFERENCES tu_vung(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_vocab_card (nguoi_dung_id, tu_vung_id, loai_the)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE trang_thai_hoc_the (
  the_id BIGINT PRIMARY KEY,
  nguoi_dung_id BIGINT NOT NULL,
  so_lan_lap INT NOT NULL DEFAULT 0,
  so_ngay_lap INT NOT NULL DEFAULT 0,
  he_so_de DECIMAL(4,2) NOT NULL DEFAULT 2.50,
  on_cuoi_luc DATETIME NULL,
  on_tiep_theo_luc DATETIME NOT NULL,
  so_lan_quen INT NOT NULL DEFAULT 0,
  trang_thai_hoc ENUM('new','learning','review','relearning','mastered') NOT NULL DEFAULT 'new',
  muc_danh_gia_cuoi ENUM('again','hard','good','easy') NULL,
  so_lan_dung_lien_tiep INT NOT NULL DEFAULT 0,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_learning_state_flashcard FOREIGN KEY (the_id) REFERENCES the_ghi_nho(id) ON DELETE CASCADE,
  CONSTRAINT fk_learning_state_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  INDEX idx_srs_due (nguoi_dung_id, on_tiep_theo_luc)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE lich_su_on_the (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  the_id BIGINT NOT NULL,
  nguoi_dung_id BIGINT NOT NULL,
  on_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  muc_danh_gia ENUM('again','hard','good','easy') NOT NULL,
  thoi_gian_tra_loi_ms INT NULL,
  so_ngay_lap_cu INT NULL,
  so_ngay_lap_moi INT NULL,
  he_so_de_cu DECIMAL(4,2) NULL,
  he_so_de_moi DECIMAL(4,2) NULL,
  ghi_chu VARCHAR(255) NULL,
  CONSTRAINT fk_reviews_flashcard FOREIGN KEY (the_id) REFERENCES the_ghi_nho(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE nhat_ky_ky_nang (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  loai_ky_nang ENUM('listening','speaking','reading','writing') NOT NULL,
  tieu_de VARCHAR(150) NOT NULL,
  mo_ta TEXT NULL,
  phut_hoc INT NOT NULL DEFAULT 0,
  diem_so DECIMAL(5,2) NULL,
  hoc_luc DATETIME NOT NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_skill_logs_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE bai_viet (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  nhat_ky_ky_nang_id BIGINT NULL,
  tieu_de VARCHAR(150) NOT NULL,
  de_bai TEXT NULL,
  noi_dung LONGTEXT NOT NULL,
  so_tu INT NOT NULL DEFAULT 0,
  nhan_xet_ai TEXT NULL,
  nhan_xet_giao_vien TEXT NULL,
  diem_band DECIMAL(4,2) NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_writing_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_writing_skill_log FOREIGN KEY (nhat_ky_ky_nang_id) REFERENCES nhat_ky_ky_nang(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE ban_ghi_noi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  nhat_ky_ky_nang_id BIGINT NULL,
  tieu_de VARCHAR(150) NOT NULL,
  duong_dan_audio VARCHAR(255) NOT NULL,
  thoi_luong_giay INT NOT NULL DEFAULT 0,
  ban_chep LONGTEXT NULL,
  diem_phat_am DECIMAL(5,2) NULL,
  diem_luu_loat DECIMAL(5,2) NULL,
  nhan_xet TEXT NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_speaking_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_speaking_skill_log FOREIGN KEY (nhat_ky_ky_nang_id) REFERENCES nhat_ky_ky_nang(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE bai_doc (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  nhat_ky_ky_nang_id BIGINT NULL,
  tieu_de VARCHAR(150) NOT NULL,
  van_ban_nguon LONGTEXT NULL,
  van_ban_tom_tat LONGTEXT NULL,
  diem_hieu DECIMAL(5,2) NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reading_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_reading_skill_log FOREIGN KEY (nhat_ky_ky_nang_id) REFERENCES nhat_ky_ky_nang(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE bai_nghe (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  nhat_ky_ky_nang_id BIGINT NULL,
  tieu_de VARCHAR(150) NOT NULL,
  duong_dan_audio_nguon VARCHAR(255) NULL,
  ban_chep LONGTEXT NULL,
  noi_dung_chep_chinh_ta LONGTEXT NULL,
  diem_hieu DECIMAL(5,2) NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listening_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_listening_skill_log FOREIGN KEY (nhat_ky_ky_nang_id) REFERENCES nhat_ky_ky_nang(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE nhat_ky_loi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  loai_ky_nang ENUM('listening','speaking','reading','writing','vocabulary','grammar','test') NOT NULL,
  loai_nguon ENUM('writing','speaking','reading','listening','flashcard','test') NOT NULL,
  nguon_id BIGINT NOT NULL,
  noi_dung_loi TEXT NOT NULL,
  noi_dung_sua TEXT NOT NULL,
  giai_thich TEXT NULL,
  muc_do ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  da_xu_ly TINYINT(1) NOT NULL DEFAULT 0,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_errors_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE bai_kiem_tra (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tieu_de VARCHAR(150) NOT NULL,
  loai_bai_kiem_tra ENUM('vocabulary','grammar','listening','reading','mixed','IELTS','TOEIC') NOT NULL,
  thoi_luong_phut INT NOT NULL,
  tong_cau_hoi INT NOT NULL DEFAULT 0,
  muc_do_kho TINYINT NOT NULL DEFAULT 1,
  dang_hoat_dong TINYINT(1) NOT NULL DEFAULT 1,
  tao_boi BIGINT NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tests_created_by FOREIGN KEY (tao_boi) REFERENCES nguoi_dung(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE phan_bai_kiem_tra (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bai_kiem_tra_id BIGINT NOT NULL,
  ten_phan VARCHAR(100) NOT NULL,
  thu_tu_phan INT NOT NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sections_test FOREIGN KEY (bai_kiem_tra_id) REFERENCES bai_kiem_tra(id) ON DELETE CASCADE,
  UNIQUE KEY uk_test_section_order (bai_kiem_tra_id, thu_tu_phan)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE cau_hoi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  bai_kiem_tra_id BIGINT NOT NULL,
  phan_id BIGINT NULL,
  loai_cau_hoi ENUM('single_choice','multiple_choice','true_false','fill_blank') NOT NULL,
  noi_dung LONGTEXT NOT NULL,
  giai_thich TEXT NULL,
  dap_an_dung_text VARCHAR(255) NULL,
  muc_do_kho TINYINT NOT NULL DEFAULT 1,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_questions_test FOREIGN KEY (bai_kiem_tra_id) REFERENCES bai_kiem_tra(id) ON DELETE CASCADE,
  CONSTRAINT fk_questions_section FOREIGN KEY (phan_id) REFERENCES phan_bai_kiem_tra(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE lua_chon_cau_hoi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cau_hoi_id BIGINT NOT NULL,
  nhan_lua_chon CHAR(1) NOT NULL,
  noi_dung_lua_chon TEXT NOT NULL,
  la_dap_an_dung TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_options_question FOREIGN KEY (cau_hoi_id) REFERENCES cau_hoi(id) ON DELETE CASCADE,
  UNIQUE KEY uk_question_option_label (cau_hoi_id, nhan_lua_chon)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE lan_lam_bai (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  bai_kiem_tra_id BIGINT NOT NULL,
  bat_dau_luc DATETIME NOT NULL,
  nop_luc DATETIME NULL,
  trang_thai ENUM('in_progress','submitted','graded','abandoned') NOT NULL DEFAULT 'in_progress',
  thoi_gian_lam_giay INT NOT NULL DEFAULT 0,
  diem_tho DECIMAL(6,2) NULL,
  diem_phan_tram DECIMAL(5,2) NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attempts_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempts_test FOREIGN KEY (bai_kiem_tra_id) REFERENCES bai_kiem_tra(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE cau_tra_loi_bai_test (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lan_lam_id BIGINT NOT NULL,
  cau_hoi_id BIGINT NOT NULL,
  lua_chon_id BIGINT NULL,
  cau_tra_loi_text TEXT NULL,
  la_dap_an_dung TINYINT(1) NULL,
  diem_duoc_tinh DECIMAL(5,2) NOT NULL DEFAULT 0,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_answers_attempt FOREIGN KEY (lan_lam_id) REFERENCES lan_lam_bai(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (cau_hoi_id) REFERENCES cau_hoi(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_option FOREIGN KEY (lua_chon_id) REFERENCES lua_chon_cau_hoi(id) ON DELETE SET NULL,
  UNIQUE KEY uk_attempt_question (lan_lam_id, cau_hoi_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE ket_qua_bai_test (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lan_lam_id BIGINT NOT NULL UNIQUE,
  nguoi_dung_id BIGINT NOT NULL,
  bai_kiem_tra_id BIGINT NOT NULL,
  so_cau_dung INT NOT NULL DEFAULT 0,
  so_cau_sai INT NOT NULL DEFAULT 0,
  so_cau_bo INT NOT NULL DEFAULT 0,
  ty_le_chinh_xac DECIMAL(5,2) NOT NULL DEFAULT 0,
  chu_de_manh JSON NULL,
  chu_de_yeu JSON NULL,
  goi_y JSON NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_attempt FOREIGN KEY (lan_lam_id) REFERENCES lan_lam_bai(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_test FOREIGN KEY (bai_kiem_tra_id) REFERENCES bai_kiem_tra(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE nhat_ky_exp (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  loai_nguon ENUM('flashcard','test','writing','speaking','reading','listening','login_bonus','streak_bonus') NOT NULL,
  nguon_id BIGINT NULL,
  exp_nhan_duoc INT NOT NULL,
  mo_ta VARCHAR(255) NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exp_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE nhat_ky_chuoi (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  ngay_hoc DATE NOT NULL,
  so_phut_hoc INT NOT NULL DEFAULT 0,
  du_dieu_kien_chuoi TINYINT(1) NOT NULL DEFAULT 0,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_streak_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_study_date (nguoi_dung_id, ngay_hoc)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE huy_hieu (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ma VARCHAR(50) NOT NULL UNIQUE,
  ten VARCHAR(100) NOT NULL,
  mo_ta VARCHAR(255) NOT NULL,
  loai_quy_tac ENUM('exp','streak','bai_kiem_tra','the_ghi_nho','skills') NOT NULL,
  gia_tri_quy_tac INT NOT NULL,
  duong_dan_icon VARCHAR(255) NULL,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE huy_hieu_nguoi_dung (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  huy_hieu_id BIGINT NOT NULL,
  nhan_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_badges_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge FOREIGN KEY (huy_hieu_id) REFERENCES huy_hieu(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_badge (nguoi_dung_id, huy_hieu_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tong_hop_hoc_tap_hang_ngay (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nguoi_dung_id BIGINT NOT NULL,
  ngay_tong_hop DATE NOT NULL,
  total_minutes INT NOT NULL DEFAULT 0,
  so_the_da_on INT NOT NULL DEFAULT 0,
  so_bai_hoan_thanh INT NOT NULL DEFAULT 0,
  so_bai_viet INT NOT NULL DEFAULT 0,
  so_ban_ghi_noi INT NOT NULL DEFAULT 0,
  so_bai_doc INT NOT NULL DEFAULT 0,
  so_bai_nghe INT NOT NULL DEFAULT 0,
  exp_nhan_duoc INT NOT NULL DEFAULT 0,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_summary_user FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_summary_date (nguoi_dung_id, ngay_tong_hop)
);
