import React, { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../services/api';

const SUGGESTED_QUESTIONS = [
  'What are my weakest subjects and how can I improve?',
  'Why did I score low on my recent assessments?',
  'Give me tips to improve my predicted grade',
  'How is my attendance affecting my performance?',
  'What are my strengths and how can I build on them?',
];

function PerformanceAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'You are connected to the BrightPath performance assistant. Ask about grades, attendance, risk trends, and improvement plans.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const tooltipTimerRef = useRef(null);

  useEffect(() => {
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => clearTimeout(tooltipTimerRef.current);
  }, []);

  const handleButtonHover = useCallback(() => {
    if (!isOpen) {
      setShowTooltip(true);
      clearTimeout(tooltipTimerRef.current);
    }
  }, [isOpen]);

  const handleButtonLeave = useCallback(() => {
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 1800);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText, options = {}) => {
    const { fromSuggestion = false } = options;
    const text = messageText || input.trim();

    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.filter((_, i) => i > 0).map((m) => ({ role: m.role, content: m.content }));

    try {
      const data = await apiClient.sendPerformanceChatMessage(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Request could not be completed. ${err.message || 'Please try again shortly.'}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      if (fromSuggestion) setShowSuggestedQuestions(true);
    }
  };

  const handleSuggestionClick = (question) => {
    setShowSuggestedQuestions(false);
    sendMessage(question, { fromSuggestion: true });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {showTooltip && !isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 animate-fade-in">
            <div className="relative whitespace-nowrap rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">
              Ask for performance guidance and next-step recommendations.
              <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 bg-neutral-900" />
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 ${
            isOpen ? 'bg-neutral-600 hover:bg-neutral-700' : 'bg-primary-600 hover:bg-primary-700'
          }`}
          title="Performance Assistant"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z"
              />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-slide-up"
          style={{ height: 'min(500px, calc(100vh - 10rem))' }}
        >
          <div className="border-b border-neutral-200 bg-neutral-800 px-5 py-4 text-white">
            <h3 className="text-sm font-semibold">BrightPath Performance Assistant</h3>
            <p className="text-xs text-slate-300">Personalized analysis based on your current records</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-neutral-50 px-4 py-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : msg.isError
                      ? 'border border-red-200 bg-red-50 text-red-800'
                      : 'border border-neutral-200 bg-white text-neutral-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Analyzing your data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showSuggestedQuestions && (
            <div className="border-t border-neutral-200 bg-white px-3 py-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Quick questions</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(q)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-[11px] text-neutral-700 transition hover:bg-neutral-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="border-t border-neutral-200 bg-white px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSuggestedQuestions((prev) => !prev)}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-700"
              >
                {showSuggestedQuestions ? 'Hide suggestions' : 'Show suggestions'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your performance"
                className="input-field rounded-full border-neutral-300 bg-neutral-50 focus:border-neutral-400 focus:ring-neutral-300"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default PerformanceAIChat;
