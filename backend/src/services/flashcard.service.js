import { ApiError } from '../utils/ApiError.js';
import { flashcardRepository } from '../repositories/flashcard.repository.js';
import { vocabRepository } from '../repositories/vocab.repository.js';
import { srsService } from './srs.service.js';

export const flashcardService = {
  async createFlashcard(userId, vocabularyId) {
    const vocabulary = await vocabRepository.findVocabularyById(vocabularyId);
    if (!vocabulary) {
      throw new ApiError(404, 'Vocabulary not found');
    }

    const flashcardId = await flashcardRepository.createFlashcard(userId, vocabulary);
    return { flashcardId };
  },

  async getDueCards(userId) {
    return flashcardRepository.getDueCards(userId);
  },

  async review(userId, flashcardId, payload) {
    const state = await flashcardRepository.findStateByFlashcardId(flashcardId, userId);
    if (!state) {
      throw new ApiError(404, 'Flashcard state not found');
    }

    const nextState = srsService.calculateNextState(state, payload.grade);

    await flashcardRepository.saveReview({
      flashcardId,
      userId,
      grade: payload.grade,
      responseTimeMs: payload.responseTimeMs,
      oldIntervalDays: state.interval_days,
      newIntervalDays: nextState.intervalDays,
      oldEaseFactor: state.ease_factor,
      newEaseFactor: nextState.easeFactor
    });

    await flashcardRepository.updateState(flashcardId, userId, {
      repetitionCount: nextState.repetitionCount,
      intervalDays: nextState.intervalDays,
      easeFactor: nextState.easeFactor,
      lapseCount: nextState.lapseCount,
      learningStatus: nextState.learningStatus,
      lastGrade: payload.grade,
      consecutiveCorrect: nextState.consecutiveCorrect,
      nextReviewAt: nextState.nextReviewAt
    });

    return {
      flashcardId,
      oldIntervalDays: state.interval_days,
      newIntervalDays: nextState.intervalDays,
      nextReviewAt: nextState.nextReviewAt,
      easeFactor: nextState.easeFactor,
      learningStatus: nextState.learningStatus
    };
  }
};
