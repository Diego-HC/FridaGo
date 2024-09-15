import { Card } from "@tremor/react";
import React, { useState } from "react";
import Markdown from "react-markdown";

interface ChatbotProps {
  onClose: () => void;
  data: {
    dummyDataAisle: any;
    sentimentData: any;
    waitTimeLane: any;
  };
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, data }) => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! How can I assist you with the data insights?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = { sender: "user", text: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");

    // Prepare the conversation for the API
    const conversation = [
      { role: "system", content: "You are a data insights assistant." },
      ...messages
        .filter((msg) => msg.sender !== "bot")
        .map((msg) => ({ role: "user", content: msg.text })),
      { role: "user", content: inputValue },
    ];

    // Include data in the system prompt if needed
    const systemPrompt = `You are a data insights assistant. Use the following data to provide recommendations:\n\nAisle Data:\n${JSON.stringify(
      data.dummyDataAisle,
    )}\n\nSentiment Data:\n${JSON.stringify(
      data.sentimentData,
    )}\n\nWait Time Data:\n${JSON.stringify(data.waitTimeLane)}`;

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversation.slice(1), // Exclude the initial system message
            ],
          }),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        const botReply = responseData.choices[0].message.content.trim();
        const botMessage = { sender: "bot", text: botReply };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        console.error("Error from OpenAI API:", responseData);
        const errorMessage = {
          sender: "bot",
          text: "Sorry, I couldn't process your request.",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, there was an error processing your request.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold">Chatbot</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 h-64 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 flex ${
                msg.sender === "bot" ? "justify-start" : "justify-end"
              }`}
            >
              <span
                className={`inline-block rounded-lg px-3 py-2 ${
                  msg.sender === "bot"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-blue-500 text-white"
                }`}
              >
                <Markdown>{msg.text}</Markdown>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            className="flex-grow rounded-l border px-2 py-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="rounded-r bg-blue-500 px-4 py-2 text-white"
          >
            Send
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;
