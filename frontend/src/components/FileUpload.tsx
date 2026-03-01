"use client"

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileIcon } from 'lucide-react';

interface UploadedFile {
  id: string;
  originalName: string;
  url: string;
  size: number;
  documentType: string;
}

interface FileUploadProps {
  userId: string;
  relatedEntityType: 'application' | 'midYearReport' | 'paymentRequest';
  relatedEntityId: string;
  documentType: string;
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadSuccess?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({
  userId,
  relatedEntityType,
  relatedEntityId,
  documentType,
  label,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  onUploadSuccess,
  onUploadError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('relatedEntityType', relatedEntityType);
      formData.append('relatedEntityId', relatedEntityId);
      formData.append('documentType', documentType);

      console.log('Uploading file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType,
      });

      // Upload to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Server returned invalid response. Is the backend running?');
      }

      console.log('Upload response:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.error || `Upload failed with status ${response.status}`);
      }

      // Save uploaded file info
      const uploadedFileData: UploadedFile = {
        id: result.file.id,
        originalName: result.file.originalName,
        url: result.file.url,
        size: result.file.size,
        documentType: result.file.documentType,
      };

      setUploadedFile(uploadedFileData);

      if (onUploadSuccess) {
        onUploadSuccess(uploadedFileData);
      }
    } catch (err: any) {
      console.error('Upload error details:', err);
      const errorMsg = err.message || 'Failed to upload file';
      setError(errorMsg);
      if (onUploadError) {
        onUploadError(errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-3"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <button
                type="button"
                onClick={handleButtonClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
              >
                Choose File
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Max file size: {maxSizeMB}MB
              </p>
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, Word, JPG, PNG
              </p>
            </>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {uploadedFile.originalName}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {formatFileSize(uploadedFile.size)} • Uploaded successfully
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
