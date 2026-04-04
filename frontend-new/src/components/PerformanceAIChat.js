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

  const userQuestionCount = messages.filter((m) => m.role === 'user').length;
  const isFirstQuestionPending = userQuestionCount === 0;

  const sendMessage = async (messageText) => {
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
    }
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {showTooltip && !isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 animate-fade-in">
            <div className="relative whitespace-nowrap rounded-xl border border-primary-300/30 bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-2 text-sm text-white shadow-xl shadow-primary-900/30 dark:border-primary-400/25 dark:from-primary-600 dark:to-primary-500">
              Ask for performance guidance and next-step recommendations.
              <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-r border-b border-primary-400/35 bg-primary-600" />
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
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 ${
            isOpen
              ? 'bg-slate-700 ring-2 ring-slate-300/40 hover:bg-slate-800 dark:bg-slate-600 dark:ring-slate-500/40'
              : 'bg-gradient-to-br from-primary-600 to-primary-700 ring-2 ring-primary-300/45 hover:from-primary-700 hover:to-primary-800 dark:ring-primary-400/35'
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
          className="fixed bottom-24 right-6 z-50 flex w-[24rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-neutral-300/80 bg-white shadow-2xl ring-1 ring-neutral-200/70 backdrop-blur-md animate-slide-up dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:ring-[color:color-mix(in_srgb,var(--bp-border)_65%,transparent)]"
          style={{ height: 'min(500px, calc(100vh - 10rem))' }}
        >
          <div className="relative overflow-hidden border-b border-neutral-200/70 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-5 py-4 text-white dark:border-[var(--bp-border)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_45%)]" />
            <h3 className="relative text-base font-semibold tracking-tight">BrightPath Performance Assistant</h3>
            <p className="relative text-xs text-slate-200">Personalized analysis based on your current records</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-neutral-50 px-4 py-4 dark:bg-[var(--bp-surface-soft)]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-primary-900/25'
                      : msg.isError
                      ? 'border border-red-200 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-950/45 dark:text-red-200'
                      : 'border border-neutral-200 bg-white text-neutral-800 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:text-[var(--bp-text-muted)]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isFirstQuestionPending && (
              <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-3 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-[var(--bp-text-subtle)]">
                  Suggested questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(q)}
                      className="max-w-full truncate rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-[11px] text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:text-[var(--bp-text-muted)] dark:hover:border-primary-700/55 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
                      title={q}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:text-[var(--bp-text-subtle)]">
                  Analyzing your data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="border-t border-neutral-200 bg-white px-3 py-3 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            {!isFirstQuestionPending && (
              <div className="mb-2 border-b border-neutral-200/80 pb-2 dark:border-[var(--bp-border)]">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(q)}
                      className="shrink-0 rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[10px] text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:text-[var(--bp-text-muted)] dark:hover:border-primary-700/55 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
                      title={q}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your performance"
                className="input-field rounded-full border-neutral-300 bg-neutral-50 focus:border-primary-400 focus:ring-primary-300 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:text-[var(--bp-text)] dark:placeholder:text-[var(--bp-text-subtle)] dark:focus:border-primary-500 dark:focus:ring-primary-700/30"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-900/25 transition hover:from-primary-700 hover:to-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
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
