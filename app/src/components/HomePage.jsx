import React from "react";
import InputHandler from "./InputHandler";

const HomePage = ({ onDocumentReady }) => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rag Assist</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Want to Q&A with the research paper/academic textbook/reading books
            ? Just upload or let the agent search your paper and start the RAG
            experience !!!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InputHandler onDocumentReady={onDocumentReady} />
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How it works
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                 1. Upload PDF or search research papers using AI agent
                </li>
                <li className="flex items-start">
                  2. AI processess your document and uploads inside the Vector DB
                </li>
                <li className="flex items-start">
                  3. Chat with AI for your document
                </li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Supported Documents
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    📄
                  </div>
                  <span className="text-sm font-medium">Research Papers</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    📖
                  </div>
                  <span className="text-sm font-medium">Books & Textbooks</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    🔬
                  </div>
                  <span className="text-sm font-medium">Academic Articles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
