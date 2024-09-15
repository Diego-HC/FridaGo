import { Card } from "@tremor/react";
import React, { useState } from "react";
import Markdown from "react-markdown";
interface Aisle {
  id: number;
  date: string;
  Snacks: string;
  Fruits: string;
  Drinks: string;
}

interface SentimentData {
  Positive: number;
  Neutral: number;
  Negative: number;
  date: string;
}

interface WaitTimeLane {
  name: string;
  value: number;
}
interface ChatbotProps {
  onClose: () => void;
  data: {
    dummyDataAisle: Aisle[];
    sentimentData: SentimentData[];
    waitTimeLane: WaitTimeLane[];
  };
}

interface Message {
  sender: "bot" | "user";
  text: string;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, data }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! How can I assist you with the data insights?",
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");

    const conversationMessages: OpenAIMessage[] = messages.map((msg) => ({
      role: msg.sender === "bot" ? "assistant" : "user",
      content: msg.text,
    }));

    conversationMessages.push({ role: "user", content: inputValue });

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
              ...conversationMessages,
            ],
          }),
        },
      );

      const responseData = (await response.json()) as OpenAIResponse;

      if (response.ok) {
        const botReply = responseData.choices[0]!.message.content.trim();
        const botMessage: Message = { sender: "bot", text: botReply };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        console.error("Error from OpenAI API:", responseData);
        const errorMessage: Message = {
          sender: "bot",
          text: "Sorry, I couldn't process your request.",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "Sorry, there was an error processing your request.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card>
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
