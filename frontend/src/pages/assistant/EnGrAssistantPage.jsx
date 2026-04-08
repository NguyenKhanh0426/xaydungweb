import { useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { aiService } from '../../services/aiService';
import { useLanguage } from '../../hooks/useLanguage';

export default function EnGrAssistantPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]);

  const placeholder = useMemo(
    () => (isVi
      ? 'Ví dụ: Giải thích câu "I have been studying for 2 hours" và cho tôi 3 câu tương tự.'
      : 'Example: Explain "I have been studying for 2 hours" and give me 3 similar examples.'),
    [isVi]
  );

  const handleAsk = async (event) => {
    event.preventDefault();
    if (!message.trim() || loading) return;

    const userTurn = { role: 'user', content: message.trim() };
    const nextChat = [...chat, userTurn];
    setChat(nextChat);
    setMessage('');
    setLoading(true);

    try {
      const response = await aiService.askAssistant({
        message: userTurn.content,
        history: chat.slice(-8)
      });
      setChat((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      const fallback = isVi ? 'Không gọi được EnGr. Hãy kiểm tra API key Gemini trong backend/.env.' : 'EnGr request failed. Please check Gemini API key in backend/.env.';
      setChat((prev) => [...prev, { role: 'assistant', content: error.response?.data?.message || fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="row g-4">
        <div className="col-12">
          <div className="dashboard-card">
            <div className="dashboard-card-body p-4 p-lg-5">
              <span className="dashboard-eyebrow">{isVi ? 'Trợ lý AI' : 'AI Assistant'}</span>
              <h3 className="mb-2">EnGr</h3>
              <p className="text-secondary mb-4">
                {isVi
                  ? 'Hỏi về từ vựng, giải thích câu, hoặc nhờ EnGr tạo ví dụ luyện tập.'
                  : 'Ask for vocabulary advice, sentence explanation, or short practice examples.'}
              </p>

              <div className="d-grid gap-3 mb-4">
                {chat.length === 0 ? (
                  <div className="empty-state-card">
                    <p className="mb-0 text-secondary">
                      {isVi
                        ? 'Bắt đầu bằng một câu hỏi tiếng Anh bất kỳ.'
                        : 'Start with any English learning question.'}
                    </p>
                  </div>
                ) : chat.map((item, index) => (
                  <div key={`${item.role}-${index}`} className={`p-3 rounded-3 ${item.role === 'user' ? 'bg-primary-subtle' : 'bg-light'}`}>
                    <div className="small fw-semibold mb-1">{item.role === 'user' ? (isVi ? 'Bạn' : 'You') : 'EnGr'}</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAsk} className="row g-3 align-items-end">
                <div className="col-12 col-lg-10">
                  <label className="auth-label">{isVi ? 'Câu hỏi' : 'Your question'}</label>
                  <textarea
                    className="form-control profile-textarea"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
                <div className="col-12 col-lg-2">
                  <button className="btn auth-submit-btn w-100" disabled={loading}>
                    {loading ? (isVi ? 'Đang gửi...' : 'Sending...') : (isVi ? 'Gửi' : 'Send')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
