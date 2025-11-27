import React from "react";
import InputHandler from "./InputHandler";

const HomePage = ({ onDocumentReady }) => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rag Assist</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From PDF to AI-powered insights — just upload and ask.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InputHandler onDocumentReady={onDocumentReady} />
          </div>

          <div className="space-y-6 ">
            <div className="card bg-[#dbe5dd] border border-black">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How it works
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  1. Upload document (in PDF format) or search research papers
                  recommendations using AI agent
                </li>
                <li className="flex items-start">
                  2. Automatically processes your document and uploads inside
                  the Vector DB
                </li>
                <li className="flex items-start">
                  3. Chat with AI agent using the document context
                </li>
              </ul>
            </div>

            <div className="card bg-[#dbe5dd] border border-black">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Supported Documents
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-lg bg-gray-300  text-gray-600 border border-black">
                  <span className="text-sm font-semibold">Research Papers</span>
                </div>
                <div className="flex items-center p-3 rounded-lg  bg-gray-300 text-gray-600 border border-black">
                  <span className="text-sm font-medium">Books & Textbooks</span>
                </div>
                <div className="flex items-center p-3 bg-gray-300  rounded-lg text-gray-600 border border-black">
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
