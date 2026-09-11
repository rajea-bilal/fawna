"use client";

import Image from "next/image";
import { ReactEventHandler, useState } from "react";

export default function ImageUpload() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState();
  const [fileError, setFileError] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);

    if (file) {
      setFileError(false);
      const url = URL.createObjectURL(file as Blob);
      console.log(url);
      setImageURL(url);
      setUploadedFile(file);
    }
  };

  const handleAnalyze = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("worksheet", uploadedFile);
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResponse(data.message);
    } else {
      setFileError(true);
    }
  };

  return (
    <section className="flex border border-white w-full h-100">
      <div className="flex-1">
        <div>
          <input
            className="bg-pink-500 p-2 w-full rounded-md text-black cursor-pointer"
            type="file"
            placeholder="upload file"
            onChange={handleFileUpload}
          />
        </div>
        <div>
          <button
            onClick={handleAnalyze}
            className="bg-blue-500 text-white p-2 rounded-md w-full cursor-pointer"
          >
            Analyze
          </button>
          {fileError && (
            <span className="text-red text-sm">Please upload file first</span>
          )}
        </div>

        {response && <p className="text-white text-lg">{response}</p>}
      </div>

      <div className="flex-1 border border-purple-500 relative">
        {imageURL && (
          <Image
            src={imageURL}
            alt="Worksheet preview"
            fill
            className="cover"
          />
        )}
      </div>
    </section>
  );
}
