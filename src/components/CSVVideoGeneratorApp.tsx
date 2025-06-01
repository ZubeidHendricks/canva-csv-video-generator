import React, { useState } from 'react';
import {
  Rows,
  Text,
  Title,
  Button,
  LoadingIndicator,
  Alert,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@canva/app-ui-kit';
import { CSVUploader } from './CSVUploader';
import { DataMapper } from './DataMapper';
import { VideoTemplateSelector } from './VideoTemplateSelector';
import { VideoPreview } from './VideoPreview';
import { useCSVProcessor } from '../hooks/useCSVProcessor';
import { CSVData, VideoConfig, GeneratedVideo } from '../types';

export const CSVVideoGeneratorApp: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    template: 'modern',
    duration: 30,
    format: '16:9',
    includeNarration: true,
    chartType: 'bar'
  });
  const [activeTab, setActiveTab] = useState('upload');
  
  const {
    generatedVideos,
    isProcessing,
    error,
    processCSV,
    generateVideos
  } = useCSVProcessor();

  const handleCSVUpload = async (data: CSVData) => {
    setCsvData(data);
    setActiveTab('mapping');
  };

  const handleMappingComplete = () => {
    setActiveTab('template');
  };

  const handleTemplateSelection = () => {
    setActiveTab('generate');
  };

  const handleGenerateVideos = async () => {
    if (!csvData) return;
    await generateVideos(csvData, videoConfig);
    setActiveTab('preview');
  };

  return (
    <Rows spacing="2u">
      <Title size="medium">CSV to Video Generator</Title>
      
      <Text size="small" tone="tertiary">
        Transform your data into engaging video content with automated narration
      </Text>

      {error && (
        <Alert tone="critical">
          {error}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabList>
          <Tab value="upload">1. Upload CSV</Tab>
          <Tab value="mapping" disabled={!csvData}>2. Map Data</Tab>
          <Tab value="template" disabled={!csvData}>3. Template</Tab>
          <Tab value="generate" disabled={!csvData}>4. Generate</Tab>
          <Tab value="preview" disabled={generatedVideos.length === 0}>5. Preview</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="upload">
            <CSVUploader 
              onUpload={handleCSVUpload}
              isLoading={isProcessing}
            />
          </TabPanel>

          <TabPanel value="mapping">
            {csvData && (
              <DataMapper
                data={csvData}
                onMappingComplete={handleMappingComplete}
              />
            )}
          </TabPanel>

          <TabPanel value="template">
            <VideoTemplateSelector
              config={videoConfig}
              onChange={setVideoConfig}
              onComplete={handleTemplateSelection}
            />
          </TabPanel>

          <TabPanel value="generate">
            <Rows spacing="2u">
              <Title size="small">Generate Videos</Title>
              <Text>
                Ready to generate {csvData?.rows.length || 0} videos from your data.
              </Text>
              
              <Button
                variant="primary"
                onClick={handleGenerateVideos}
                disabled={isProcessing}
                stretch
              >
                {isProcessing ? (
                  <>
                    <LoadingIndicator size="small" />
                    <Text>Generating videos...</Text>
                  </>
                ) : (
                  'Generate Video Series'
                )}
              </Button>
            </Rows>
          </TabPanel>

          <TabPanel value="preview">
            <VideoPreview videos={generatedVideos} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Rows>
  );
};