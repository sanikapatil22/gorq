"use client";

import React, { useState, DragEvent } from "react";

export default function ImageRestore() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
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
    if (files && files.length > 0) setSelectedFile(files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    setError(null);
  };

  const handleRestore = async () => {
    if (!selectedFile) return setError("No file selected");
    setLoading(true);
    setError(null);
    setRestoredUrl(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore");
      setRestoredUrl(data.restoredImageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div
        className="border-2 border-dashed border-gray-400 p-8 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {selectedFile ? <p>Selected: {selectedFile.name}</p> : <p>Drag & Drop an image here, or click to select</p>}
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} id="fileInput" />
        <label htmlFor="fileInput" className="cursor-pointer mt-2 block text-blue-500">Browse</label>
      </div>

      <button
        onClick={handleRestore}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!selectedFile || loading}
      >
        {loading ? "Restoring..." : "Restore Image"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {restoredUrl && (
        <div className="mt-4 text-center">
          <p className="mb-2 font-semibold">Restored Image:</p>
          <img src={restoredUrl} alt="Restored" className="mx-auto max-h-80" />
        </div>
      )}
    </div>
  );
}
