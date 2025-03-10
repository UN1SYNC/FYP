import { ReactElement } from 'react';

// Mock file upload for tests
export const mockFileUpload = (inputElement: HTMLElement, files: File[]) => {
  Object.defineProperty(inputElement, 'files', {
    value: files,
    configurable: true
  });
  
  // Dispatch events
  const event = new Event('change', { bubbles: true });
  inputElement.dispatchEvent(event);
};

// Create mock HTML elements for testing
export const createMockElement = (tag: string, attributes: Record<string, any> = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

// Helper to handle components that use the File API
export const setupFileAPIMocks = () => {
  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'https://fake-url.com/file.pdf');
  
  // Mock FileReader
  const originalFileReader = global.FileReader;
  
  const mockFileReader = function(this: FileReader) {
    this.readAsDataURL = jest.fn(() => {
      setTimeout(() => {
        this.onload && this.onload(new ProgressEvent('load'));
      }, 0);
    });
    this.result = 'data:image/png;base64,fakeimagedatacontent';
  };
  
  global.FileReader = mockFileReader as any;
  
  return () => {
    global.FileReader = originalFileReader;
    jest.clearAllMocks();
  };
}; 