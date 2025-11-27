import React, { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { uploadDocumentToPinecone } from "../services/api";

const DocumentUpload = ({ onDocumentReady }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const simulateProgress = () => {
    let current = 0;

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev < 70) return prev + 7;
        else if (prev < 95) return prev + 3;

        clearInterval(interval);
        return 95;
      });
    }, 200);

    return interval;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = simulateProgress();

    try {
      const documentData = await uploadDocumentToPinecone(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onDocumentReady({
        type: "uploaded",
        file: selectedFile,
        data: documentData,
      });
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600">
          Upload a PDF file of your book or research paper or academic article
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 bg-[#dbe5dd]">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />

        {!selectedFile ? (
          <label htmlFor="file-upload" className="cursor-pointer bg-[#33333]">
            <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className=" mb-2">
              <span className="text-[#6ed987] font-bold font-medium">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-sm text-gray-500">PDF files only (Max: 10MB)</p>
          </label>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-black" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-600 ml-auto"
              disabled={isUploading}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing document...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-400 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="btn-primary flex items-center text-black gap-2 bg-[#1bc237] hover:bg-[#6ed987] border border-black"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload & Process
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
