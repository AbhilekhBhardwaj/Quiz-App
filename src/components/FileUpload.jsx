import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import axios from 'axios';


// Manually set the workerSrc property for pdfjsLib to a specific version
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const FileUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
      extractTextFromPdf(fileUrl);
    }
  };

  const extractTextFromPdf = async (url) => {
    const pdf = await getDocument(url).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item) => item.str).join(' ');
    }
    setPdfText(text);
  };

  return (
    <div className="App">
      {!pdfFile ? (
        <div className="upload-container">
          <h1>Upload a PDF</h1>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="viewer-container">
          {/* Other components here */}
        </div>
      )}
    </div>
  );
}

export default FileUpload;