import { pool } from '../config/db.js';

export const vocabRepository = {
  async createSet(userId, payload) {
    const { title, description, category } = payload;
    const [result] = await pool.query(
      'INSERT INTO bo_tu_vung (nguoi_dung_id, tieu_de, mo_ta, danh_muc) VALUES (?, ?, ?, ?)',
      [userId, title, description || null, category || null]
    );
    return this.findSetById(result.insertId, userId);
  },

  async findSetById(setId, userId) {
    const [rows] = await pool.query(
      `SELECT btv.id, btv.tieu_de AS title, btv.mo_ta AS description, btv.danh_muc AS category,
              btv.che_do_hien_thi AS visibility, btv.tao_luc AS created_at, btv.cap_nhat_luc AS updated_at,
              COUNT(tv.id) AS vocabulary_count
       FROM bo_tu_vung btv
       LEFT JOIN tu_vung tv ON tv.bo_tu_vung_id = btv.id
       WHERE btv.id = ? AND btv.nguoi_dung_id = ?
       GROUP BY btv.id`,
      [setId, userId]
    );
    return rows[0] || null;
  },

  async getSets(userId) {
    const [rows] = await pool.query(
      `SELECT btv.id, btv.tieu_de AS title, btv.mo_ta AS description, btv.danh_muc AS category,
              btv.che_do_hien_thi AS visibility, btv.tao_luc AS created_at, btv.cap_nhat_luc AS updated_at,
              COUNT(tv.id) AS vocabulary_count
       FROM bo_tu_vung btv
       LEFT JOIN tu_vung tv ON tv.bo_tu_vung_id = btv.id
       WHERE btv.nguoi_dung_id = ?
       GROUP BY btv.id
       ORDER BY btv.id DESC`,
      [userId]
    );
    return rows;
  },

  async updateSet(setId, userId, payload) {
    await pool.query(
      `UPDATE bo_tu_vung
       SET tieu_de = ?, mo_ta = ?, danh_muc = ?
       WHERE id = ? AND nguoi_dung_id = ?`,
      [payload.title, payload.description || null, payload.category || null, setId, userId]
    );
    return this.findSetById(setId, userId);
  },

  async deleteSet(setId, userId) {
    const [result] = await pool.query('DELETE FROM bo_tu_vung WHERE id = ? AND nguoi_dung_id = ?', [setId, userId]);
    return result.affectedRows > 0;
  },

  async addVocabulary(setId, payload) {
    const {
      word,
      phonetic,
      partOfSpeech,
      meaningVi,
      meaningEn,
      exampleSentence
    } = payload;
    const [result] = await pool.query(
      `INSERT INTO tu_vung
       (bo_tu_vung_id, tu, phien_am, tu_loai, nghia_vi, nghia_en, cau_vi_du)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [setId, word, phonetic || null, partOfSpeech || null, meaningVi, meaningEn || null, exampleSentence || null]
    );
    return this.findVocabularyById(result.insertId);
  },

  async updateVocabulary(vocabularyId, userId, payload) {
    const [result] = await pool.query(
      `UPDATE tu_vung tv
       INNER JOIN bo_tu_vung btv ON btv.id = tv.bo_tu_vung_id
       SET tv.tu = ?, tv.phien_am = ?, tv.tu_loai = ?, tv.nghia_vi = ?, tv.nghia_en = ?, tv.cau_vi_du = ?
       WHERE tv.id = ? AND btv.nguoi_dung_id = ?`,
      [
        payload.word,
        payload.phonetic || null,
        payload.partOfSpeech || null,
        payload.meaningVi,
        payload.meaningEn || null,
        payload.exampleSentence || null,
        vocabularyId,
        userId
      ]
    );
    if (!result.affectedRows) return null;
    return this.findVocabularyByIdForUser(vocabularyId, userId);
  },

  async deleteVocabulary(vocabularyId, userId) {
    const [result] = await pool.query(
      `DELETE tv FROM tu_vung tv
       INNER JOIN bo_tu_vung btv ON btv.id = tv.bo_tu_vung_id
       WHERE tv.id = ? AND btv.nguoi_dung_id = ?`,
      [vocabularyId, userId]
    );
    return result.affectedRows > 0;
  },

  async getVocabulariesBySetId(setId, userId, filters = {}) {
    const conditions = ['tv.bo_tu_vung_id = ?', 'btv.nguoi_dung_id = ?'];
    const params = [setId, userId];

    if (filters.search) {
      conditions.push('(tv.tu LIKE ? OR tv.nghia_vi LIKE ? OR tv.nghia_en LIKE ?)');
      const keyword = `%${filters.search}%`;
      params.push(keyword, keyword, keyword);
    }

    if (filters.partOfSpeech) {
      conditions.push('tv.tu_loai = ?');
      params.push(filters.partOfSpeech);
    }

    const [rows] = await pool.query(
      `SELECT tv.id, tv.bo_tu_vung_id AS set_id, tv.tu AS word, tv.phien_am AS phonetic,
              tv.tu_loai AS part_of_speech, tv.nghia_vi AS meaning_vi, tv.nghia_en AS meaning_en,
              tv.cau_vi_du AS example_sentence, tv.tu_dong_nghia AS synonyms, tv.tu_trai_nghia AS antonyms,
              tv.duong_dan_audio AS audio_url, tv.duong_dan_hinh AS image_url,
              tv.muc_do_kho AS difficulty_level, tv.nguon AS source,
              tv.tao_luc AS created_at, tv.cap_nhat_luc AS updated_at,
              EXISTS(
                SELECT 1 FROM the_ghi_nho tg
                WHERE tg.tu_vung_id = tv.id AND tg.nguoi_dung_id = ?
              ) AS has_flashcard
       FROM tu_vung tv
       INNER JOIN bo_tu_vung btv ON btv.id = tv.bo_tu_vung_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY tv.id DESC`,
      [userId, ...params]
    );
    return rows;
  },


  async findVocabularyByIdForUser(vocabularyId, userId) {
    const [rows] = await pool.query(
      `SELECT tv.id, tv.bo_tu_vung_id AS set_id, tv.tu AS word, tv.phien_am AS phonetic,
              tv.tu_loai AS part_of_speech, tv.nghia_vi AS meaning_vi, tv.nghia_en AS meaning_en,
              tv.cau_vi_du AS example_sentence, tv.muc_do_kho AS difficulty_level
       FROM tu_vung tv
       INNER JOIN bo_tu_vung btv ON btv.id = tv.bo_tu_vung_id
       WHERE tv.id = ? AND btv.nguoi_dung_id = ?`,
      [vocabularyId, userId]
    );
    return rows[0] || null;
  },

  async findVocabularyById(vocabularyId) {
    const [rows] = await pool.query(
      `SELECT id, bo_tu_vung_id AS set_id, tu AS word, phien_am AS phonetic,
              tu_loai AS part_of_speech, nghia_vi AS meaning_vi, nghia_en AS meaning_en,
              cau_vi_du AS example_sentence, muc_do_kho AS difficulty_level
       FROM tu_vung WHERE id = ?`,
      [vocabularyId]
    );
    return rows[0] || null;
  }
};
