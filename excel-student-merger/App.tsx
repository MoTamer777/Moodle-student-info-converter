import React, { useState } from 'react';
import { Settings, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import FileUploader from './components/FileUploader';
import { processFiles } from './utils/excelProcessor';
import { ProcessConfig } from './types';

const App: React.FC = () => {
  // State
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  
  const [password, setPassword] = useState("Adminn.1");
  const [role, setRole] = useState("student");
  const [outputName, setOutputName] = useState("output.xlsx");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({
    type: 'idle',
    message: ''
  });

  const handleGenerate = async () => {
    // Validation
    if (!file1 || !file2) {
      setStatus({ type: 'error', message: "Please select both files first." });
      return;
    }
    if (!outputName.trim()) {
      setStatus({ type: 'error', message: "Please specify an output file name." });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const config: ProcessConfig = {
        defaultPassword: password,
        defaultRole: role,
        outputFileName: outputName
      };

      await processFiles(file1, file2, config);
      
      setStatus({ 
        type: 'success', 
        message: `Successfully processed files and started download for "${outputName}"` 
      });
    } catch (err: any) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        message: err.message || "An unexpected error occurred during processing." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-gray-900 tracking-tight">
            Excel Student Merger
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Combine student data and course enrollments easily.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* File Selection Section */}
          <div className="p-8 bg-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3">1</span>
              Upload Files
            </h2>
            <div className="space-y-6">
              <FileUploader 
                label="File 1: Emails (Contains 'الكود', 'Username')" 
                file={file1} 
                onFileSelect={setFile1} 
              />
              <FileUploader 
                label="File 2: Courses (Contains 'كود الطالب', 'الاسم', 'كود المقرر')" 
                file={file2} 
                onFileSelect={setFile2} 
              />
            </div>
          </div>

          {/* Configuration Section */}
          <div className="p-8 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3">2</span>
              Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Settings className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                  placeholder="Enter role"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Filename
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={outputName}
                    onChange={(e) => setOutputName(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 border"
                    placeholder="output"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    .xlsx
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="p-8 bg-white border-t border-gray-100">
            {status.message && (
              <div className={`mb-6 p-4 rounded-lg flex items-start ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {status.type === 'error' ? (
                  <AlertTriangle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{status.message}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isProcessing || !file1 || !file2}
              className={`w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-lg text-base font-medium text-white shadow-md transition-all
                ${isProcessing || !file1 || !file2 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-0.5'
                }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Generate Merged Excel
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This tool runs entirely in your browser. No data is uploaded to any server.</p>
        </div>

      </div>
    </div>
  );
};

export default App;
