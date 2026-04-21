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
      const fallback = isVi
        ? 'Không gọi được EnGr. Kiểm tra GROQ_API_KEY (hoặc GEMINI nếu dùng AI_PROVIDER=gemini) trong backend/.env.'
        : 'EnGr request failed. Check GROQ_API_KEY (or GEMINI if using AI_PROVIDER=gemini) in backend/.env.';
      setChat((prev) => [...prev, { role: 'assistant', content: error.response?.data?.message || fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="engr-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? 'Trợ lý AI' : 'AI assistant'}</span>
          <h2 className="dashboard-page-title mb-2">EnGr</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Hỏi từ vựng, ngữ pháp hoặc xin ví dụ luyện tập — trả lời ngắn gọn, thực hành.' : 'Ask about vocabulary, grammar, or practice examples — concise, practical replies.'}</p>
        </div>

        <div className="app-surface-panel">
          <div className="app-toolbar">
            <div>
              <span className="dashboard-eyebrow">{isVi ? 'Hội thoại' : 'Chat'}</span>
              <h3 className="app-section-title fs-6 mb-0">{isVi ? 'Luồng tin nhắn' : 'Message thread'}</h3>
            </div>
            {loading ? <span className="text-secondary small">{isVi ? 'Đang trả lời...' : 'Thinking...'}</span> : null}
          </div>
          <div className="app-surface-panel-body pt-0">
            <div className="d-grid gap-3 mb-4" style={{ minHeight: '200px' }}>
              {chat.length === 0 ? (
                <div className="reminder-empty py-4">
                  <div className="reminder-empty-icon" aria-hidden>💬</div>
                  <p className="mb-0 text-secondary small">
                    {isVi ? 'Nhập câu hỏi tiếng Anh bên dưới để bắt đầu.' : 'Type an English learning question below to start.'}
                  </p>
                </div>
              ) : chat.map((item, index) => (
                <div key={`${item.role}-${index}`} className={item.role === 'user' ? 'app-chat-bubble-user' : 'app-chat-bubble-assistant'}>
                  <div className="small fw-bold mb-1 text-secondary">{item.role === 'user' ? (isVi ? 'Bạn' : 'You') : 'EnGr'}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }} className="small">{item.content}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAsk} className="row g-3 align-items-end border-top border-light-subtle pt-3">
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
                <button className="btn dashboard-primary-btn w-100 rounded-3 fw-bold py-2" type="submit" disabled={loading}>
                  {loading ? (isVi ? 'Đang gửi...' : 'Sending...') : (isVi ? 'Gửi' : 'Send')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
