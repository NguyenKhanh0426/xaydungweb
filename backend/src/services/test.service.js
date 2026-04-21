import { ApiError } from '../utils/ApiError.js';
import { vocabRepository } from '../repositories/vocab.repository.js';
import { testRepository } from '../repositories/test.repository.js';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export const testService = {
  async generateMiniTest(userId, payload) {
    const setInfo = await vocabRepository.findSetById(payload.setId, userId);
    if (!setInfo) {
      throw new ApiError(404, 'Vocabulary set not found');
    }

    const vocabularies = await vocabRepository.getVocabulariesBySetId(payload.setId, userId, {});
    if (vocabularies.length < 4) {
      throw new ApiError(400, 'A mini test needs at least 4 words in the selected set');
    }

    const totalQuestions = Math.min(Number(payload.totalQuestions || 5), vocabularies.length, 10);
    const selectedWords = shuffle(vocabularies).slice(0, totalQuestions);

    const questions = selectedWords.map((word) => {
      const distractors = shuffle(vocabularies.filter((item) => item.id !== word.id)).slice(0, 3);
      const options = shuffle([
        { text: word.meaning_vi, isCorrect: true },
        ...distractors.map((item) => ({ text: item.meaning_vi, isCorrect: false }))
      ]);

      return {
        word: word.word,
        difficultyLevel: word.difficulty_level || 1,
        correctOption: { text: word.meaning_vi },
        explanation: word.example_sentence || word.meaning_en || 'Ôn lại từ này để nhớ lâu hơn.',
        options
      };
    });

    const created = await testRepository.createMiniTest(userId, setInfo, questions);
    const fullAttempt = await testRepository.getAttemptQuestions(userId, created.attemptId);

    return {
      attemptId: created.attemptId,
      title: fullAttempt.title,
      totalQuestions: fullAttempt.questions.length,
      questions: fullAttempt.questions.map((question) => ({
        id: question.id,
        content: question.content,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          text: option.text
        }))
      }))
    };
  },

  async submitMiniTest(userId, attemptId, payload) {
    const attempt = await testRepository.getAttemptQuestions(userId, attemptId);
    if (!attempt) {
      throw new ApiError(404, 'Mini test attempt not found');
    }
    if (!payload.answers?.length) {
      throw new ApiError(400, 'Please answer at least one question before submitting');
    }
    return testRepository.saveAttemptResult(userId, attemptId, attempt, payload.answers, payload.timeSpentSeconds);
  },

  async getRecentAttempts(userId) {
    return testRepository.getRecentAttempts(userId, 10);
  },

  async getAttemptHistory(userId, query = {}) {
    const dateFilter = typeof query.date === 'string' && query.date.trim() ? query.date.trim() : null;
    return testRepository.getAttemptHistory(userId, { date: dateFilter });
  }
};
