import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { vocabService } from '../../services/vocabService';
import { flashcardService } from '../../services/flashcardService';
import { useLanguage } from '../../hooks/useLanguage';

const initialWordForm = {
  word: '',
  phonetic: '',
  partOfSpeech: '',
  meaningVi: '',
  meaningEn: '',
  exampleSentence: ''
};

export default function VocabularyPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);
  const [setForm, setSetForm] = useState({ title: '', description: '', category: '' });
  const [wordForm, setWordForm] = useState(initialWordForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingWord, setAddingWord] = useState(false);
  const [creatingSet, setCreatingSet] = useState(false);

  const loadSets = async (preferredId) => {
    setLoading(true);
    try {
      const data = await vocabService.getSets();
      setSets(data);
      const nextSelected = preferredId || selectedSetId || data[0]?.id || null;
      setSelectedSetId(nextSelected);
      if (nextSelected) {
        const words = await vocabService.getVocabularies(nextSelected);
        setVocabularies(words);
      } else {
        setVocabularies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  const handleCreateSet = async (event) => {
    event.preventDefault();
    setCreatingSet(true);
    setMessage('');
    try {
      const created = await vocabService.createSet(setForm);
      setSetForm({ title: '', description: '', category: '' });
      setMessage(isVi ? 'Tạo bộ từ vựng thành công.' : 'Vocabulary set created.');
      await loadSets(created.id);
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Tạo bộ từ thất bại' : 'Failed to create set'));
    } finally {
      setCreatingSet(false);
    }
  };

  const handleSelectSet = async (setId) => {
    setSelectedSetId(setId);
    const words = await vocabService.getVocabularies(setId);
    setVocabularies(words);
  };

  const handleAddWord = async (event) => {
    event.preventDefault();
    if (!selectedSetId) return;
    setAddingWord(true);
    setMessage('');
    try {
      await vocabService.addVocabulary(selectedSetId, wordForm);
      setWordForm(initialWordForm);
      setMessage(isVi ? 'Thêm từ thành công.' : 'Word added successfully.');
      await handleSelectSet(selectedSetId);
      await loadSets(selectedSetId);
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Thêm từ thất bại' : 'Failed to add word'));
    } finally {
      setAddingWord(false);
    }
  };

  const handleCreateFlashcard = async (vocabularyId) => {
    try {
      await flashcardService.createFlashcard({ vocabularyId });
      setMessage(isVi ? 'Đã tạo flashcard cho từ này.' : 'Flashcard created for this word.');
    } catch (error) {
      setMessage(error.response?.data?.message || (isVi ? 'Tạo flashcard thất bại' : 'Failed to create flashcard'));
    }
  };

  return (
    <DashboardLayout>
      <div className="row g-4">
        <div className="col-12 col-xxl-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <span className="dashboard-eyebrow">{isVi ? 'Bộ sưu tập' : 'Collections'}</span>
              <h3 className="mb-2">{isVi ? 'Bộ từ vựng' : 'Vocabulary sets'}</h3>
              <p className="text-secondary mb-4">{isVi ? 'Sắp xếp từ theo chủ đề, kỳ thi hoặc độ khó để flashcard hiệu quả hơn.' : 'Organize words by topic, exam, or difficulty so flashcards stay meaningful.'}</p>
              <form className="row g-3" onSubmit={handleCreateSet}>
                <div className="col-12">
                  <input className="form-control auth-input" placeholder={isVi ? 'Tên bộ từ' : 'Set title'} value={setForm.title} onChange={(e) => setSetForm({ ...setForm, title: e.target.value })} />
                </div>
                <div className="col-12">
                  <input className="form-control auth-input" placeholder={isVi ? 'Danh mục' : 'Category'} value={setForm.category} onChange={(e) => setSetForm({ ...setForm, category: e.target.value })} />
                </div>
                <div className="col-12">
                  <textarea className="form-control profile-textarea" rows="3" placeholder={isVi ? 'Mô tả' : 'Description'} value={setForm.description} onChange={(e) => setSetForm({ ...setForm, description: e.target.value })} />
                </div>
                <div className="col-12">
                  <button className="btn auth-submit-btn w-100" disabled={creatingSet}>{creatingSet ? (isVi ? 'Đang tạo...' : 'Creating...') : (isVi ? 'Tạo bộ từ' : 'Create set')}</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{isVi ? 'Bộ từ của bạn' : 'Your sets'}</h5>
                <span className="profile-chip">{sets.length}</span>
              </div>
              {loading ? <p className="text-secondary mb-0">{isVi ? 'Đang tải bộ từ...' : 'Loading sets...'}</p> : (
                <div className="d-grid gap-2">
                  {sets.map((set) => (
                    <button
                      key={set.id}
                      type="button"
                      className={`set-list-item ${selectedSetId === set.id ? 'active' : ''}`}
                      onClick={() => handleSelectSet(set.id)}
                    >
                      <div className="d-flex justify-content-between gap-3 align-items-start">
                        <div className="text-start">
                          <strong className="d-block">{set.title}</strong>
                          <small className="text-secondary">{set.category || (isVi ? 'Từ vựng chung' : 'General vocabulary')}</small>
                        </div>
                        <span className="profile-chip profile-chip-soft">{set.vocabulary_count}</span>
                      </div>
                    </button>
                  ))}
                  {sets.length === 0 && <div className="empty-state-card"><p className="mb-0 text-secondary">{isVi ? 'Chưa có bộ từ nào.' : 'No sets yet.'}</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xxl-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Xây dựng từ vựng' : 'Word builder'}</span>
                  <h3 className="mb-1">{isVi ? 'Thêm từ vựng' : 'Add vocabulary'}</h3>
                  <p className="text-secondary mb-0">{isVi ? 'Chọn bộ từ, thêm từ mới, rồi chuyển thành flashcard chỉ với một lần nhấn.' : 'Select a set, add a word, then turn it into a flashcard with one click.'}</p>
                </div>
                {selectedSetId && <span className="profile-chip">Set #{selectedSetId}</span>}
              </div>
              {message && <div className="alert alert-info auth-alert">{message}</div>}
              <form className="row g-3" onSubmit={handleAddWord}>
                <div className="col-12 col-md-6">
                  <input className="form-control auth-input" placeholder={isVi ? 'Từ' : 'Word'} value={wordForm.word} onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control auth-input" placeholder={isVi ? 'Phiên âm' : 'Phonetic'} value={wordForm.phonetic} onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control auth-input" placeholder={isVi ? 'Từ loại' : 'Part of speech'} value={wordForm.partOfSpeech} onChange={(e) => setWordForm({ ...wordForm, partOfSpeech: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control auth-input" placeholder={isVi ? 'Nghĩa (Anh)' : 'Meaning (EN)'} value={wordForm.meaningEn} onChange={(e) => setWordForm({ ...wordForm, meaningEn: e.target.value })} />
                </div>
                <div className="col-12">
                  <input className="form-control auth-input" placeholder={isVi ? 'Nghĩa (Việt)' : 'Meaning (VI)'} value={wordForm.meaningVi} onChange={(e) => setWordForm({ ...wordForm, meaningVi: e.target.value })} />
                </div>
                <div className="col-12">
                  <textarea className="form-control profile-textarea" rows="3" placeholder={isVi ? 'Câu ví dụ' : 'Example sentence'} value={wordForm.exampleSentence} onChange={(e) => setWordForm({ ...wordForm, exampleSentence: e.target.value })} />
                </div>
                <div className="col-12">
                  <button className="btn auth-submit-btn px-4" disabled={!selectedSetId || addingWord}>{addingWord ? (isVi ? 'Đang thêm...' : 'Adding...') : (isVi ? 'Thêm từ vựng' : 'Add vocabulary')}</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Danh sách từ vựng' : 'Vocabulary list'}</span>
                  <h3 className="mb-1">{isVi ? 'Các từ trong bộ đã chọn' : 'Words in selected set'}</h3>
                  <p className="text-secondary mb-0">{isVi ? 'Xây dựng ngân hàng từ, rồi chuyển các từ quan trọng thành flashcard lặp lại ngắt quãng.' : 'Build your bank, then convert strong candidates into spaced-repetition flashcards.'}</p>
                </div>
                <span className="profile-chip">{vocabularies.length} {isVi ? 'từ' : 'words'}</span>
              </div>

              {!selectedSetId ? <div className="empty-state-card"><h5>{isVi ? 'Hãy chọn bộ từ trước' : 'Select a set first'}</h5><p className="mb-0 text-secondary">{isVi ? 'Chọn một bộ từ ở bên trái để quản lý các từ trong bộ.' : 'Choose a vocabulary set on the left to manage its words.'}</p></div> : vocabularies.length === 0 ? (
                <div className="empty-state-card"><h5>{isVi ? 'Chưa có từ nào' : 'No words yet'}</h5><p className="mb-0 text-secondary">{isVi ? 'Hãy thêm từ đầu tiên để bắt đầu tạo flashcard.' : 'Add your first vocabulary item to begin building flashcards.'}</p></div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle modern-table">
                    <thead>
                      <tr>
                        <th>{isVi ? 'Từ' : 'Word'}</th>
                        <th>{isVi ? 'Nghĩa' : 'Meaning'}</th>
                        <th>{isVi ? 'Ví dụ' : 'Example'}</th>
                        <th className="text-end">{isVi ? 'Hành động' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vocabularies.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-semibold">{item.word}</div>
                            <small className="text-secondary">{item.phonetic || item.part_of_speech || (isVi ? 'Chưa có phiên âm' : 'No phonetic yet')}</small>
                          </td>
                          <td>
                            <div>{item.meaning_vi}</div>
                            <small className="text-secondary">{item.meaning_en || '—'}</small>
                          </td>
                          <td className="text-secondary small">{item.example_sentence || (isVi ? 'Chưa có câu ví dụ' : 'No example sentence')}</td>
                          <td className="text-end">
                            <button type="button" className="btn btn-sm dashboard-primary-btn" onClick={() => handleCreateFlashcard(item.id)}>{isVi ? 'Tạo flashcard' : 'Create flashcard'}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
