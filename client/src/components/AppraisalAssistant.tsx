import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AppraisalAssistantProps {
  onDescriptionGenerated: (description: string) => void;
  onValueGenerated: (value: string) => void;
  onCategoryDetected: (category: string) => void;
  itemCategory: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const OPENING_MESSAGE = `I'm here to help you build a professional appraisal. Let's start simple — what are you having appraised today? You can describe it in plain language, like "a 14K gold chain" or "a diamond ring" or "a Rolex watch." The more detail you give me, the better the appraisal document will be.`;

export default function AppraisalAssistant({ onDescriptionGenerated, onValueGenerated, onCategoryDetected, itemCategory }: AppraisalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: OPENING_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await apiRequest('POST', '/api/appraisal/chat', {
        message,
        history,
        itemCategory,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const responseText = data.response || '';

      const descMatch = responseText.match(/---APPRAISAL_DESCRIPTION_START---([\s\S]*?)---APPRAISAL_DESCRIPTION_END---/);
      const valueMatch = responseText.match(/---APPRAISAL_VALUE_START---([\s\S]*?)---APPRAISAL_VALUE_END---/);
      const categoryMatch = responseText.match(/---APPRAISAL_CATEGORY_START---([\s\S]*?)---APPRAISAL_CATEGORY_END---/);

      if (descMatch) onDescriptionGenerated(descMatch[1].trim());
      if (valueMatch) onValueGenerated(valueMatch[1].trim());
      if (categoryMatch) {
        const validCategories = ['gold', 'diamond', 'watch', 'coin', 'jewelry'];
        const rawCat = categoryMatch[1].trim().toLowerCase().replace(/^category:\s*/i, '');
        const normalized = validCategories.find(c => rawCat.includes(c)) || rawCat;
        onCategoryDetected(normalized);
      }

      let cleanResponse = responseText
        .replace(/---APPRAISAL_DESCRIPTION_START---[\s\S]*?---APPRAISAL_DESCRIPTION_END---/g, '')
        .replace(/---APPRAISAL_VALUE_START---[\s\S]*?---APPRAISAL_VALUE_END---/g, '')
        .replace(/---APPRAISAL_CATEGORY_START---[\s\S]*?---APPRAISAL_CATEGORY_END---/g, '')
        .trim();

      if (descMatch && !cleanResponse) {
        cleanResponse = "I've generated a professional appraisal description and filled it in for you. Take a look at the form below — you can edit anything before submitting.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: cleanResponse || responseText,
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }]);

    chatMutation.mutate(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#1e293b',
          border: 'none',
          cursor: 'pointer',
          color: '#e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={16} color="#c9a84c" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Simplicity Appraisal Assistant</span>
          <Sparkles size={12} color="#c9a84c" />
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <>
          <div style={{
            maxHeight: 280,
            overflowY: 'auto',
            padding: '12px 16px',
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  marginBottom: 10,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.5,
                  background: msg.role === 'user' ? '#2E5090' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                  border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  color: '#94a3b8',
                }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            display: 'flex',
            gap: 8,
            padding: '10px 16px',
            borderTop: '1px solid #e2e8f0',
            background: '#fff',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your item..."
              disabled={chatMutation.isPending}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={chatMutation.isPending || !input.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: 'none',
                background: chatMutation.isPending || !input.trim() ? '#94a3b8' : '#2E5090',
                color: '#fff',
                cursor: chatMutation.isPending || !input.trim() ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
