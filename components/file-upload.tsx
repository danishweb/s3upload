"use client";

import { Progress } from "@/components/ui/progress";
import axios, { CancelTokenSource } from "axios";
import Image from "next/image";
import { useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import SignedImage from "./signed-image";

async function uploadDocument(
  url: string,
  file: File,
  onUploadProgress: (progress: number) => void,
  cancelTokenSource: CancelTokenSource
) {
  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent?.total) return null;
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent?.total
        );
        onUploadProgress(progress);
      },
      cancelToken: cancelTokenSource.token,
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Upload canceled:", error.message);
    } else {
      console.error("Error uploading documents:", error);
      throw new Error("Error uploading documents");
    }
  }
}

export default function UploadImage({
  onChange,
  accept,
}: {
  onChange: (key: string) => void;
  accept: Accept;
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileKey, setImageKey] = useState<string>("");

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const newCancelTokenSource = axios.CancelToken.source();
    setUploadedFile(file);
    try {
      const response = await uploadDocument(
        "/api/documents",
        file,
        setUploadProgress,
        newCancelTokenSource
      );

      setImageKey(response.key);
      onChange(response.key);
    } catch (error) {
      toast.error(
        "Something went wrong while uploading file. Please try again!"
      );
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      multiple: false,
      accept,
    });

  return (
    <>
      <div
        className="flex items-center justify-center w-full"
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col p-4 items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          {uploadedFile ? (
            <>
              {uploadProgress < 100 && (
                <Progress value={uploadProgress} className="my-4" />
              )}

              {accept["image/*"] && (
                <div className="relative w-full h-full">
                  <SignedImage src={fileKey} />
                </div>
              )}
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                {uploadedFile.name}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              {isDragReject ? (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-red-500">
                    File not allowed
                  </span>
                </p>
              ) : isDragActive ? (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Drop your files here</span>
                </p>
              ) : (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(accept["image/*"] || !isDragReject) && "Image (4MB)"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
