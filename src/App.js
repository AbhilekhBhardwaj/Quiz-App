import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';
import Quiz from './Quiz';
import { FileUpload } from './FileUpload'; // Import the custom FileUpload component
import './App.css';
import { motion } from 'framer-motion';

// Initialize PDF.js with the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

function App() {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadContainer, setShowUploadContainer] = useState(true);

  const handleFileChange = async (files) => {
    const file = files[0];
    if (file) {
      setError(null);
      setLoading(true);
      setShowUploadContainer(false);
      try {
        const fileUrl = URL.createObjectURL(file);
        await extractTextFromPdf(fileUrl);
      } catch (err) {
        setError('Error processing PDF: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const extractTextFromPdf = async (url) => {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map((item) => item.str).join(' ');
    }

    await sendMessageToOpenAI(text);
  };

  const sendMessageToOpenAI = async (pdfContent) => {
    const prompt = `${pdfContent}\n\nBased on the provided content, generate five quiz questions and answers in the following JSON format:
    {
      "questions": [
        {
          "question": "Which continent has the highest number of countries?",
          "option1": "Asia",
          "option2": "Europe",
          "option3": "North America",
          "option4": "Africa",
          "ans": 4
        }
      ]
    }
    Make sure that each question has four options and the correct answer is indicated by the "ans" field with the option number. Provide all five questions within the questions array.`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsedResponse = JSON.parse(content);
      setApiResponse(parsedResponse);
    } catch (error) {
      console.error('Error fetching API response:', error);
      setError('Error generating quiz questions: ' + error.message);
    }
   
  };

  return (
    <div className="container">
      {showUploadContainer && (
        <div className="upload-section">
          <h1>PDF Quiz Generator</h1>
          <FileUpload handleFileChange={handleFileChange} />
         
          {loading && (
  <div className="loading-container">
    <div className="spinner"></div>
  </div>
)}

        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {apiResponse && (
        <Quiz openAIresponse={apiResponse.questions} />
      )}
    </div>
  );
}

export default App;
