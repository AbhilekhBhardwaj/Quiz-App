import React, { useRef, useState, useEffect } from 'react';
import './Quiz.css';

const Quiz = ({ openAIresponse }) => {
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(openAIresponse?.[0] || null); // Initialize with the first question or null
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(false);

  const Option1 = useRef(null);
  const Option2 = useRef(null);
  const Option3 = useRef(null);
  const Option4 = useRef(null);

  const option_array = [Option1, Option2, Option3, Option4];

  useEffect(() => {
    if (openAIresponse && openAIresponse.length > 0) {
      setQuestion(openAIresponse[0]); // Set the first question after response is loaded
    }
  }, [openAIresponse]);

  const checkAns = (e, ans) => {
    if (!lock) {
      if (question.ans === ans) {
        e.target.classList.add('correct');
        setLock(true);
        setScore(prev => prev + 1);
      } else {
        e.target.classList.add('wrong');
        setLock(true);
        option_array[question.ans - 1].current.classList.add('correct');
      }
    }
  };

  const next = () => {
    if (lock) {
      if (index === openAIresponse.length - 1) {
        setResult(true);
        return;
      }
      const newIndex = index + 1;
      setIndex(newIndex);
      setQuestion(openAIresponse[newIndex]);
      setLock(false);
      option_array.forEach(option => {
        option.current.classList.remove('correct', 'wrong');
      });
    }
  };

  const reset = () => {
    setIndex(0);
    setQuestion(openAIresponse[0]);
    setScore(0);
    setLock(false);
    setResult(false);
  };

  if (!question) {
    return <div>Loading quiz...</div>; // Handle case where questions are not yet available
  }

  return (
    <div className="container">
      <h1>Quiz App</h1>
      <hr />
      {!result ? (
        <>
          <h2>{index + 1}. {question.question}</h2>
          <ul>
            <li ref={Option1} onClick={(e) => checkAns(e, 1)}>{question.option1}</li>
            <li ref={Option2} onClick={(e) => checkAns(e, 2)}>{question.option2}</li>
            <li ref={Option3} onClick={(e) => checkAns(e, 3)}>{question.option3}</li>
            <li ref={Option4} onClick={(e) => checkAns(e, 4)}>{question.option4}</li>
          </ul>
          <button onClick={next}>Next</button>
          <div className="index">{index + 1} of {openAIresponse.length} questions</div>
        </>
      ) : (
        <>
          <h2>You Scored {score} out of {openAIresponse.length}</h2>
          <button onClick={reset}>Reset</button>
        </>
      )}
    </div>
  );
};

export default Quiz;