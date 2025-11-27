import React, { useState } from "react";
import HomePage from "./components/HomePage";
import ChatInterface from "./components/ChatInterface";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleDocumentReady = (document) => {
    setSelectedDocument(document);
    setCurrentView("chat");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedDocument(null);
  };

  return (
    <div className="min-h-screen bg-[#d6cdd1]">
      {currentView === "home" ? (
        <HomePage onDocumentReady={handleDocumentReady} />
      ) : (
        <ChatInterface
          document={selectedDocument}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;
