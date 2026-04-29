import React, { useState } from 'react';
import { aiService } from '../services/aiService';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me about events, clubs, canteen orders, announcements, or notifications.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const data = await aiService.sendMessage(trimmed);
      setMessages((current) => [...current, { role: 'assistant', text: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: error.response?.data?.message || 'AI assistant is unavailable right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="font-h2 text-[32px] font-bold text-on-surface mb-2">AI Assistant</h2>
        <p className="font-body-md text-[16px] text-on-surface-variant">A campus helper for quick guidance and shortcuts.</p>
      </div>

      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 flex flex-col gap-4 min-h-[60vh]">
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'ml-auto bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}>
              {message.text}
            </div>
          ))}
          {loading && <div className="text-sm text-on-surface-variant">Thinking...</div>}
        </div>

        <form onSubmit={handleSend} className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-1 rounded-2xl border border-outline-variant/30 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Ask something about campus services..."
          />
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-on-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;