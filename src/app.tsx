import React from 'react';
import { AppUiProvider } from '@canva/app-ui-kit';
import { CSVVideoGeneratorApp } from './components/CSVVideoGeneratorApp';

export const App: React.FC = () => {
  return (
    <AppUiProvider>
      <CSVVideoGeneratorApp />
    </AppUiProvider>
  );
};