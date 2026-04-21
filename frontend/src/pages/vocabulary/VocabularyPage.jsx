import { useEffect, useMemo, useState } from 'react';
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

const initialSetForm = { title: '', description: '', category: '' };

export default function VocabularyPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [vocabularies, setVocabularies] = useState([]);
  const [setForm, setSetForm] = useState(initialSetForm);
  const [editingSetId, setEditingSetId] = useState(null);
  const [wordForm, setWordForm] = useState(initialWordForm);
  const [editingWordId, setEditingWordId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingWord, setAddingWord] = useState(false);
  const [creatingSet, setCreatingSet] = useState(false);
  const [search, setSearch] = useState('');
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState('');

  const selectedSet = useMemo(() => sets.find((item) => item.id === selectedSetId) || null, [sets, selectedSetId]);
  const partOfSpeechOptions = useMemo(() => [...new Set(vocabularies.map((item) => item.part_of_speech).filter(Boolean))], [vocabularies]);

  const loadSets = async (preferredId = undefined) => {
    setLoading(true);
    try {
      const data = await vocabService.getSets();
      setSets(data);
      const currentSelected = data.find((item) => item.id === selectedSetId)?.id || null;
      const nextSelected = preferredId !== undefined ? preferredId : (currentSelected || data[0]?.id || null);
      setSelectedSetId(nextSelected);
    } finally {
      setLoading(false);
    }
  };

  const loadWords = async (setId = selectedSetId, nextSearch = search, nextPartOfSpeech = partOfSpeechFilter) => {
    if (!setId) {
      setVocabularies([]);
      return;
    }
    const words = await vocabService.getVocabularies(setId, {
      search: nextSearch || undefined,
      partOfSpeech: nextPartOfSpeech || undefined
    });
    setVocabularies(words);
  };

  useEffect(() => {
    loadSets(undefined);
  }, []);

  useEffect(() => {
    if (selectedSetId) {
      loadWords(selectedSetId, search, partOfSpeechFilter);
    }
  }, [selectedSetId, search, partOfSpeechFilter]);

  useEffect(() => {
    if (selectedSet) {
      setSetForm({
        title: selectedSet.title || '',
        description: selectedSet.description || '',
        category: selectedSet.category || ''
      });
      setEditingSetId(selectedSet.id);
    }
  }, [selectedSet]);

  const resetWordForm = () => {
    setWordForm(initialWordForm);
    setEditingWordId(null);
  };

  const handleCreateOrUpdateSet = async (event) => {
    event.preventDefault();
    setCreatingSet(true);
    setMessage('');
    try {
      if (editingSetId && selectedSetId === editingSetId && selectedSet) {
        await vocabService.updateSet(editingSetId, setForm);
        setMessage(isVi ? 'Cập nhật bộ từ thành công.' : 'Vocabulary set updated.');
        await loadSets(editingSetId);
      } else {
        const created = await vocabService.createSet(setForm);
        setSetForm(initialSetForm);
        setMessage(isVi ? 'Tạo bộ từ vựng thành công.' : 'Vocabulary set created.');
        await loadSets(created.id);
      }
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Lưu bộ từ thất bại' : 'Failed to save set'));
    } finally {
      setCreatingSet(false);
    }
  };

  const handleDeleteSet = async () => {
    if (!selectedSetId) return;
    const confirmed = window.confirm(isVi ? 'Bạn có chắc muốn xóa bộ từ này không?' : 'Are you sure you want to delete this set?');
    if (!confirmed) return;
    try {
      await vocabService.deleteSet(selectedSetId);
      setMessage(isVi ? 'Đã xóa bộ từ.' : 'Vocabulary set deleted.');
      setSelectedSetId(null);
      setSetForm(initialSetForm);
      setEditingSetId(null);
      await loadSets(undefined);
    } catch (error) {
      setMessage(error.response?.data?.message || (isVi ? 'Xóa bộ từ thất bại' : 'Failed to delete set'));
    }
  };

  const handleSelectSet = async (setId) => {
    setSelectedSetId(setId);
    setSearch('');
    setPartOfSpeechFilter('');
    setEditingSetId(setId);
  };

  const handleAddOrUpdateWord = async (event) => {
    event.preventDefault();
    if (!selectedSetId) return;
    setAddingWord(true);
    setMessage('');
    try {
      if (editingWordId) {
        await vocabService.updateVocabulary(editingWordId, wordForm);
        setMessage(isVi ? 'Cập nhật từ thành công.' : 'Word updated successfully.');
      } else {
        await vocabService.addVocabulary(selectedSetId, wordForm);
        setMessage(isVi ? 'Thêm từ thành công.' : 'Word added successfully.');
      }
      resetWordForm();
      await loadWords(selectedSetId, search, partOfSpeechFilter);
      await loadSets(selectedSetId);
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Lưu từ thất bại' : 'Failed to save word'));
    } finally {
      setAddingWord(false);
    }
  };

  const handleEditWord = (item) => {
    setEditingWordId(item.id);
    setWordForm({
      word: item.word || '',
      phonetic: item.phonetic || '',
      partOfSpeech: item.part_of_speech || '',
      meaningVi: item.meaning_vi || '',
      meaningEn: item.meaning_en || '',
      exampleSentence: item.example_sentence || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteWord = async (vocabularyId) => {
    const confirmed = window.confirm(isVi ? 'Bạn có chắc muốn xóa từ này không?' : 'Are you sure you want to delete this word?');
    if (!confirmed) return;
    try {
      await vocabService.deleteVocabulary(vocabularyId);
      setMessage(isVi ? 'Đã xóa từ vựng.' : 'Vocabulary deleted.');
      if (editingWordId === vocabularyId) resetWordForm();
      await loadWords(selectedSetId, search, partOfSpeechFilter);
      await loadSets(selectedSetId);
    } catch (error) {
      setMessage(error.response?.data?.message || (isVi ? 'Xóa từ thất bại' : 'Failed to delete word'));
    }
  };

  const handleCreateFlashcard = async (vocabularyId) => {
    try {
      await flashcardService.createFlashcard({ vocabularyId });
      setMessage(isVi ? 'Đã tạo flashcard cho từ này.' : 'Flashcard created for this word.');
      await loadWords(selectedSetId, search, partOfSpeechFilter);
    } catch (error) {
      setMessage(error.response?.data?.message || (isVi ? 'Tạo flashcard thất bại' : 'Failed to create flashcard'));
    }
  };

  return (
    <DashboardLayout>
      <div className="vocabulary-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? 'Từ vựng' : 'Vocabulary'}</span>
          <h2 className="dashboard-page-title mb-2">{isVi ? 'Quản lý bộ từ' : 'Manage word sets'}</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Tạo bộ từ, thêm từ và tra cứu nhanh — gắn với flashcard và mini test.' : 'Create sets, add words, search fast — links to flashcards and mini tests.'}</p>
        </div>

        {message ? <div className="alert alert-info auth-alert py-2 mb-4">{message}</div> : null}

        <div className="row g-4">
          <div className="col-12 col-xxl-4">
            <div className="app-surface-panel app-surface-panel--gradient mb-4">
              <div className="app-surface-panel-header">
                <span className="dashboard-eyebrow">{isVi ? 'Bộ sưu tập' : 'Collections'}</span>
                <h3 className="app-section-title mb-1">{editingSetId && selectedSetId ? (isVi ? 'Sửa bộ từ' : 'Edit set') : (isVi ? 'Tạo bộ từ' : 'New set')}</h3>
                <p className="text-secondary small mb-0">{isVi ? 'Tên, danh mục và mô tả ngắn.' : 'Title, category, and short description.'}</p>
              </div>
              <div className="app-surface-panel-body">
                <form className="row g-3" onSubmit={handleCreateOrUpdateSet}>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Tên bộ từ' : 'Set title'}</label>
                    <input className="form-control auth-input" placeholder={isVi ? 'Tên bộ từ' : 'Set title'} value={setForm.title} onChange={(e) => setSetForm({ ...setForm, title: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Danh mục' : 'Category'}</label>
                    <input className="form-control auth-input" placeholder={isVi ? 'Danh mục' : 'Category'} value={setForm.category} onChange={(e) => setSetForm({ ...setForm, category: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Mô tả' : 'Description'}</label>
                    <textarea className="form-control profile-textarea" rows="3" placeholder={isVi ? 'Mô tả' : 'Description'} value={setForm.description} onChange={(e) => setSetForm({ ...setForm, description: e.target.value })} />
                  </div>
                  <div className="col-12 d-flex gap-2 flex-wrap">
                    <button className="btn dashboard-primary-btn flex-grow-1 rounded-3 fw-bold" type="submit" disabled={creatingSet}>
                      {creatingSet ? (isVi ? 'Đang lưu...' : 'Saving...') : (editingSetId && selectedSetId ? (isVi ? 'Cập nhật bộ' : 'Update set') : (isVi ? 'Tạo bộ' : 'Create set'))}
                    </button>
                    <button type="button" className="btn btn-outline-secondary rounded-3 fw-semibold" onClick={() => { setEditingSetId(null); setSelectedSetId(null); setSetForm(initialSetForm); setSearch(''); setPartOfSpeechFilter(''); }}>{isVi ? 'Mới' : 'New'}</button>
                  </div>
                  {selectedSetId ? (
                    <div className="col-12">
                      <button type="button" className="btn btn-outline-danger w-100 rounded-3" onClick={handleDeleteSet}>{isVi ? 'Xóa bộ đang chọn' : 'Delete selected set'}</button>
                    </div>
                  ) : null}
                </form>
              </div>
            </div>

            <div className="app-surface-panel">
              <div className="app-toolbar">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Danh sách' : 'List'}</span>
                  <h3 className="app-section-title fs-6 mb-0">{isVi ? 'Bộ từ của bạn' : 'Your sets'}</h3>
                </div>
                <span className="app-count-pill">{sets.length}</span>
              </div>
              <div className="app-surface-panel-body app-surface-panel-body--tight-top">
                {loading ? <p className="text-secondary small mb-0">{isVi ? 'Đang tải...' : 'Loading...'}</p> : (
                  <div className="d-grid gap-2">
                    {sets.map((set) => (
                      <button
                        key={set.id}
                        type="button"
                        className={`set-list-item ${selectedSetId === set.id ? 'active' : ''}`}
                        onClick={() => handleSelectSet(set.id)}
                      >
                        <div className="d-flex justify-content-between gap-3 align-items-start">
                          <div className="text-start min-w-0">
                            <strong className="d-block text-truncate">{set.title}</strong>
                            <small className="text-secondary">{set.category || (isVi ? 'Từ vựng chung' : 'General')}</small>
                          </div>
                          <span className="profile-chip profile-chip-soft flex-shrink-0">{set.vocabulary_count}</span>
                        </div>
                      </button>
                    ))}
                    {sets.length === 0 ? (
                      <div className="reminder-empty py-3">
                        <p className="mb-0 text-secondary small">{isVi ? 'Chưa có bộ từ.' : 'No sets yet.'}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xxl-8">
            <div className="app-surface-panel app-surface-panel--gradient mb-4">
              <div className="app-surface-panel-header">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                  <div>
                    <span className="dashboard-eyebrow">{isVi ? 'Từ mới' : 'Words'}</span>
                    <h3 className="app-section-title mb-1">{editingWordId ? (isVi ? 'Sửa từ' : 'Edit word') : (isVi ? 'Thêm từ' : 'Add word')}</h3>
                    <p className="text-secondary small mb-0">{isVi ? 'Điền đầy đủ nghĩa và ví dụ để ôn hiệu quả.' : 'Fill meanings and an example for better review.'}</p>
                  </div>
                  {selectedSetId ? <span className="profile-chip">{selectedSet?.title || `Set #${selectedSetId}`}</span> : null}
                </div>
              </div>
              <div className="app-surface-panel-body">
                <form className="row g-3" onSubmit={handleAddOrUpdateWord}>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Từ' : 'Word'}</label>
                    <input className="form-control auth-input" placeholder={isVi ? 'Từ' : 'Word'} value={wordForm.word} onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Phiên âm' : 'Phonetic'}</label>
                    <input className="form-control auth-input" placeholder={isVi ? 'Phiên âm' : 'Phonetic'} value={wordForm.phonetic} onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Từ loại' : 'POS'}</label>
                    <input className="form-control auth-input" placeholder={isVi ? 'Từ loại' : 'Part of speech'} value={wordForm.partOfSpeech} onChange={(e) => setWordForm({ ...wordForm, partOfSpeech: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Nghĩa (Anh)' : 'Meaning (EN)'}</label>
                    <input className="form-control auth-input" placeholder={isVi ? 'Nghĩa (Anh)' : 'Meaning (EN)'} value={wordForm.meaningEn} onChange={(e) => setWordForm({ ...wordForm, meaningEn: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Nghĩa (Việt)' : 'Meaning (VI)'}</label>
                    <input className="form-control auth-input" placeholder={isVi ? 'Nghĩa (Việt)' : 'Meaning (VI)'} value={wordForm.meaningVi} onChange={(e) => setWordForm({ ...wordForm, meaningVi: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Câu ví dụ' : 'Example'}</label>
                    <textarea className="form-control profile-textarea" rows="3" placeholder={isVi ? 'Câu ví dụ' : 'Example sentence'} value={wordForm.exampleSentence} onChange={(e) => setWordForm({ ...wordForm, exampleSentence: e.target.value })} />
                  </div>
                  <div className="col-12 d-flex gap-2 flex-wrap">
                    <button className="btn dashboard-primary-btn px-4 rounded-3 fw-bold" type="submit" disabled={!selectedSetId || addingWord}>
                      {addingWord ? (isVi ? 'Đang lưu...' : 'Saving...') : (editingWordId ? (isVi ? 'Cập nhật từ' : 'Update word') : (isVi ? 'Thêm từ' : 'Add word'))}
                    </button>
                    {editingWordId ? <button type="button" className="btn btn-outline-secondary rounded-3" onClick={resetWordForm}>{isVi ? 'Hủy sửa' : 'Cancel'}</button> : null}
                  </div>
                </form>
              </div>
            </div>

            <div className="app-surface-panel">
              <div className="app-toolbar">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Tra cứu' : 'Lookup'}</span>
                  <h3 className="app-section-title fs-6 mb-1">{isVi ? 'Từ trong bộ đã chọn' : 'Words in set'}</h3>
                  <p className="text-secondary small mb-0">{isVi ? 'Tìm và lọc theo từ loại.' : 'Search and filter by part of speech.'}</p>
                </div>
                <span className="app-count-pill">{vocabularies.length}</span>
              </div>
              <div className="app-surface-panel-body app-surface-panel-body--tight-top">
                {!selectedSetId ? (
                  <div className="reminder-empty my-2">
                    <h5 className="fw-bold mb-2">{isVi ? 'Chọn bộ từ' : 'Select a set'}</h5>
                    <p className="mb-0 text-secondary small">{isVi ? 'Chọn một bộ ở cột trái để xem và chỉnh từ.' : 'Pick a set on the left to view and edit words.'}</p>
                  </div>
                ) : (
                  <>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-8">
                        <input className="form-control auth-input" placeholder={isVi ? 'Tìm theo từ, nghĩa...' : 'Search word, meaning...'} value={search} onChange={(e) => setSearch(e.target.value)} />
                      </div>
                      <div className="col-12 col-md-4">
                        <select className="form-select auth-input" value={partOfSpeechFilter} onChange={(e) => setPartOfSpeechFilter(e.target.value)}>
                          <option value="">{isVi ? 'Mọi từ loại' : 'All POS'}</option>
                          {partOfSpeechOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>

                    {vocabularies.length === 0 ? (
                      <div className="reminder-empty py-3">
                        <p className="mb-0 text-secondary small">{isVi ? 'Không có từ phù hợp.' : 'No matching words.'}</p>
                      </div>
                    ) : (
                      <div className="app-table-card">
                        <div className="table-responsive">
                          <table className="table align-middle modern-table">
                            <thead>
                              <tr>
                                <th>{isVi ? 'Từ' : 'Word'}</th>
                                <th>{isVi ? 'Nghĩa' : 'Meaning'}</th>
                                <th>{isVi ? 'Ví dụ' : 'Example'}</th>
                                <th className="text-end">{isVi ? 'Thao tác' : 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vocabularies.map((item) => (
                                <tr key={item.id}>
                                  <td>
                                    <div className="fw-semibold">{item.word}</div>
                                    <small className="text-secondary">{item.phonetic || item.part_of_speech || (isVi ? '—' : '—')}</small>
                                  </td>
                                  <td>
                                    <div>{item.meaning_vi}</div>
                                    <small className="text-secondary">{item.meaning_en || '—'}</small>
                                  </td>
                                  <td className="text-secondary small">{item.example_sentence || (isVi ? '—' : '—')}</td>
                                  <td className="text-end">
                                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                                      <button type="button" className="btn btn-sm dashboard-primary-btn rounded-3" onClick={() => handleCreateFlashcard(item.id)} disabled={Boolean(item.has_flashcard)}>{item.has_flashcard ? (isVi ? 'Đã có thẻ' : 'Card OK') : (isVi ? 'Flashcard' : 'Flashcard')}</button>
                                      <button type="button" className="btn btn-sm btn-outline-secondary rounded-3" onClick={() => handleEditWord(item)}>{isVi ? 'Sửa' : 'Edit'}</button>
                                      <button type="button" className="btn btn-sm btn-outline-danger rounded-3" onClick={() => handleDeleteWord(item.id)}>{isVi ? 'Xóa' : 'Del'}</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
