import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './App.css';

const App = () => {
    const [showChat, setShowChat] = useState(false);
    const [claimsData, setClaimsData] = useState(null);
    const [botclaimsData, setbotClaimsData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [botMessage, setBotMessage] = useState(''); 
    const [input, setInput] = useState('');
    const hasShownIntroRef = useRef(false);
    const chatMessagesRef = useRef(null);
    const chatPopupRef = useRef(null);
    const pieChartRef = useRef(null); 

    
    const toggleChat = () => {
        setShowChat(!showChat);
    };

    const fetchData = async () => {
        try {
            const response = await axios.post('http://localhost:5000/claims-count', {
                query: 'claims status for last year' 
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const data = response.data;
                setClaimsData(data);
            } else {
                console.error('Failed to fetch claims data');
            }
        } catch (error) {
            console.error('Error fetching claims data:', error);
        }
    };

    const closeChat = (e) => {
        if (showChat && !e.target.closest('#chat-popup') && !e.target.closest('#chatbot-icon')) {
            setShowChat(false);
        }
    };

    
const predefinedQuestions = [
    { text: "Today's claims status", query_type: "today" },
    { text: "Yesterday's claims status", query_type: "yesterday" },
    { text: "Last week's claims status", query_type: "last_week" },
    { text: "Last month's claims status", query_type: "last_month" },
    { text: "Last year's claims status", query_type: "last_year" },
];

const sendMessage = async () => {
    if (input.trim()) {
        const userMessage = { sender: 'user', message: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        const selectedQuestion = predefinedQuestions.find(question =>
            question.query_type.toLowerCase().includes(input.toLowerCase())
        );

        let queryTypeToSend = '';
        if (selectedQuestion) {
            queryTypeToSend = selectedQuestion.query_type;
        } else {
            queryTypeToSend = 'specific'; 
        }

        const botResponse = simulateBotResponse(input);
        console.log('Bot response simulated:', botResponse);
        const botMessage = { sender: 'bot', message: botResponse };
        setMessages(prevMessages => [...prevMessages, botMessage]);

        try {
            if (queryTypeToSend) {
                const botResponseFromServer = await getBotResponse(queryTypeToSend.toLowerCase());
                const botMessageFromServer = { sender: 'bot', message: botResponseFromServer.data.response };
                setMessages(prevMessages => [...prevMessages, botMessageFromServer]);
            } else {
                throw new Error('queryTypeToSend is undefined');
            }
        } catch (error) {
            console.error('Error fetching bot response:', error);
            const errorMessage = { sender: 'bot', message: "I'm sorry, there was an error processing your request." };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }

        setInput('');
        scrollToBottom();
    }
};


const handlePredefinedQuestionClick = async (question) => {
    console.log('Selected question:', question);

    const userMessage = { sender: 'user', message: question };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const botResponse = simulateBotResponse(question);
    console.log('Bot response simulated:', botResponse);
    const botMessage = { sender: 'bot', message: botResponse };
    setMessages(prevMessages => [...prevMessages, botMessage]);

    const simulateTypingEffect = async (message) => {
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index <= message.length) {
                setBotMessage(message.substring(0, index));
                index++;
            } else {
                clearInterval(typingInterval);
                setBotMessage(message);
            }
        }, 25); 
    };


    await simulateTypingEffect(botResponse);

    const selectedQuestion = predefinedQuestions.find(quest =>
        quest.text.toLowerCase().includes(question.toLowerCase())
    );

    let queryTypeToSend = '';
    if (selectedQuestion) {
        queryTypeToSend = selectedQuestion.text;
    } else {
        queryTypeToSend = 'specific'; 
    }

    try {
        if (queryTypeToSend) {
            const botResponseFromServer = await getBotResponse(queryTypeToSend.toLowerCase());
            const data_ = botResponseFromServer.data;
            setbotClaimsData(data_);
    
            let word = '';
            if (queryTypeToSend.includes('today')) {
                word = "today";
            } else if (queryTypeToSend.includes('yesterday')) {
                word = "yesterday";
            } else if (queryTypeToSend.includes('last_week')) {
                word = "last week";
            } else if (queryTypeToSend.includes('last_month')) {
                word = "last month";
            } else if (queryTypeToSend.includes('last_year')) {
                word = "last year";
            }
    
            if (data_.total === 0) {
                const botMessage = `Unfortunately, there are no records of claims processed ${word}.`;
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', message: botMessage }]);
                await simulateTypingEffect(botMessage);
            } else {
                const botMessage = `Summary of claims processed ${word}: Total claims recorded ${data_.total}.  Approved claims ${data_.approved} and denied claims ${data_.denied} is denied.`;
                setMessages(prevMessages => [...prevMessages, { sender: 'bot', message: botMessage }]);
                await simulateTypingEffect(botMessage);
            }
        } else {
            throw new Error('queryTypeToSend is undefined');
        }
    } catch (error) {
        console.error('Error fetching bot response:', error);
        const errorMessage = { sender: 'bot', message: "I'm sorry, there was an error processing your request." };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        simulateTypingEffect(errorMessage);
    }

    scrollToBottom();
};

const simulateBotResponse = (message) => {
    if (!message) {
        return "I'm sorry, I didn't understand that.";
    }
    const lowerCaseMessage = message.toLowerCase();
    if (lowerCaseMessage.includes('today')) {
        return "Fetching today's claims status...";
    } else if (lowerCaseMessage.includes('yesterday')) {
        return "Fetching yesterday's claims status...";
    } else if (lowerCaseMessage.includes('last week')) {
        return "Fetching last week's claims status...";
    } else if (lowerCaseMessage.includes('last month')) {
        return "Fetching last month's claims status...";
    } else if (lowerCaseMessage.includes('last year')) {
        return "Fetching last year's claims status...";
    } else if (lowerCaseMessage.includes('specific')) {
        return "Please specify the date, month, or year...";
    } else if (lowerCaseMessage.includes('hi')) {
        return "I am your A2X assistant. How can I help you today?";
    } else {
        return "I'm sorry, I didn't understand that.";
    }
};

const getBotResponse = async (query_type) => {
    try {
        const response = await axios.post('http://localhost:5000/claims-count', {  query: query_type  }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
        
    } catch (error) {
        console.error('Error fetching bot response:', error);
        return { data: { response: "I'm sorry, there was an error processing your request." } };
    }
};

    const displayTypingEffect = (message, callback, isIntro = false) => {
        let index = 0;
        const messageDiv = { sender: 'bot', message: '', isIntro: isIntro };
        setMessages(prevMessages => [...prevMessages, messageDiv]);

        const interval = setInterval(() => {
            if (index < message.length) {
                messageDiv.message += message.charAt(index);
                setMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1] = messageDiv;
                    return newMessages;
                });
                index++;
                scrollToBottom();
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 25);
    };

    const displayPredefinedQuestions = () => {
        predefinedQuestions.forEach(question => {
            const questionDiv = { sender: 'bot', message: question.text, isPredefined: true };
            setMessages(prevMessages => [...prevMessages, questionDiv]);
            scrollToBottom();
        });
    };

    const scrollToBottom = () => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        fetchData();
     
    }, []);

    useEffect(() => {
        if (!hasShownIntroRef.current) {
            displayTypingEffect("I am your A2X assistant. I can share our application information. To get started, choose one of the following topics that meets your needs.", () => {
                displayPredefinedQuestions();
            }, true);
            hasShownIntroRef.current = true;
        }

        const handleClickOutside = (event) => {
            if (chatPopupRef.current && !chatPopupRef.current.contains(event.target)) {
                setShowChat(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (claimsData && pieChartRef.current) {
            if (pieChartRef.current.chart) {
                pieChartRef.current.chart.destroy();
            }
            const ctx = pieChartRef.current.getContext('2d');
            pieChartRef.current.chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(claimsData),
                    datasets: [{
                        label: 'Claims Counts',
                        data: Object.values(claimsData),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.label + ': ' + tooltipItem.raw.toLocaleString();
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true
                    },
                    elements: {
                        arc: {
                            borderWidth: 0
                        }
                    }
                }
            });
        }
    }, [claimsData]);

    useEffect(() => {
        if (botclaimsData && pieChartRef.current) {
            if (pieChartRef.current.chart) {
                pieChartRef.current.chart.destroy();
            }
            const ctx = pieChartRef.current.getContext('2d');
            pieChartRef.current.chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(botclaimsData),
                    datasets: [{
                        label: 'Claims Counts',
                        data: Object.values(botclaimsData),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.label + ': ' + tooltipItem.raw.toLocaleString();
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true
                    },
                    elements: {
                        arc: {
                            borderWidth: 0
                        }
                    }
                }
            });
        }
    }, [botclaimsData]);

    return (
        <div className="App" onClick={closeChat}>
            {!showChat && <div id="chatbot-icon" onClick={toggleChat}>💬</div>}
            {showChat && (
                <div id="chat-popup" className="chat-popup" ref={chatPopupRef}>
                    <div className="chat-header">
                        <h2>A2X Assistant</h2>
                    </div>
                    <div className="chat-body custom-scrollbar" ref={chatMessagesRef}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.sender} ${msg.isPredefined ? 'predefined' : ''} ${msg.isIntro ? 'intro' : ''}`}
                                onClick={() => msg.isPredefined && handlePredefinedQuestionClick(msg.message)}
                            >
                                {msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="chat-footer">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here..."
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
            <div className="homepage-content">
                <div className="navbar">
                  <div className="logo">
                    <a className="brand">A2X</a>
                    <input type="text" className="search-bar" placeholder="Search..." />
                    </div>
                    <div className="icons">                    
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high" viewBox="0 0 16 16">
                    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                    </svg>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon " viewBox="0 0 16 16">
                        <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pc-display-horizontal bs-light" viewBox="0 0 16 16">
                        <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v7A1.5 1.5 0 0 0 1.5 10H6v1H1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5v-1h4.5A1.5 1.5 0 0 0 16 8.5v-7A1.5 1.5 0 0 0 14.5 0zm0 1h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5M12 12.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0m2 0a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0M1.5 12h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M1 14.25a.25.25 0 0 1 .25-.25h5.5a.25.25 0 1 1 0 .5h-5.5a.25.25 0 0 1-.25-.25"/>
                        </svg>
                    </div>
                </div>
                <h1>Claims Dashboard</h1>
                <p>{botMessage}</p>
                <div className="pie-chart-container">
                    <canvas ref={pieChartRef} /> {/* Changed ref to pieChartRef */}
                </div>
            </div>
        </div>
    );
    
    
};

export default App;
