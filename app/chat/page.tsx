'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Settings, Send, Paperclip, Mic, Image, FileText, Calendar, Mail, FolderOpen } from 'lucide-react';
import SettingsModal from '@/components/SettingsModal';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: any[];
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Implement actual API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I can help you with your Google Workspace tasks. You can ask me to:\n\n• Search and manage emails\n• Schedule meetings and check calendar\n• Create and organize documents\n• Manage tasks and to-dos\n• Create forms and surveys\n\nWhat would you like to do today?',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: Mail, label: 'Check emails', action: 'Show me my unread emails' },
    { icon: Calendar, label: 'Today\'s schedule', action: 'What\'s on my calendar today?' },
    { icon: FileText, label: 'Recent docs', action: 'Show my recent documents' },
    { icon: FolderOpen, label: 'My drive', action: 'Search my Google Drive' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-gray-900">Nexus AI Assistant</h1>
          <span className="text-sm text-gray-500">Powered by Google Workspace</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to Nexus, {session.user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-gray-600 mb-8">
                I'm your AI assistant for Google Workspace. How can I help you today?
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(action.action)}
                    className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    <action.icon className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your Google Workspace..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <div className="absolute right-2 bottom-2 flex space-x-1">
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <Image className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <Mic className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Nexus can make mistakes. Consider checking important info.
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          session={session} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
}