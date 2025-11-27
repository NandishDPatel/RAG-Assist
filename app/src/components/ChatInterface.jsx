import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Bot, User, Mic, Square } from "lucide-react";
import {
  startVoiceRecording,
  stopVoiceRecording,
  sendChatMessage,
} from "../services/api";

const ChatInterface = ({ document, onBackToHome }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const messagesEndRef = useRef(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    if (document) {
      console.log("Document data is :", document);

      let docId = "";

      if (document.type === "arxiv") {
        docId = document.data?.document_id || document.paper?.id || "";
        console.log("arXiv Document ID:", docId);
      } else if (document.type === "uploaded") {
        docId =
          document.data?.document_id ||
          document.file?.name?.replace(".pdf", "") ||
          "";
        console.log("Uploaded Document ID:", docId);
      }

      if (!docId) {
        console.warn("Warning: No document ID found");
      }

      setDocumentId(docId);
    }
  }, [document]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!documentId) {
      const errorMessage = {
        id: Date.now(),
        type: "assistant",
        content:
          "Error: Document ID not set. Please go back and reload the document.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log("Sending message with documentId:", documentId);
      console.log("Message:", inputMessage);

      const response = await sendChatMessage(inputMessage, documentId);

      console.log("Response received:", response);

      const aiMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: response.answer || "No response generated",
        timestamp: new Date(),
        sources: response.sources || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: `Sorry, I encountered an error: ${
          error.message || "Unknown error"
        }. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const result = await stopVoiceRecording();
        if (result.status === "success" && result.transcript) {
          setInputMessage(result.transcript);
        }
      } catch (error) {
        console.error("Voice recording error:", error);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      setIsRecording(true);
      try {
        await startVoiceRecording();
      } catch (error) {
        console.error("Voice recording error:", error);
        setIsRecording(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="border-b border-gray-400 bg-[#dbe5dd] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 text-center max-w-full">
                Rag Assist chatbot
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-[#d6cdd1]">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation about{" "}
              <strong className="text-black">"{documentId}"</strong>
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Ask questions about the content, request summaries, or discuss
              specific topics. You can type or use voice input.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === "user"
                    ? "text-black bg-[#1bc237]"
                    : "text-black bg-[#c1c2c1]"
                }`}
              >
                {message.type === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.type === "user"
                    ? "text-black rounded-br-none bg-[#1bc237]"
                    : "text-black rounded-bl-none bg-[#c1c2c1]"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-300">
                    <p className="text-xs font-semibold mb-1">
                      {message.type === "user" ? "" : "Sources:"}
                    </p>
                    {message.sources.map((source, index) => (
                      <div key={index} className="text-xs mb-1 opacity-90">
                        <p className="font-medium">Source {index + 1}:</p>
                        <p className="italic">
                          {typeof source === "string"
                            ? source.substring(0, 100)
                            : source.text?.substring(0, 100)}
                          ...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.type === "user" ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-700" />
            </div>
            <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-400 px-6 py-4 bg-[#dbe5dd]">
        <div className="flex gap-3">
          <button
            onClick={handleVoiceInput}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isRecording
                ? "bg-red-500 text-white animate-pulse border border-black"
                : "bg-gray-400 text-black hover:bg-gray-300 border border-black"
            }`}
          >
            {isRecording ? (
              <Square className="w-5 h-5 " />
            ) : (
              <Mic className="w-5 h-5 " />
            )}
          </button>

          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="Type your message or use voice input..."
            className="flex-1 resize-none p-3 border text-black border-black rounded-lg border border-black bg-gray-300 focus:outline-none focus:ring-0"
            rows="2"
            disabled={isLoading || !documentId}
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !documentId}
            className="self-end px-4 py-2 bg-[#1bc237] text-black rounded-lg hover:bg-[#6ed987] border border-black "
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {isRecording && (
          <div className="mt-2 text-center">
            <p className="text-sm text-red-600 animate-pulse">
              Recording... Click stop when done
            </p>
          </div>
        )}

        {!documentId && (
          <div className="mt-2 text-center">
            <p className="text-sm text-yellow-600">Loading document...</p>
          </div>
        )}

        {isTranscribing && (
          <div className="mt-2 text-center">
            <p className="text-sm text-blue-700 animate-pulse">
              Transcribing your audio...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
