import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Download, Eye } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  files: string[];
  onFilesChange: (files: string[]) => void;
  maxFiles?: number;
  showPreview?: boolean;
  onFileRemoved?: (files: string[]) => void;
}

export default function FileUpload({ 
  label, 
  accept = "*/*", 
  multiple = false, 
  files, 
  onFilesChange,
  maxFiles = 5,
  showPreview = false,
  onFileRemoved
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    // Convert File objects to Base64 strings for storage
    const processFiles = async () => {
      const processedFiles = await Promise.all(
        newFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      console.log('FileUpload - Processing files:', newFiles.map(f => f.name));

      if (multiple) {
        const totalFiles = files.length + processedFiles.length;
        if (totalFiles > maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          return;
        }
        onFilesChange([...files, ...processedFiles]);
      } else {
        onFilesChange(processedFiles.slice(0, 1));
      }
    };
    
    processFiles();
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    onFileRemoved?.(newFiles);
  };

  const getFileName = (filePath: string) => {
    if (typeof filePath === 'string' && filePath.startsWith('data:')) {
      // For Base64 data URLs, try to extract filename from metadata or use generic name with proper extension
      const mimeMatch = filePath.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      let extension = '';
      if (mimeType.includes('pdf')) extension = '.pdf';
      else if (mimeType.includes('image')) extension = '.jpg';
      else if (mimeType.includes('word')) extension = '.docx';
      else if (mimeType.includes('text')) extension = '.txt';
      
      return `document${extension}`;
    } else if (typeof filePath === 'string') {
      return filePath.split('/').pop() || filePath;
    }
    return 'Unknown file';
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (fileName: string) => {
    const ext = getFileExtension(fileName);
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (['zip', 'rar'].includes(ext)) return '📦';
    return '📄';
  };

  const isImageFile = (file: string) => {
    return file.startsWith('data:image/');
  };
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Image Preview */}
      {showPreview && files.length > 0 && isImageFile(files[0]) && (
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src={files[0]}
              alt="Profile preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
            />
            <div className="absolute -top-2 -right-2">
              <button
                type="button"
                onClick={() => removeFile(0)}
                className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${showPreview && files.length > 0 && isImageFile(files[0]) ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">
            {showPreview && files.length > 0 && isImageFile(files[0]) ? 'Click to change' : 'Click to upload'}
          </span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {accept === "image/*" ? "Images only" : "Any file type"}
          {multiple && ` (Max ${maxFiles} files)`}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && !showPreview && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getFileIcon(getFileName(file))}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getFileName(file)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileExtension(getFileName(file)).toUpperCase()} file
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="View file"
                  onClick={() => {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      if (file.startsWith('data:image/')) {
                        newWindow.document.open();
                        newWindow.document.write(`<!DOCTYPE html><html><head><title>Image Viewer</title><style>body{margin:0;padding:20px;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh;}img{max-width:100%;max-height:100%;object-fit:contain;box-shadow:0 4px 6px rgba(0,0,0,0.1);}</style></head><body><img src="${file}" alt="Document" /></body></html>`);
                        newWindow.document.close();
                      } else if (file.startsWith('data:application/pdf')) {
                        newWindow.location.href = file;
                      } else {
                        newWindow.document.open();
                        newWindow.document.write(`<!DOCTYPE html><html><head><title>Document Viewer</title><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;}.container{max-width:800px;margin:0 auto;text-align:center;}.download-btn{background:#3b82f6;color:white;padding:12px 24px;border:none;border-radius:6px;cursor:pointer;font-size:16px;margin-top:20px;}.download-btn:hover{background:#2563eb;}</style></head><body><div class="container"><h2>Document Preview</h2><p>This document type cannot be previewed directly in the browser.</p><button class="download-btn" onclick="downloadFile()">Download Document</button><script>function downloadFile(){const link=document.createElement('a');link.href='${file}';link.download='document_${Date.now()}';link.click();}</script></div></body></html>`);
                        newWindow.document.close();
                      }
                    }
                  }}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                  title="Download file"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = file;
                    
                    // Extract MIME type and create appropriate filename
                    const mimeMatch = file.match(/data:([^;]+)/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
                    let extension = '';
                    if (mimeType.includes('pdf')) extension = '.pdf';
                    else if (mimeType.includes('image/jpeg')) extension = '.jpg';
                    else if (mimeType.includes('image/png')) extension = '.png';
                    else if (mimeType.includes('image')) extension = '.jpg';
                    else if (mimeType.includes('word')) extension = '.docx';
                    else if (mimeType.includes('text')) extension = '.txt';
                    
                    link.download = `document_${Date.now()}${extension}`;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Non-image files list when preview is enabled */}
      {showPreview && files.length > 0 && files.some(file => !isImageFile(file)) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Other Files:</h4>
          {files.filter(file => !isImageFile(file)).map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getFileIcon(getFileName(file))}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getFileName(file)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileExtension(getFileName(file)).toUpperCase()} file
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="View file"
                  onClick={() => {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      if (file.startsWith('data:image/')) {
                        newWindow.document.open();
                        newWindow.document.write(`<!DOCTYPE html><html><head><title>Image Viewer</title><style>body{margin:0;padding:20px;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh;}img{max-width:100%;max-height:100%;object-fit:contain;box-shadow:0 4px 6px rgba(0,0,0,0.1);}</style></head><body><img src="${file}" alt="Document" /></body></html>`);
                        newWindow.document.close();
                      } else if (file.startsWith('data:application/pdf')) {
                        newWindow.location.href = file;
                      } else {
                        newWindow.document.open();
                        newWindow.document.write(`<!DOCTYPE html><html><head><title>Document Viewer</title><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;}.container{max-width:800px;margin:0 auto;text-align:center;}.download-btn{background:#3b82f6;color:white;padding:12px 24px;border:none;border-radius:6px;cursor:pointer;font-size:16px;margin-top:20px;}.download-btn:hover{background:#2563eb;}</style></head><body><div class="container"><h2>Document Preview</h2><p>This document type cannot be previewed directly in the browser.</p><button class="download-btn" onclick="downloadFile()">Download Document</button><script>function downloadFile(){const link=document.createElement('a');link.href='${file}';link.download='document_${Date.now()}';link.click();}</script></div></body></html>`);
                        newWindow.document.close();
                      }
                    }
                  }}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fileIndex = files.indexOf(file);
                    removeFile(fileIndex);
                  }}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}