import React, { useCallback, useState } from 'react';
import {
  Rows,
  Text,
  Button,
  LoadingIndicator,
  Alert,
  Box
} from '@canva/app-ui-kit';
import { parseCSV } from '../services/csvService';
import { CSVData } from '../types';

interface CSVUploaderProps {
  onUpload: (data: CSVData) => void;
  isLoading: boolean;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onUpload,
  isLoading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    setUploadError(null);
    const file = files[0];
    
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('File size must be less than 10MB');
      return;
    }

    try {
      const csvData = await parseCSV(file);
      onUpload(csvData);
    } catch (error) {
      console.error('CSV parsing error:', error);
      setUploadError('Failed to parse CSV file. Please check the format.');
    }
  }, [onUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <Rows spacing="2u">
      <Text weight="medium">Upload Your CSV Data</Text>
      
      {uploadError && (
        <Alert tone="critical">
          {uploadError}
        </Alert>
      )}
      
      <Box
        padding="4u"
        border
        borderColor={dragActive ? "brand" : "neutral"}
        borderRadius="large"
        style={{
          textAlign: 'center',
          backgroundColor: dragActive ? '#f0f8ff' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Rows spacing="2u">
          {isLoading ? (
            <>
              <LoadingIndicator size="medium" />
              <Text>Processing CSV file...</Text>
            </>
          ) : (
            <>
              <Text size="large">📄</Text>
              <Text weight="medium">
                Drop your CSV file here or click to browse
              </Text>
              <Text size="small" tone="tertiary">
                Supports files up to 10MB with headers
              </Text>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              
              <Button
                variant="secondary"
                onClick={() => document.getElementById('csv-upload')?.click()}
                disabled={isLoading}
              >
                Browse Files
              </Button>
            </>
          )}
        </Rows>
      </Box>
      
      <Text size="small" tone="tertiary">
        ✨ <strong>Pro Tip:</strong> Include headers in your CSV for automatic column detection
      </Text>
    </Rows>
  );
};