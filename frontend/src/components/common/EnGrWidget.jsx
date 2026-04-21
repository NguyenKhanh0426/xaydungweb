import { useState } from 'react';
import { aiService } from '../../services/aiService';
import { useLanguage } from '../../hooks/useLanguage';

export default function EnGrWidget() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const handleAsk = async (event) => {
    event.preventDefault();
    if (!message.trim() || loading) return;

    const userTurn = { role: 'user', content: message.trim() };
    setChat((prev) => [...prev, userTurn]);
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
        ? 'Không gọi được EnGr. Kiểm tra GROQ_API_KEY hoặc cấu hình AI (backend/.env).'
        : 'EnGr request failed. Check GROQ_API_KEY or AI settings in backend/.env.';
      setChat((prev) => [...prev, { role: 'assistant', content: error.response?.data?.message || fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="engr-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open EnGr assistant"
      >
        EnGr
      </button>

      {open ? (
        <div className="engr-panel">
          <div className="engr-panel-header">
            <strong>EnGr</strong>
            <button type="button" className="btn btn-sm btn-light" onClick={() => setOpen(false)}>
              {isVi ? 'Đóng' : 'Close'}
            </button>
          </div>

          <div className="engr-chat-list">
            {chat.length === 0 ? (
              <p className="text-secondary small mb-0">
                {isVi ? 'Hỏi về từ vựng hoặc nhờ giải thích câu.' : 'Ask about vocabulary or sentence explanation.'}
              </p>
            ) : chat.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`engr-chat-item ${item.role === 'user' ? 'user' : 'assistant'}`}>
                <div className="small fw-semibold mb-1">{item.role === 'user' ? (isVi ? 'Bạn' : 'You') : 'EnGr'}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAsk} className="engr-input-wrap">
            <textarea
              className="form-control"
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isVi ? 'Nhập câu hỏi...' : 'Type your question...'}
            />
            <button className="btn dashboard-primary-btn" disabled={loading}>
              {loading ? (isVi ? 'Đang gửi...' : 'Sending...') : (isVi ? 'Gửi' : 'Send')}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
