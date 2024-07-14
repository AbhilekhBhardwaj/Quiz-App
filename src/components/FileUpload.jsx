import React, { useState } from 'react';
import { version, getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import '@react-pdf-viewer/core/lib/styles/index.css';
import axios from 'axios';

// import * as pdfjsLib from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

const FileUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [openAIResponse, setOpenAIResponse] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
      extractTextFromPdf(fileUrl);
    }
  };

  const extractTextFromPdf = async (url) => {
    const loadingTask = getDocument(url);
    const pdf = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item) => item.str).join(' ');
    }
    setPdfText(text);
    console.log(pdfText);
  };

  const sendMessageToOpenAI = async (message) => {
    const prompt = `${pdfText}\n\nUser : generate five multiple choice question each question consisting of 4 option , and also tell the right option`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const openAIResponse = response.data.choices[0].message.content;
    return openAIResponse;
    
  };
  //console.log(openAIResponse);
  

  return (
    <div className="App">
      <div className="upload-container">
        <h1>Upload a PDF</h1>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>
      {pdfText && (
        <div className="text-container">
          <h2>Extracted Text</h2>
          <p>{openAIResponse}</p>
        </div>
      )}
    </div>
  );
}
export default FileUpload;