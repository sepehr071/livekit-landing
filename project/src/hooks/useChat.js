import { useState, useCallback } from 'react';

export const useChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (message) => {
    setIsStreaming(true);
    setError(null);
    setAgentMessage('');

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullMessage += parsed.content;
                setAgentMessage(fullMessage);
              }
              if (parsed.done) {
                setIsStreaming(false);
                return;
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setIsStreaming(false);
    }
  }, []);

  return { sendMessage, isStreaming, agentMessage, error };
};