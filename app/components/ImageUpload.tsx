"use client";

import Image from "next/image";
import { ReactEventHandler, useState } from "react";
import shrinkImage from "@/lib/image/shrinkImage";

export default function ImageUpload() {
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const max_file_size = 10 * 1024 * 1024; // 10 MB
    const types = ["image/png", "image/jpeg", "image/webp"];
    const file = e.target.files?.[0];
    console.log("file", file);
    console.log("file size", file?.size);

    if (!file) {
      setError("Please select a file, my friend");
      return;
    }

    if (file) {
      // if file exists, check size and type

      if (file.size > max_file_size) {
        setError("The file is too large, my friend");
        return;
      }

      // if file is of accepted type
      if (!types.includes(file.type)) {
        setError("Please upload an accepted format; JPEG, PNG or WebP image");
        return;
      }

      // shrink the image
      try {
        const shrunkFile = await shrinkImage(file);
        console.log("shrunkImage", shrunkFile);

        setError(null);
        const url = URL.createObjectURL(shrunkFile);
        console.log(url);
        setImageURL(url);
        setUploadedFile(shrunkFile);
      } catch (error) {
        setError("Error shrinking image");
        return;
      }
    }
  };

  const handleAnalyze = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!uploadedFile) {
      setError("Please select a file first, my friend");
      return;
    }
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("worksheet", uploadedFile);
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setResponse(data.message);

      if (!response.ok) {
        setError("System unable to process the request");
      }
    }
  };

  return (
    <section className="flex border border-white w-full h-100">
      <div className="flex-1">
        <div>
          <input
            className="bg-pink-500 p-2 w-full rounded-md text-black cursor-pointer"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            placeholder="upload file"
            onChange={handleFileSelected}
          />
        </div>
        <div>
          <button
            onClick={handleAnalyze}
            className="bg-blue-500 text-white p-2 rounded-md w-full cursor-pointer"
          >
            Analyze
          </button>
          {error}
        </div>

        {response}
      </div>

      <div className="flex-1 border border-purple-500 relative">
        {imageURL && (
          <Image
            src={imageURL}
            alt="Worksheet preview"
            fill
            className="object-cover"
          />
        )}
      </div>
    </section>
  );
}
