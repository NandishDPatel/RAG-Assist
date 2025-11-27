import React, { useState } from "react";
import DocumentUpload from "./DocumentUpload";
import ResearchPaperSearch from "./ResearchPaper";
import { Upload, Search, BookOpen } from "lucide-react";

const InputHandler = ({ onDocumentReady }) => {
  const [hasDocument, setHasDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  const handleDocumentChoice = (choice) => {
    setHasDocument(choice);
    setActiveTab(choice ? "upload" : "search");
  };

  return (
    <div className="card bg-gray-300 border border-black">
      {hasDocument === null && (
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-black mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Do you have a PDF of a book or research paper?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleDocumentChoice(true)}
              className="btn-primary bg-[#1bc237] hover:bg-[#6ed987] flex items-center text-black justify-center gap-2 border border-black"
            >
              <Upload className="w-5 h-5" />
              Yes, I have a PDF
            </button>
            <button
              onClick={() => handleDocumentChoice(false)}
              className="btn-secondary flex items-center justify-center gap-2 bg-[#d6cdd1] hover:bg-gray-300 border border-black"
            >
              <Search className="w-5 h-5" />
              No, search for papers
            </button>
          </div>
        </div>
      )}

      {hasDocument !== null && (
        <div>
      
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 rounded-lg transition-colors ${
                activeTab === "upload"
                  ? "border-black bg-[#dbe5dd]"
                  : "border-transparent border-none"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 rounded-lg transition-colors ${
                activeTab === "search"
                  ? " border-black bg-[#dbe5dd]"
                  : "border-transparent border-none"
              }`}
            >
              <Search className="w-4 h-4" />
              Search Papers
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "upload" && (
              <DocumentUpload onDocumentReady={onDocumentReady} />
            )}
            {activeTab === "search" && (
              <ResearchPaperSearch onDocumentReady={onDocumentReady} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputHandler;
