import { pool } from '../config/db.js';

export const vocabRepository = {
  async createSet(userId, payload) {
    const { title, description, category } = payload;
    const [result] = await pool.query(
      'INSERT INTO vocabulary_sets (user_id, title, description, category) VALUES (?, ?, ?, ?)',
      [userId, title, description || null, category || null]
    );
    return result.insertId;
  },

  async getSets(userId) {
    const [rows] = await pool.query(
      `SELECT vs.*, COUNT(v.id) AS vocabulary_count
       FROM vocabulary_sets vs
       LEFT JOIN vocabularies v ON v.set_id = vs.id
       WHERE vs.user_id = ?
       GROUP BY vs.id
       ORDER BY vs.id DESC`,
      [userId]
    );
    return rows;
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
      `INSERT INTO vocabularies
       (set_id, word, phonetic, part_of_speech, meaning_vi, meaning_en, example_sentence)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [setId, word, phonetic || null, partOfSpeech || null, meaningVi, meaningEn || null, exampleSentence || null]
    );
    return result.insertId;
  },

  async getVocabulariesBySetId(setId, userId) {
    const [rows] = await pool.query(
      `SELECT v.*
       FROM vocabularies v
       INNER JOIN vocabulary_sets vs ON vs.id = v.set_id
       WHERE v.set_id = ? AND vs.user_id = ?
       ORDER BY v.id DESC`,
      [setId, userId]
    );
    return rows;
  },

  async findVocabularyById(vocabularyId) {
    const [rows] = await pool.query('SELECT * FROM vocabularies WHERE id = ?', [vocabularyId]);
    return rows[0] || null;
  }
};
