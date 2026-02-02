import React, { useState, useEffect, useRef, useContext } from 'react';
import { IoClose, IoSend, IoChatbubbleEllipses } from 'react-icons/io5';
import { BiSupport } from 'react-icons/bi';
import { BsRobot } from 'react-icons/bs';
import { FiUser } from 'react-icons/fi';
import API from '../Api/Api';
import { AppContext } from '../context/AppContext';

const SupportChat = () => {
    const { user, setOpen } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch chat history when panel opens
    useEffect(() => {
        if (isOpen && user) {
            fetchChatHistory();
        }
    }, [isOpen, user]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Auto-clear chat every 1 minute check
    useEffect(() => {
        const checkAndClearChat = () => {
             if (messages.length > 0) {
                 const lastMsg = messages[messages.length - 1];
                 const lastMsgTime = new Date(lastMsg.createdAt).getTime();
                 const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
                 
                 // If the *last* message is older than 5 minutes, clear the chat (Session Expired)
                 if (lastMsgTime < fiveMinutesAgo) {
                     setMessages([]);
                 }
             }
        };

        const interval = setInterval(checkAndClearChat, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [messages]);

    const fetchChatHistory = async () => {
        try {
            setHistoryLoading(true);
            const res = await API.get('/support/history');
            if (res.data.success) {
                // Filter messages: Only show those from the last 5 minutes
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                const recentMessages = (res.data.messages || []).filter(msg => 
                    new Date(msg.createdAt) > fiveMinutesAgo
                );
                setMessages(recentMessages);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim() || loading) return;

        // Check if user is logged in
        if (!user) {
            setOpen(true); // Open login modal
            return;
        }

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Optimistically add user message to UI
        const tempUserMsg = {
            role: 'user',
            text: userMessage,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            setLoading(true);
            const res = await API.post('/support/chat', { message: userMessage });
            
            if (res.data.success) {
                // Add AI response
                const aiMessage = {
                    role: 'ai',
                    text: res.data.reply,
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message
            const errorMessage = {
                role: 'ai',
                text: '⚠️ Sorry, something went wrong. Please try again later.',
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatMessageText = (text) => {
        if (!text) return '';
        // Convert newlines to <br> and preserve formatting
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line}
                {i < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <>
            {/* Floating Support Button - Hidden on mobile when open */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed bottom-6 right-6 z-[999]
                    w-14 h-14 rounded-full
                    bg-gradient-to-br from-[#FF8F9C] to-[#ed5e6a]
                    shadow-lg shadow-[#FF8F9C]/40
                    flex items-center justify-center
                    text-white text-2xl
                    transition-all duration-300
                    hover:scale-110 hover:shadow-xl hover:shadow-[#FF8F9C]/50
                    ${isOpen ? 'hidden sm:flex sm:rotate-90' : 'animate-pulse'}
                `}
                aria-label="Customer Support"
            >
                {isOpen ? <IoClose /> : <BiSupport />}
            </button>

            {/* Chat Panel */}
            <div
                className={`
                    fixed z-[998]
                    bg-white
                    shadow-2xl shadow-black/20
                    flex flex-col
                    overflow-hidden
                    transition-all duration-300 ease-in-out
                    
                    /* Mobile: Full Screen */
                    inset-0
                    rounded-none
                    
                    /* Desktop: Positioned Panel */
                    sm:inset-auto
                    sm:bottom-24 sm:right-6
                    sm:w-[380px] sm:max-w-[calc(100vw-48px)]
                    sm:h-[520px] sm:max-h-[75vh]
                    sm:rounded-2xl
                    
                    ${isOpen 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-5 scale-95 pointer-events-none'}
                `}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#FF8F9C] to-[#ed5e6a] px-4 sm:px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <BsRobot className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-base sm:text-lg">Customer Support</h3>
                        <p className="text-white/80 text-xs">
                            {loading ? 'Typing...' : 'Online • AI Powered'}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <IoClose className="text-2xl" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {/* Welcome message if no messages */}
                    {messages.length === 0 && !historyLoading && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#FF8F9C]/20 to-[#ed5e6a]/20 rounded-full flex items-center justify-center mb-4">
                                <IoChatbubbleEllipses className="text-3xl text-[#FF8F9C]" />
                            </div>
                            <h4 className="text-gray-700 font-medium mb-2">Hi there! 👋</h4>
                            <p className="text-gray-500 text-sm">
                                How can I help you today?<br />
                                Ask about orders, delivery, refunds, or anything else!
                            </p>
                        </div>
                    )}

                    {/* Loading history */}
                    {historyLoading && (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-[#FF8F9C] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {/* Avatar for AI/Admin */}
                            {msg.role !== 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8F9C] to-[#ed5e6a] flex items-center justify-center flex-shrink-0">
                                    <BsRobot className="text-white text-sm" />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div
                                className={`
                                    max-w-[75%] px-4 py-2.5 rounded-2xl
                                    ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-[#FF8F9C] to-[#ed5e6a] text-white rounded-br-md'
                                        : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md'}
                                `}
                            >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                    {formatMessageText(msg.text)}
                                </p>
                                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                                    {formatTime(msg.createdAt || msg.time)}
                                </p>
                            </div>

                            {/* Avatar for User */}
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <FiUser className="text-gray-500 text-sm" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="flex gap-2 justify-start">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8F9C] to-[#ed5e6a] flex items-center justify-center">
                                <BsRobot className="text-white text-sm" />
                            </div>
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-gray-100">
                    {!user && (
                        <p className="text-xs text-gray-500 mb-2 text-center">
                            Please <button type="button" onClick={() => setOpen(true)} className="text-[#FF8F9C] font-medium hover:underline">login</button> to chat with support
                        </p>
                    )}
                    <div className="flex gap-2 items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={user ? "Type your message..." : "Login to chat..."}
                            disabled={!user || loading}
                            className="
                                flex-1 px-4 py-3 
                                bg-gray-100 rounded-full
                                text-base sm:text-sm text-gray-700
                                placeholder:text-gray-400
                                focus:outline-none focus:ring-2 focus:ring-[#FF8F9C]/50
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all
                            "
                        />
                        <button
                            type="submit"
                            disabled={!user || !inputMessage.trim() || loading}
                            className="
                                w-12 h-12 flex-shrink-0 rounded-full
                                bg-gradient-to-br from-[#FF8F9C] to-[#ed5e6a]
                                flex items-center justify-center
                                text-white text-lg
                                transition-all duration-200
                                hover:shadow-lg hover:shadow-[#FF8F9C]/40
                                active:scale-95
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                            "
                        >
                            <IoSend />
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default SupportChat;
