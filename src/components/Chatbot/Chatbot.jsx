import React, { useState } from "react";
import { FaRobot } from "react-icons/fa";
import styles from "./Chatbot.module.css";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]); // Optimistic update

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }), // Changed 'message' to 'question'
      });

      const data = await response.json();
      if (response.ok) {
        const botMessage = { role: "bot", content: data.answer }; // Changed 'data.response' to 'data.answer'
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        const errorMessage = { role: "bot", content: "Sorry, something went wrong!" };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { role: "bot", content: "Oops, I couldn’t connect to the server!" };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput(""); // Clear input after sending
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bottomBar}>
        <a href="/resume.pdf" download className={styles.downloadButton}>
          📄 Download Resume
        </a>
        <div className={styles.chatIcon} onClick={() => setIsOpen(!isOpen)}>
          <FaRobot size={30} />
        </div>
      </div>

      {isOpen && (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <span>Chat with Resume AI</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <div className={styles.chatBody}>
            {messages.length === 0 && (
              <div className={styles.botMessage}>Hi! Ask me anything about my resume.</div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.role === "user" ? styles.userMessage : styles.botMessage}
              >
                {msg.content}
              </div>
            ))}
          </div>
          <div className={styles.chatInput}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress} // Added Enter key support
              placeholder="Ask about my skills..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};