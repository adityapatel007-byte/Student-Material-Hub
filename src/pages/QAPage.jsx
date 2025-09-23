import React, { useState, useEffect } from 'react';
import './QAPage.css';

const QAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  // Fetch questions from the backend on component mount
  useEffect(() => {
    // Implement fetch logic here...
    // const fetchQuestions = async () => {
    //   const response = await fetch('YOUR_BACKEND_API/api/qa');
    //   const data = await response.json();
    //   setQuestions(data);
    // };
    // fetchQuestions();
  }, []);

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    // Implement POST logic to backend here...
    // const response = await fetch('YOUR_BACKEND_API/api/qa', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ question: newQuestion }),
    // });
    // const newQ = await response.json();
    // setQuestions([...questions, newQ]);
    setNewQuestion('');
  };

  return (
    <div className="qa-page">
      <h2>Q&A Section</h2>
      <div className="ask-question">
        <form onSubmit={handlePostQuestion}>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a new question..."
            rows="4"
          />
          <button type="submit">Post Question</button>
        </form>
      </div>
      <div className="questions-list">
        <h3>Recent Questions</h3>
        {questions.length === 0 ? (
          <p>No questions asked yet. Be the first!</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="question-item">
              <h4>{q.question}</h4>
              <p>by {q.user}</p>
              {/* Add logic to display answers and form to post new answers */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QAPage;