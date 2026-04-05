/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage as ChatMessageType } from 'shared';

import { ChatMessage } from '../../components/ChatMessage';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { searchMovies } from '../../domain/api';
import { useAppStore } from '../../domain/store';
import { theme } from '../../styles/theme';

const container = css`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  min-height: 500px;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
`;

const header = css`
  text-align: center;
  padding: ${theme.spacing.lg} 0;
`;

const headerTitle = css`
  font-family: ${theme.fonts.heading};
  font-size: 1.6rem;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const headerSubtitle = css`
  color: ${theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const messagesArea = css`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg} 0;
`;

const emptyState = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  color: ${theme.colors.text.muted};
  text-align: center;
`;

const emptyIcon = css`
  font-size: 3rem;
  opacity: 0.5;
`;

const suggestions = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  justify-content: center;
  margin-top: ${theme.spacing.md};
`;

const suggestionChip = css`
  padding: 8px 16px;
  background: ${theme.colors.bg.elevated};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.full};
  color: ${theme.colors.text.secondary};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.bg.hover};
    border-color: ${theme.colors.accent.gold}40;
    color: ${theme.colors.text.primary};
  }
`;

const inputArea = css`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} 0;
  border-top: 1px solid ${theme.colors.border};
`;

const inputField = css`
  flex: 1;
  padding: 14px 20px;
  background: ${theme.colors.bg.tertiary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.full};
  color: ${theme.colors.text.primary};
  font-family: ${theme.fonts.body};
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: ${theme.colors.text.muted};
  }

  &:focus {
    border-color: ${theme.colors.accent.gold}60;
  }
`;

const sendButton = css`
  padding: 14px 28px;
  background: linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark});
  color: ${theme.colors.bg.primary};
  border: none;
  border-radius: ${theme.radii.full};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px ${theme.colors.accent.gold}40;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const clearButton = css`
  padding: 14px 16px;
  background: transparent;
  color: ${theme.colors.text.muted};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.full};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.accent.red}40;
    color: ${theme.colors.accent.red};
  }
`;

const EXAMPLE_QUERIES = [
  'Italian comedy movie',
  'Documentary about space',
  'Thriller from 2020',
  'Japanese animation',
  'Crime drama like The Godfather',
  'Sci-fi from year 2000',
];

export function Search() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { chatMessages, addMessage, clearMessages } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading, scrollToBottom]);

  const handleSend = useCallback(
    async (queryText?: string) => {
      const query = (queryText || input).trim();
      if (!query || isLoading) return;

      setInput('');

      // Add user message
      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: Date.now(),
      };
      addMessage(userMessage);

      setIsLoading(true);

      try {
        const response = await searchMovies(query);

        const assistantMessage: ChatMessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.message,
          movies: response.movies,
          timestamp: Date.now(),
        };
        addMessage(assistantMessage);
      } catch (err) {
        const errorMessage: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'Sorry, I couldn\'t find any movies matching your request. Try rephrasing or being more specific!',
          timestamp: Date.now(),
        };
        addMessage(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, addMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div css={container}>
      <div css={header}>
        <h2 css={headerTitle}>Movie Search</h2>
        <p css={headerSubtitle}>
          Describe the kind of movie you're looking for. Try genres, languages, years, or themes.
        </p>
      </div>

      <div css={messagesArea}>
        {chatMessages.length === 0 && !isLoading ? (
          <div css={emptyState}>
            <span css={emptyIcon}>&#127916;</span>
            <p>What kind of movie are you in the mood for?</p>
            <div css={suggestions}>
              {EXAMPLE_QUERIES.map((query) => (
                <button key={query} css={suggestionChip} onClick={() => handleSend(query)}>
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div css={inputArea}>
        {chatMessages.length > 0 && (
          <button css={clearButton} onClick={clearMessages} title="Clear chat">
            Clear
          </button>
        )}
        <input
          css={inputField}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Italian comedy, documentary about medicine from 2000..."
          disabled={isLoading}
        />
        <button css={sendButton} onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
          Search
        </button>
      </div>
    </div>
  );
}
