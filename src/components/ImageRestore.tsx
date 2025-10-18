"use client";

import React, { useState, DragEvent } from "react";

interface RestoreResponse {
  uploadedUrl: string;
  restoredImageUrl: string;
  restorationDescription?: string;
  restorationGuide?: string;
}

export default function ImageRestore() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<RestoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return setError("No file selected");
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore");
      setResult(data);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Antique Image Restorer
          </h1>
          <p className="text-amber-700">
            Upload an old, rusted, or broken antique item and see it restored to its original glory
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div
            className="border-2 border-dashed border-amber-400 rounded-lg p-12 text-center cursor-pointer hover:border-amber-600 transition-colors bg-amber-50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="space-y-4">
                <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-lg shadow-md" />
                <p className="text-amber-800 font-medium">Selected: {selectedFile?.name}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg className="mx-auto h-16 w-16 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-amber-800 text-lg">Drag & Drop an antique image here</p>
                <p className="text-amber-600">or click to browse</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleChange} id="fileInput" />
            <label htmlFor="fileInput" className="cursor-pointer mt-4 inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors">
              Browse Files
            </label>
          </div>

          <button
            onClick={handleRestore}
            className="mt-6 w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-colors"
            disabled={!selectedFile || loading}
          >
            {loading ? "Restoring Your Antique..." : "Restore Image"}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              Restoration Results
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">Original Image</h3>
                <div className="border-2 border-amber-200 rounded-lg overflow-hidden">
                  <img src={result.uploadedUrl} alt="Original" className="w-full h-auto" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">Enhanced Image</h3>
                <div className="border-2 border-amber-400 rounded-lg overflow-hidden">
                  <img src={result.restoredImageUrl} alt="Restored" className="w-full h-auto" />
                </div>
              </div>
            </div>

            {result.restorationDescription && (
              <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">AI Analysis</h3>
                <p className="text-amber-800">{result.restorationDescription}</p>
              </div>
            )}

            {result.restorationGuide && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Restoration Guide</h3>
                <p className="text-amber-800">{result.restorationGuide}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
