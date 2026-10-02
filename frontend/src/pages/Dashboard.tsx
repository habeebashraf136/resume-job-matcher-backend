import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Dropzone } from '../components/matcher/Dropzone';
import { Pipeline } from '../components/matcher/Pipeline';
import { JobResultsView } from '../components/matcher/JobResultsView';
import { Button } from '../components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import type { Job } from '../components/matcher/JobCard';

type Status = 'idle' | 'uploading' | 'complete' | 'error' | 'empty';

export default function Dashboard() {
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState<Status>('idle');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRetry, setShowRetry] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const selectedFileRef = useRef<File | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileSelect = (file: File) => {
    selectedFileRef.current = file;
    startPipeline(file);
  };

  const startPipeline = async (file: File, isRetry = false) => {
    setStatus('uploading');
    setPipelineComplete(false);
    setErrorMsg('');
    setShowRetry(false);
    
    abortControllerRef.current = new AbortController();
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const currentToken = useAuthStore.getState().accessToken;
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/job-match/findJobs`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${currentToken}`
          },
          timeout: 120000,
          signal: abortControllerRef.current.signal
        }
      );

      setPipelineComplete(true);
      queryClient.invalidateQueries({ queryKey: ['jobHistory'] });
      
      setTimeout(() => {
        setJobs(response.data.data.rankedJobs);
        setStatus('complete');
      }, 500); 
      
    } catch (err: any) {
      if (axios.isCancel(err)) {
        setStatus('idle');
        return;
      }
      
      const status = err.response?.status;
      
      if (status === 401 && !isRetry) {
        try {
          await apiClient.get('/api/auth/get-user');
          setErrorMsg('Session expired, but we refreshed it securely.');
          setShowRetry(true);
        } catch (refreshErr) {
          setErrorMsg('Session expired. Please log in again.');
        }
        setStatus('error');
        return;
      }
      
      if (status === 429) {
        setErrorMsg('Rate limit exceeded. Please try again later.');
        setStatus('error');
        return;
      }
      
      if (status === 400 && err.response?.data?.message?.includes('No matching jobs')) {
        setStatus('empty');
        return;
      }

      if (status === 400) {
        setErrorMsg(err.response?.data?.message || 'Invalid file or request.');
        setStatus('error');
        return;
      }
      
      setErrorMsg('The AI pipeline failed.');
      setShowRetry(true);
      setStatus('error');
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 min-h-[calc(100vh-64px)] flex flex-col relative bg-bg">
      <div className="mb-10 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-ink uppercase mb-4">
          Job Matcher AI
        </h1>
        {status === 'idle' && (
          <p className="text-ink font-medium text-lg max-w-2xl mx-auto">
            Upload your resume and let our AI compare your exact skills and experience against live job postings to find your perfect fit.
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex items-center justify-center"
            >
              <Dropzone onFileSelect={handleFileSelect} isLoading={false} />
            </motion.div>
          )}

          {status === 'uploading' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex items-center justify-center"
            >
              <Pipeline isComplete={pipelineComplete} onCancel={handleCancel} />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <Card className="p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-circle bg-danger neo-border flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-ink" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-ink">Something went wrong</h3>
                <p className="text-ink font-medium mb-8">{errorMsg}</p>
                
                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setStatus('idle')}>
                    Start Over
                  </Button>
                  {showRetry && selectedFileRef.current && (
                    <Button variant="primary" className="flex-1" onClick={() => startPipeline(selectedFileRef.current!, true)}>
                      <RefreshCw size={16} className="mr-2 text-ink" /> Retry Pipeline
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {status === 'empty' && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <Card className="p-10 max-w-lg w-full text-center">
                <div className="w-20 h-20 mx-auto bg-yellow rounded-neo neo-border flex items-center justify-center mb-6">
                  <span className="text-4xl text-ink">📭</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-ink">No Perfect Matches Found</h3>
                <p className="text-ink font-medium mb-8">
                  We scanned live listings but couldn't find a strong enough AI fit for your specific background right now.
                </p>
                <Button variant="primary" onClick={() => setStatus('idle')}>
                  Upload Different Resume
                </Button>
              </Card>
            </motion.div>
          )}

          {status === 'complete' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <div className="flex justify-end mb-4 max-w-6xl mx-auto w-full">
                <Button variant="secondary" size="sm" onClick={() => setStatus('idle')} className="text-xs">
                  Upload New Resume
                </Button>
              </div>
              <JobResultsView initialJobs={jobs} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
