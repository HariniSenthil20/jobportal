import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, User, Briefcase, CheckCheck, Clock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await api.get('/chat/conversations/');
      const list = res.data.results || res.data || [];
      setConversations(list);

      const queryConvId = searchParams.get('conversation');
      if (queryConvId) {
        const found = list.find((c) => c.id === Number(queryConvId));
        if (found) setActiveConv(found);
      } else if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll conversations every 4 seconds for real-time sidebar updates
    const interval = setInterval(() => {
      api.get('/chat/conversations/')
        .then((res) => {
          const list = res.data.results || res.data || [];
          setConversations(list);
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const updateConvLastMessage = (convId, text) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            last_message: {
              content: text,
              created_at: new Date().toISOString()
            }
          };
        }
        return c;
      })
    );
  };

  const fetchMessages = async (convId) => {
    try {
      setLoadingMsgs(true);
      const res = await api.get(`/chat/conversations/${convId}/messages/`);
      setMessages(res.data || []);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Connect WebSocket when active conversation changes
  useEffect(() => {
    if (!activeConv) return;

    fetchMessages(activeConv.id);

    // Setup WebSocket
    const wsUrl = `ws://localhost:8000/ws/chat/${activeConv.id}/`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log(`WebSocket connected to conversation ${activeConv.id}`);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data.content) {
        setMessages((prev) => [...prev, data]);
        updateConvLastMessage(activeConv.id, data.content);
        scrollToBottom();
      }
    };

    socketRef.current.onerror = (err) => {
      console.log("WebSocket error (falling back to REST):", err);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket closed.");
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [activeConv]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const text = inputText.trim();
    setInputText('');

    updateConvLastMessage(activeConv.id, text);

    // Try WebSocket send first if open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        message: text,
        sender_id: user.id
      }));
    } else {
      // Fallback to REST endpoint
      try {
        const res = await api.post(`/chat/conversations/${activeConv.id}/messages/`, { content: text });
        setMessages((prev) => [...prev, res.data]);
        scrollToBottom();
      } catch (err) {
        alert("Failed to send message.");
      }
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return 'Chat Participant';
    const other = conv.participants.find((p) => p.id !== user.id);
    return other ? `${other.first_name || other.username} ${other.last_name || ''}` : 'Recruiter / Candidate';
  };

  return (
    <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 120px)', overflow: 'hidden', padding: 0 }}>
      
      {/* Sidebar Conversations List */}
      <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--accent-primary)" /> Messages
          </h3>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {loadingConvs ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading messages...</p>
          ) : conversations.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '0.85rem' }}>
              No active conversations yet. Conversations start when a candidate applies to a job.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConv(conv);
                  setSearchParams({ conversation: conv.id });
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: activeConv?.id === conv.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                  borderLeft: activeConv?.id === conv.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{getOtherParticipant(conv)}</strong>
                  {conv.unread_count > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px' }}>
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{conv.job?.title}</p>
                {conv.last_message && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px' }}>
                    {conv.last_message.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Messaging Panel */}
      {activeConv ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Chat Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{getOtherParticipant(activeConv)}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Job Role: {activeConv.job?.title}</p>
            </div>
            <span className="badge badge-selected" style={{ fontSize: '0.7rem' }}>Real-time Chat Active</span>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loadingMsgs ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading chat history...</p>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                <MessageSquare size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p>Send a message to start the conversation.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?.id === user.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      background: isMe ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)' : 'var(--bg-card)',
                      color: '#fff',
                      padding: '12px 16px',
                      borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {!isMe && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        {msg.sender?.first_name || msg.sender?.username}
                      </span>
                    )}
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.content}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck size={14} color="rgba(255,255,255,0.8)" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-icon" style={{ borderRadius: 'var(--radius-sm)' }}>
              <Send size={18} />
            </button>
          </form>

        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Select a conversation from the left to start messaging.
        </div>
      )}

    </div>
  );
};

export default ChatPage;
