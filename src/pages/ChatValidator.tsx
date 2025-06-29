import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ExternalLink, CheckCircle2, XCircle, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { hybridTranslationService } from '../lib/hybridTranslation';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  credibilityScore?: number;
  sources?: string[];
  flags?: string[];
  isTranslated?: boolean;
  originalContent?: string;
  translationService?: string;
}

const ChatValidator: React.FC = () => {
  const { user, profile } = useAuth();
  const { currentLanguage, needsTranslation } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI news validator. You can paste a news article, URL, or ask me to verify any claim. I\'ll analyze it for credibility and provide sources.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Translate initial bot message when language changes
  useEffect(() => {
    if (needsTranslation && currentLanguage.code !== 'en') {
      translateBotMessages();
    }
  }, [currentLanguage.code, needsTranslation]);

  const translateBotMessages = async () => {
    if (currentLanguage.code === 'en') return;

    setTranslating(true);
    try {
      const translatedMessages = await Promise.all(
        messages.map(async (message) => {
          if (message.type === 'bot' && !message.isTranslated) {
            // Use hybrid translation for chat responses
            const result = await hybridTranslationService.translateChatResponse(
              message.content,
              'en',
              currentLanguage.code
            );
            return {
              ...message,
              content: result.translatedText,
              originalContent: message.content,
              isTranslated: true,
              translationService: result.service,
            };
          }
          return message;
        })
      );
      setMessages(translatedMessages);
    } catch (error) {
      console.error('Failed to translate bot messages:', error);
    } finally {
      setTranslating(false);
    }
  };

  const verifyNews = async (text: string): Promise<ChatMessage> => {
    // Prevent empty or invalid requests
    if (!text || !text.trim()) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Please enter a news article URL or text to verify.',
        timestamp: new Date().toISOString(),
      };
    }
    try {
      // Determine if input is a URL
      let payload: Record<string, any> = { language: currentLanguage.code };
      if (text.startsWith('http')) {
        payload.url = text;
      } else {
        payload.text = text;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-verify-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to verify news';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) errorMsg = errorData.error;
        } catch {}
        throw new Error(errorMsg);
      }

      const result = await response.json();

      let botContent = `${result.analysis}\n\n**Recommendation:** ${result.recommendation}`;

      // Translate bot response if needed using hybrid translation
      let translationService = 'none';
      if (needsTranslation && currentLanguage.code !== 'en') {
        try {
          const translationResult = await hybridTranslationService.translateChatResponse(
            botContent,
            'en',
            currentLanguage.code
          );
          botContent = translationResult.translatedText;
          translationService = translationResult.service;
        } catch (translationError) {
          console.error('Failed to translate bot response:', translationError);
          // Keep original content if translation fails
        }
      }

      return {
        id: Date.now().toString(),
        type: 'bot',
        content: botContent,
        timestamp: new Date().toISOString(),
        credibilityScore: result.credibilityScore,
        sources: result.sources,
        flags: result.flags,
        isTranslated: needsTranslation && currentLanguage.code !== 'en',
        translationService: translationService,
      };
    } catch (error) {
      console.error('Error verifying news:', error);
      let errorContent = typeof error === 'string' ? error : (error as Error).message || 'I apologize, but I encountered an error while analyzing your request. Please try again or check your internet connection.';
      // Translate error message if needed
      let translationService = 'none';
      if (needsTranslation && currentLanguage.code !== 'en') {
        try {
          const translationResult = await hybridTranslationService.translateChatResponse(
            errorContent,
            'en',
            currentLanguage.code
          );
          errorContent = translationResult.translatedText;
          translationService = translationResult.service;
        } catch (translationError) {
          console.error('Failed to translate error message:', translationError);
        }
      }
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isTranslated: needsTranslation && currentLanguage.code !== 'en',
        translationService: translationService,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await verifyNews(inputText);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      let errorContent = 'I apologize, but I encountered an error while analyzing your request. Please try again.';
      
      // Translate error message if needed
      let translationService = 'none';
      if (needsTranslation && currentLanguage.code !== 'en') {
        try {
          const translationResult = await hybridTranslationService.translateChatResponse(
            errorContent,
            'en',
            currentLanguage.code
          );
          errorContent = translationResult.translatedText;
          translationService = translationResult.service;
        } catch (translationError) {
          console.error('Failed to translate error message:', translationError);
        }
      }

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isTranslated: needsTranslation && currentLanguage.code !== 'en',
        translationService: translationService,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCredibilityColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCredibilityIcon = (score?: number) => {
    if (!score) return null;
    if (score >= 70) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (score >= 40) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
        <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign In Required</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to use the AI news validator. This helps us provide personalized and accurate analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI News Validator</h1>
            <p className="text-gray-600 dark:text-gray-400">Get instant credibility analysis for any news content</p>
            {currentLanguage.code !== 'en' && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {currentLanguage.flag} Responses in {currentLanguage.name}
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">How it works:</h3>
          <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
            <li>• Paste a news article URL or text content</li>
            <li>• Get an AI-powered credibility analysis</li>
            <li>• View source verification and fact-checking results</li>
            <li>• Receive a confidence score and recommendations</li>
            {needsTranslation && currentLanguage.code !== 'en' && (
              <li>• Responses automatically translated to {currentLanguage.name}</li>
            )}
          </ul>
        </div>
      </div>

      {/* Translation Status */}
      {translating && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Loader className="h-4 w-4 animate-spin text-yellow-600" />
            <span className="text-yellow-800 dark:text-yellow-400">
              Translating messages to {currentLanguage.name}...
            </span>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[600px] transition-colors">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <div className={`rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  
                  {message.isTranslated && message.originalContent && (
                    <details className="mt-2 text-xs opacity-75">
                      <summary className="cursor-pointer">Show original</summary>
                      <div className="mt-1 p-2 bg-black bg-opacity-10 rounded">
                        {message.originalContent}
                      </div>
                    </details>
                  )}

                  {message.translationService && message.translationService !== 'none' && (
                    <div className="mt-2 text-xs opacity-60">
                      Translated via {message.translationService}
                    </div>
                  )}
                  
                  {message.credibilityScore && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getCredibilityIcon(message.credibilityScore)}
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            Credibility Score
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${getCredibilityColor(message.credibilityScore)}`}>
                          {message.credibilityScore}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-4">
                        <div 
                          className={`h-2 rounded-full ${
                            message.credibilityScore >= 70 ? 'bg-green-500' :
                            message.credibilityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${message.credibilityScore}%` }}
                        ></div>
                      </div>
                      
                      {message.sources && (
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Sources Checked:</h4>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center space-x-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-full px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>{source}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.flags && message.flags.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Flags:</h4>
                          <div className="space-y-1">
                            {message.flags.map((flag, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-yellow-700 dark:text-yellow-400">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Analyzing content...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a news URL or article text to verify..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter + Shift for new line, Enter to send
            {needsTranslation && currentLanguage.code !== 'en' && (
              <span className="ml-2">• Responses in {currentLanguage.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatValidator;